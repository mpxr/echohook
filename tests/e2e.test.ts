import { describe, it, expect, beforeEach } from "vitest";
import app from "../src/index";
import { Env, WebhookBin, WebhookRequest } from "../src/types";
import { createTestToken, createAuthenticatedRequest } from "./setup";

// Enhanced mock environment that maintains state across requests
const createStatefulMockEnv = (): Env => {
  const bins = new Map<string, WebhookBin>();
  const requests = new Map<string, WebhookRequest[]>();
  const createdTokens: { [key: string]: any } = {};
  let binCounter = 0;
  let requestCounter = 0;
  let tokenCounter = 0;

  return {
    ENVIRONMENT: "test",
    WEBHOOKS: {
      idFromName: () => ({ toString: () => "test-id" }),
      get: () => ({
        // Legacy fetch method for backward compatibility
        fetch: async (request: Request) => {
          return new Response(
            JSON.stringify({
              success: false,
              error:
                "This Durable Object now uses RPC-style API. Use direct method calls instead.",
            }),
            { status: 501, headers: { "Content-Type": "application/json" } }
          );
        },

        // RPC-style methods
        async getAllBins() {
          return Array.from(bins.values());
        },

        async getBin(binId: string) {
          return bins.get(binId) || null;
        },

        async getBinRequests(binId: string) {
          return requests.get(binId) || [];
        },

        async createBin(body: any) {
          const id = `bin-${++binCounter}`;
          const bin: WebhookBin = {
            id,
            name: body.name || `Webhook Bin ${id.slice(0, 8)}`,
            description: body.description,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            request_count: 0,
          };
          bins.set(id, bin);
          requests.set(id, []);
          return bin;
        },

        async captureWebhook(binId: string, request: Request) {
          const bin = bins.get(binId);
          if (!bin) {
            throw new Error("Bin not found");
          }

          const headers = Object.fromEntries(request.headers.entries());
          const body = await request.text();
          const url = new URL(request.url);

          const webhookRequest: WebhookRequest = {
            id: `req-${++requestCounter}`,
            bin_id: binId,
            method: request.method,
            url: request.url,
            headers,
            body,
            query_params: Object.fromEntries(url.searchParams.entries()),
            ip_address: "127.0.0.1",
            user_agent: headers["user-agent"] || "",
            content_type: headers["content-type"] || "",
            content_length: body.length,
            received_at: new Date().toISOString(),
          };

          const binRequests = requests.get(binId) || [];
          binRequests.unshift(webhookRequest); // Add to beginning for newest-first ordering
          requests.set(binId, binRequests);

          // Update bin request count
          bin.request_count = binRequests.length;
          bin.updated_at = new Date().toISOString();
          bin.last_request_at = new Date().toISOString();
          bins.set(binId, bin);

          return {
            bin_id: binId,
            request_id: webhookRequest.id,
            message: "Webhook captured successfully",
          };
        },

        async updateBin(binId: string, body: any) {
          const bin = bins.get(binId);
          if (!bin) {
            throw new Error("Bin not found");
          }

          const updatedBin: WebhookBin = {
            ...bin,
            name: body.name !== undefined ? body.name : bin.name,
            description:
              body.description !== undefined
                ? body.description
                : bin.description,
            updated_at: new Date().toISOString(),
          };

          bins.set(binId, updatedBin);
          return updatedBin;
        },

        async deleteBin(binId: string) {
          if (!bins.has(binId)) {
            throw new Error("Bin not found");
          }
          bins.delete(binId);
          requests.delete(binId);
          return { message: "Bin deleted successfully" };
        },

        async createToken(body: any) {
          const tokenId = `token-${++tokenCounter}`;
          const token = `test-token-${Math.random()
            .toString(36)
            .substr(2, 32)}`;

          const tokenData = {
            id: tokenId,
            token: token,
            name: body.name || `API Token ${tokenId.slice(-8)}`,
            description: body.description || undefined,
            created_at: new Date().toISOString(),
            expires_at: body.expiresIn
              ? new Date(
                  Date.now() + parseInt(body.expiresIn) * 24 * 60 * 60 * 1000
                ).toISOString()
              : undefined,
            is_active: true,
          };

          createdTokens[token] = tokenData;
          createdTokens[tokenId] = tokenData;

          return tokenData;
        },

        async getTokens() {
          return Object.values(createdTokens)
            .filter((token: any) => token.id && token.id.startsWith("token-"))
            .map((token: any) => ({
              ...token,
              token: `${token.token.slice(0, 8)}...${token.token.slice(-4)}`, // Mask token
            }));
        },

        async deleteToken(tokenId: string) {
          if (createdTokens[tokenId]) {
            const token = createdTokens[tokenId].token;
            delete createdTokens[tokenId];
            delete createdTokens[token];
            return { message: "Token deleted successfully" };
          }
          throw new Error("Token not found");
        },

        async validateToken(token: string) {
          if (createdTokens[token]) {
            return {
              tokenId: createdTokens[token].id,
              name: createdTokens[token].name,
            };
          }
          throw new Error("Invalid token");
        },
      }),
    } as any,
  };
};

describe("End-to-End Webhook Flow Tests", () => {
  let mockEnv: Env;
  let testToken: string;

  beforeEach(async () => {
    mockEnv = createStatefulMockEnv();
    // Create a test token for authenticated requests
    testToken = await createTestToken(mockEnv);
  });

  describe("Complete Webhook Bin Lifecycle", () => {
    it("should create, use, and manage a webhook bin through its entire lifecycle", async () => {
      // Step 1: Start with empty bins list
      let request = createAuthenticatedRequest(
        "http://localhost/bins",
        {},
        testToken
      );
      let response = await app.fetch(request, mockEnv);
      let data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(0);

      // Step 2: Create a new bin
      const binData = {
        name: "E2E Test Bin",
        description: "End-to-end testing webhook bin",
      };

      request = createAuthenticatedRequest(
        "http://localhost/bins",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(binData),
        },
        testToken
      );
      response = await app.fetch(request, mockEnv);
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
        "http://localhost/bins",
        {},
        testToken
      );
      response = await app.fetch(request, mockEnv);
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

      request = new Request(`http://localhost/webhook/${binId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "TestApp/1.0",
          "X-Event-Type": "user.created",
        },
        body: JSON.stringify(webhook1Data),
      });
      response = await app.fetch(request, mockEnv);
      data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe("Webhook captured successfully");

      // Step 5: Send second webhook with query parameters
      request = new Request(
        `http://localhost/webhook/${binId}?source=github&event_id=456`,
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
      response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(200);

      // Step 6: Send a GET webhook
      request = new Request(
        `http://localhost/webhook/${binId}?health=check&timestamp=${Date.now()}`,
        {
          method: "GET",
          headers: {
            "User-Agent": "HealthChecker/1.0",
          },
        }
      );
      response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(200);

      // Step 7: Check bin status has been updated
      request = createAuthenticatedRequest(
        `http://localhost/bins/${binId}`,
        {},
        testToken
      );
      response = await app.fetch(request, mockEnv);
      data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.data.request_count).toBe(3);
      expect(data.data.last_request_at).toBeDefined();

      // Step 8: Retrieve all requests for the bin
      request = createAuthenticatedRequest(
        `http://localhost/bins/${binId}/requests`,
        {},
        testToken
      );
      response = await app.fetch(request, mockEnv);
      data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(3);

      // Verify first request details
      const firstRequest = data.data[2]; // Third item (oldest) is the first webhook sent
      expect(firstRequest).toMatchObject({
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

      // Verify second request has query params
      const secondRequest = data.data[1]; // Second item is the second webhook sent
      expect(secondRequest.query_params).toMatchObject({
        source: "github",
        event_id: "456",
      });
      expect(secondRequest.headers).toHaveProperty("x-github-event", "push");

      // Verify third request (GET) has no body
      const thirdRequest = data.data[0]; // First item (newest) is the third webhook sent
      expect(thirdRequest.method).toBe("GET");
      expect(thirdRequest.body).toBe("");
      expect(thirdRequest.query_params).toHaveProperty("health", "check");

      // Step 9: Update the bin
      const updateData = {
        name: "Updated E2E Test Bin",
        description: "Updated description for testing",
      };

      request = createAuthenticatedRequest(
        `http://localhost/bins/${binId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        },
        testToken
      );
      response = await app.fetch(request, mockEnv);
      data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.data.name).toBe("Updated E2E Test Bin");
      expect(data.data.description).toBe("Updated description for testing");
      expect(data.data.request_count).toBe(3); // Should preserve request count

      // Step 10: Delete the bin
      request = createAuthenticatedRequest(
        `http://localhost/bins/${binId}`,
        {
          method: "DELETE",
        },
        testToken
      );
      response = await app.fetch(request, mockEnv);
      data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe("Bin deleted successfully");

      // Step 11: Verify bin is gone
      request = createAuthenticatedRequest(
        `http://localhost/bins/${binId}`,
        {},
        testToken
      );
      response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(404);

      // Step 12: Verify bins list is empty again
      request = createAuthenticatedRequest(
        "http://localhost/bins",
        {},
        testToken
      );
      response = await app.fetch(request, mockEnv);
      data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(0);
    });
  });

  describe("Multiple Bins Management", () => {
    it("should handle multiple bins independently", async () => {
      // Create first bin
      let request = createAuthenticatedRequest(
        "http://localhost/bins",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Bin A", description: "First bin" }),
        },
        testToken
      );
      let response = await app.fetch(request, mockEnv);
      const binA = ((await response.json()) as any).data;

      // Create second bin
      request = createAuthenticatedRequest(
        "http://localhost/bins",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Bin B", description: "Second bin" }),
        },
        testToken
      );
      response = await app.fetch(request, mockEnv);
      const binB = ((await response.json()) as any).data;

      // Send webhooks to each bin
      request = new Request(`http://localhost/webhook/${binA.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Hello from A" }),
      });
      await app.fetch(request, mockEnv);

      request = new Request(`http://localhost/webhook/${binB.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Hello from B" }),
      });
      await app.fetch(request, mockEnv);

      // Verify each bin has its own requests
      request = createAuthenticatedRequest(
        `http://localhost/bins/${binA.id}/requests`,
        {},
        testToken
      );
      response = await app.fetch(request, mockEnv);
      let data = (await response.json()) as any;
      expect(data.data).toHaveLength(1);
      expect(JSON.parse(data.data[0].body)).toMatchObject({
        message: "Hello from A",
      });

      request = createAuthenticatedRequest(
        `http://localhost/bins/${binB.id}/requests`,
        {},
        testToken
      );
      response = await app.fetch(request, mockEnv);
      data = (await response.json()) as any;
      expect(data.data).toHaveLength(1);
      expect(JSON.parse(data.data[0].body)).toMatchObject({
        message: "Hello from B",
      });

      // Verify bins list shows both
      request = createAuthenticatedRequest(
        "http://localhost/bins",
        {},
        testToken
      );
      response = await app.fetch(request, mockEnv);
      data = (await response.json()) as any;
      expect(data.data).toHaveLength(2);
    });
  });

  describe("Webhook Content Types", () => {
    it("should handle different content types", async () => {
      // Create a bin
      let request = createAuthenticatedRequest(
        "http://localhost/bins",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Content Type Test" }),
        },
        testToken
      );
      let response = await app.fetch(request, mockEnv);
      const bin = ((await response.json()) as any).data;

      // Send JSON webhook
      request = new Request(`http://localhost/webhook/${bin.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "json", data: { test: true } }),
      });
      await app.fetch(request, mockEnv);

      // Send form data webhook
      const formData = new FormData();
      formData.append("name", "test");
      formData.append("value", "123");

      request = new Request(`http://localhost/webhook/${bin.id}`, {
        method: "POST",
        body: formData,
      });
      await app.fetch(request, mockEnv);

      // Send plain text webhook
      request = new Request(`http://localhost/webhook/${bin.id}`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "This is plain text data",
      });
      await app.fetch(request, mockEnv);

      // Verify all requests were captured
      request = createAuthenticatedRequest(
        `http://localhost/bins/${bin.id}/requests`,
        {},
        testToken
      );
      response = await app.fetch(request, mockEnv);
      const data = (await response.json()) as any;

      expect(data.data).toHaveLength(3);
      // Since we use unshift, newest requests are first
      // Order: text/plain (newest), form-data (middle), JSON (oldest)
      expect(data.data[0].headers["content-type"]).toBe("text/plain");
      expect(data.data[0].body).toBe("This is plain text data");
      expect(data.data[1].headers["content-type"]).toMatch(
        /multipart\/form-data/
      );
      expect(data.data[2].headers["content-type"]).toBe("application/json");
    });
  });
});
