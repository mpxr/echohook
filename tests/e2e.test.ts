import { describe, it, expect, beforeEach } from "vitest";
import { SELF } from "cloudflare:test";
import { createTestToken, createAuthenticatedRequest } from "./setup";

describe("End-to-End Webhook Flow Tests", () => {
  let testToken: string;

  beforeEach(async () => {
    testToken = await createTestToken(SELF);
  });

  describe("Complete Webhook Bin Lifecycle", () => {
    it("should create, use, and manage a webhook bin through its entire lifecycle", async () => {
      // Step 1: Start with empty bins list
      let request = createAuthenticatedRequest(
        "http://localhost/api/bins",
        {},
        testToken
      );
      let response = await SELF.fetch(request);
      let data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(0);

      // Step 2: Create a new bin
      const binData = {
        name: "E2E Test Bin",
        description: "End-to-end testing webhook bin",
      };

      request = createAuthenticatedRequest(
        "http://localhost/api/bins",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(binData),
        },
        testToken
      );
      response = await SELF.fetch(request);
      data = (await response.json()) as any;

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);

      const binId = data.data.id;
      expect(binId).toBeDefined();
      expect(data.data.name).toBe("E2E Test Bin");
      expect(data.data.request_count).toBe(0);
      expect(data.data.last_request_at).toBeUndefined();

      // Step 3: Verify bin appears in bins list
      request = createAuthenticatedRequest(
        "http://localhost/api/bins",
        {},
        testToken
      );
      response = await SELF.fetch(request);
      data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].id).toBe(binId);

      // Step 4: Send first webhook to the bin
      const webhook1Data = {
        event: "user.created",
        user_id: 123,
        email: "test@example.com",
      };

      request = new Request(`http://localhost/api/webhook/${binId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "TestApp/1.0",
          "X-Event-Type": "user.created",
        },
        body: JSON.stringify(webhook1Data),
      });
      response = await SELF.fetch(request);
      data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe("Webhook captured successfully");

      // Step 5: Send second webhook with query parameters
      request = new Request(
        `http://localhost/api/webhook/${binId}?source=github&event_id=456`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-GitHub-Event": "push",
          },
          body: JSON.stringify({
            repository: "test/repo",
            ref: "refs/heads/main",
          }),
        }
      );
      response = await SELF.fetch(request);

      expect(response.status).toBe(200);

      // Step 6: Send a GET webhook
      request = new Request(
        `http://localhost/api/webhook/${binId}?health=check&timestamp=${Date.now()}`,
        {
          method: "GET",
          headers: {
            "User-Agent": "HealthChecker/1.0",
          },
        }
      );
      response = await SELF.fetch(request);

      expect(response.status).toBe(200);

      // Step 7: Check bin status has been updated
      request = createAuthenticatedRequest(
        `http://localhost/api/bins/${binId}`,
        {},
        testToken
      );
      response = await SELF.fetch(request);
      data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.data.request_count).toBe(3);
      expect(data.data.last_request_at).toBeDefined();

      // Step 8: Retrieve all requests for the bin
      request = createAuthenticatedRequest(
        `http://localhost/api/bins/${binId}/requests`,
        {},
        testToken
      );
      response = await SELF.fetch(request);
      data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(3);

      // Verify first request details (requests are sorted newest first)
      const newestRequest = data.data[0]; // Most recent (GET request)
      expect(newestRequest.method).toBe("GET");
      expect(newestRequest.query_params).toHaveProperty("health", "check");

      const middleRequest = data.data[1]; // Second webhook (POST with query params)
      expect(middleRequest.query_params).toMatchObject({
        source: "github",
        event_id: "456",
      });
      expect(middleRequest.headers).toHaveProperty("x-github-event", "push");

      const oldestRequest = data.data[2]; // First webhook sent
      expect(oldestRequest).toMatchObject({
        bin_id: binId,
        method: "POST",
        headers: expect.objectContaining({
          "content-type": "application/json",
          "user-agent": "TestApp/1.0",
          "x-event-type": "user.created",
        }),
        body: JSON.stringify(webhook1Data),
        content_type: "application/json",
        received_at: expect.any(String),
      });

      // Step 9: Update the bin
      const updateData = {
        name: "Updated E2E Test Bin",
        description: "Updated description for testing",
      };

      request = createAuthenticatedRequest(
        `http://localhost/api/bins/${binId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        },
        testToken
      );
      response = await SELF.fetch(request);
      data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.data.name).toBe("Updated E2E Test Bin");
      expect(data.data.description).toBe("Updated description for testing");
      expect(data.data.request_count).toBe(3); // Should preserve request count

      // Step 10: Delete the bin
      request = createAuthenticatedRequest(
        `http://localhost/api/bins/${binId}`,
        {
          method: "DELETE",
        },
        testToken
      );
      response = await SELF.fetch(request);
      data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe("Bin and all requests deleted successfully");

      // Step 11: Verify bin is gone
      request = createAuthenticatedRequest(
        `http://localhost/api/bins/${binId}`,
        {},
        testToken
      );
      response = await SELF.fetch(request);

      expect(response.status).toBe(404);

      // Step 12: Verify bins list is empty again
      request = createAuthenticatedRequest(
        "http://localhost/api/bins",
        {},
        testToken
      );
      response = await SELF.fetch(request);
      data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(0);
    });
  });

  describe("Multiple Bins Management", () => {
    it("should handle multiple bins independently", async () => {
      // Create first bin
      let request = createAuthenticatedRequest(
        "http://localhost/api/bins",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Bin A", description: "First bin" }),
        },
        testToken
      );
      let response = await SELF.fetch(request);
      const binA = ((await response.json()) as any).data;

      // Create second bin
      request = createAuthenticatedRequest(
        "http://localhost/api/bins",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Bin B", description: "Second bin" }),
        },
        testToken
      );
      response = await SELF.fetch(request);
      const binB = ((await response.json()) as any).data;

      // Send webhooks to each bin
      request = new Request(`http://localhost/api/webhook/${binA.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Hello from A" }),
      });
      await SELF.fetch(request);

      request = new Request(`http://localhost/api/webhook/${binB.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Hello from B" }),
      });
      await SELF.fetch(request);

      // Verify each bin has its own requests
      request = createAuthenticatedRequest(
        `http://localhost/api/bins/${binA.id}/requests`,
        {},
        testToken
      );
      response = await SELF.fetch(request);
      let data = (await response.json()) as any;
      expect(data.data).toHaveLength(1);
      expect(JSON.parse(data.data[0].body)).toMatchObject({
        message: "Hello from A",
      });

      request = createAuthenticatedRequest(
        `http://localhost/api/bins/${binB.id}/requests`,
        {},
        testToken
      );
      response = await SELF.fetch(request);
      data = (await response.json()) as any;
      expect(data.data).toHaveLength(1);
      expect(JSON.parse(data.data[0].body)).toMatchObject({
        message: "Hello from B",
      });

      // Verify bins list shows both
      request = createAuthenticatedRequest(
        "http://localhost/api/bins",
        {},
        testToken
      );
      response = await SELF.fetch(request);
      data = (await response.json()) as any;
      expect(data.data).toHaveLength(2);
    });
  });
});
