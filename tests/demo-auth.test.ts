import { describe, it, expect, beforeEach } from "vitest";
import app from "../src/index";
import { Env, WebhookBin, WebhookRequest } from "../src/types";
import { createTestToken, createAuthenticatedRequest } from "./setup";

describe("Authentication Demo Flow", () => {
  let mockEnv: Env;
  let createdTokens: { [key: string]: any } = {};
  let tokenCounter = 0;
  let binCounter = 0;
  let requestCounter = 0;
  const bins = new Map<string, WebhookBin>();
  const requests = new Map<string, WebhookRequest[]>();

  beforeEach(() => {
    createdTokens = {};
    tokenCounter = 0;
    binCounter = 0;
    requestCounter = 0;
    bins.clear();
    requests.clear();

    mockEnv = {
      ENVIRONMENT: "test",
      WEBHOOKS: {
        idFromName: () => ({ toString: () => "test-id" }),
        get: () => ({
          // Add a dummy fetch method to satisfy DurableObjectStub
          fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
            // You can customize this mock as needed for your tests
            return new Response(JSON.stringify({ message: "Mock fetch" }), {
              status: 200,
            });
          },

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

          async createRequest(binId: string, requestData: any) {
            const id = `req-${++requestCounter}`;
            const request: WebhookRequest = {
              id,
              bin_id: binId,
              method: requestData.method || "POST",
              url: requestData.url || `/webhook/${binId}`,
              headers: requestData.headers || {},
              body:
                typeof requestData.body === "string"
                  ? requestData.body
                  : JSON.stringify(requestData.body || {}),
              query_params: {},
              ip_address: requestData.ip_address || "127.0.0.1",
              user_agent: requestData.user_agent || "Test Agent",
              received_at: new Date().toISOString(),
            };

            const binRequests = requests.get(binId) || [];
            binRequests.push(request);
            requests.set(binId, binRequests);

            // Update bin request count
            const bin = bins.get(binId);
            if (bin) {
              bin.request_count = binRequests.length;
              bin.updated_at = new Date().toISOString();
              bins.set(binId, bin);
            }

            return request;
          },

          async deleteBin(binId: string) {
            const deleted = bins.delete(binId);
            requests.delete(binId);
            return deleted;
          },

          async deleteRequest(requestId: string) {
            for (const [binId, binRequests] of requests.entries()) {
              const index = binRequests.findIndex(
                (req) => req.id === requestId
              );
              if (index !== -1) {
                binRequests.splice(index, 1);
                requests.set(binId, binRequests);

                // Update bin request count
                const bin = bins.get(binId);
                if (bin) {
                  bin.request_count = binRequests.length;
                  bin.updated_at = new Date().toISOString();
                  bins.set(binId, bin);
                }
                return true;
              }
            }
            return false;
          },

          // Token management methods
          async createToken(tokenData: any) {
            if (!tokenData.name) {
              throw new Error("Token name is required");
            }

            const id = `token-${++tokenCounter}`;
            const token = {
              id,
              token: `test-token-${id}-${Date.now()}`,
              name: tokenData.name,
              description: tokenData.description,
              created_at: new Date().toISOString(),
              expires_at: tokenData.expiresIn
                ? new Date(
                    Date.now() +
                      parseInt(tokenData.expiresIn) * 24 * 60 * 60 * 1000
                  ).toISOString()
                : null,
              last_used: null,
            };
            createdTokens[token.token] = token;
            return token;
          },

          async validateToken(tokenString: string) {
            const token = createdTokens[tokenString];
            if (!token) {
              throw new Error("Invalid or expired token");
            }

            // Check if token is expired
            if (token.expires_at && new Date() > new Date(token.expires_at)) {
              throw new Error("Invalid or expired token");
            }

            // Update last_used
            token.last_used = new Date().toISOString();
            return {
              tokenId: token.id,
              name: token.name,
            };
          },

          async getTokens() {
            return Object.values(createdTokens);
          },

          async deleteToken(tokenId: string) {
            for (const [tokenString, token] of Object.entries(createdTokens)) {
              if (token.id === tokenId) {
                delete createdTokens[tokenString];
                return { message: "Token deleted successfully" };
              }
            }
            throw new Error("Token not found");
          },

          async captureWebhook(binId: string, request: Request) {
            const targetBin = bins.get(binId);
            if (!targetBin) {
              throw new Error("Bin not found");
            }

            const body = await request.text();
            const requestData = {
              method: request.method,
              url: request.url,
              headers: Object.fromEntries(request.headers.entries()),
              body: body,
              ip_address: "127.0.0.1",
              user_agent: request.headers.get("user-agent") || "Test Agent",
            };

            const id = `req-${++requestCounter}`;
            const capturedRequest: WebhookRequest = {
              id,
              bin_id: binId,
              method: requestData.method,
              url: requestData.url,
              headers: requestData.headers,
              body: requestData.body,
              query_params: {},
              ip_address: requestData.ip_address,
              user_agent: requestData.user_agent,
              received_at: new Date().toISOString(),
            };

            const binRequests = requests.get(binId) || [];
            binRequests.push(capturedRequest);
            requests.set(binId, binRequests);

            // Update bin request count
            const updatedBin = bins.get(binId);
            if (updatedBin) {
              updatedBin.request_count = binRequests.length;
              updatedBin.updated_at = new Date().toISOString();
              bins.set(binId, updatedBin);
            }

            return {
              data: capturedRequest,
              message: "Webhook captured successfully",
            };
          },
        }),
      },
    };
  });

  describe("Complete Authentication Flow", () => {
    it("should execute the complete demo authentication flow successfully", async () => {
      // Step 1: Check API info
      const infoRequest = new Request("http://localhost/");
      const infoResponse = await app.fetch(infoRequest, mockEnv);

      expect(infoResponse.ok).toBe(true);
      const infoData = (await infoResponse.json()) as any;
      expect(infoData.message).toBe("EchoHook - Webhook Bin Service");
      expect(infoData.environment).toBe("test");

      // Step 2: Create an API token
      const tokenRequest = new Request("http://localhost/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Demo Token",
          description: "Token for testing authentication",
          expiresIn: "30",
        }),
      });

      const tokenResponse = await app.fetch(tokenRequest, mockEnv);
      expect(tokenResponse.ok).toBe(true);
      const tokenData = (await tokenResponse.json()) as any;
      expect(tokenData.success).toBe(true);
      expect(tokenData.data.token).toBeDefined();
      expect(tokenData.data.name).toBe("Demo Token");

      const token = tokenData.data.token;

      // Step 3: Try accessing protected endpoint without token (should fail)
      const unauthedRequest = new Request("http://localhost/bins");
      const unauthedResponse = await app.fetch(unauthedRequest, mockEnv);

      expect(unauthedResponse.status).toBe(401);
      const unauthedData = (await unauthedResponse.json()) as any;
      expect(unauthedData.success).toBe(false);
      expect(unauthedData.error).toContain("Authorization header"); // Step 4: Try accessing with token (should succeed)
      const authedRequest = createAuthenticatedRequest(
        "http://localhost/bins",
        {},
        token
      );
      const authedResponse = await app.fetch(authedRequest, mockEnv);

      expect(authedResponse.ok).toBe(true);
      const binsData = (await authedResponse.json()) as any;
      expect(binsData.success).toBe(true);
      expect(Array.isArray(binsData.data)).toBe(true);

      // Step 5: Create a webhook bin
      const createBinRequest = createAuthenticatedRequest(
        "http://localhost/bins",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Test Bin",
            description: "A test webhook bin",
          }),
        },
        token
      );

      const createBinResponse = await app.fetch(createBinRequest, mockEnv);
      expect(createBinResponse.ok).toBe(true);

      const binData = (await createBinResponse.json()) as any;
      expect(binData.success).toBe(true);
      expect(binData.data.id).toBeDefined();
      expect(binData.data.name).toBe("Test Bin");
      expect(binData.data.description).toBe("A test webhook bin");

      const binId = binData.data.id;

      // Step 6: Capture a test webhook
      const webhookRequest = createAuthenticatedRequest(
        `http://localhost/webhook/${binId}?test=true`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            test: "webhook",
            timestamp: new Date().toISOString(),
          }),
        },
        token
      );

      const webhookResponse = await app.fetch(webhookRequest, mockEnv);
      expect(webhookResponse.ok).toBe(true);

      const webhookData = (await webhookResponse.json()) as any;
      expect(webhookData.success).toBe(true);

      // Step 7: Get bin requests
      const getRequestsRequest = createAuthenticatedRequest(
        `http://localhost/bins/${binId}/requests`,
        {},
        token
      );

      const getRequestsResponse = await app.fetch(getRequestsRequest, mockEnv);
      expect(getRequestsResponse.ok).toBe(true);

      const requestsData = (await getRequestsResponse.json()) as any;
      expect(requestsData.success).toBe(true);
      expect(Array.isArray(requestsData.data)).toBe(true);
      expect(requestsData.data.length).toBeGreaterThan(0);

      // Verify the captured request
      const capturedRequest = requestsData.data[0];
      expect(capturedRequest.method).toBe("POST");
      expect(capturedRequest.bin_id).toBe(binId);
      const bodyObj = JSON.parse(capturedRequest.body);
      expect(bodyObj.test).toBe("webhook");

      // Step 8: List API tokens
      const listTokensRequest = createAuthenticatedRequest(
        "http://localhost/auth/tokens",
        {},
        token
      );

      const listTokensResponse = await app.fetch(listTokensRequest, mockEnv);
      expect(listTokensResponse.ok).toBe(true);

      const tokensData = (await listTokensResponse.json()) as any;
      expect(tokensData.success).toBe(true);
      expect(Array.isArray(tokensData.data)).toBe(true);
      expect(tokensData.data.length).toBeGreaterThan(0);

      // Verify our token is in the list
      const ourToken = tokensData.data.find(
        (t: any) => t.name === "Demo Token"
      );
      expect(ourToken).toBeDefined();
      expect(ourToken.description).toBe("Token for testing authentication");
    });

    it("should handle token expiration correctly", async () => {
      // Create a token and manually expire it
      const tokenRequest = new Request("http://localhost/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Short-lived Token",
          description: "Token that expires quickly",
          expiresIn: "1", // Expires in 1 day initially
        }),
      });

      const tokenResponse = await app.fetch(tokenRequest, mockEnv);
      expect(tokenResponse.ok).toBe(true);

      const tokenData = (await tokenResponse.json()) as any;
      const token = tokenData.data.token;

      // Manually expire the token by setting its expiration to the past
      createdTokens[token].expires_at = new Date(
        Date.now() - 1000
      ).toISOString();

      // Try to use the expired token
      const authedRequest = createAuthenticatedRequest(
        "http://localhost/bins",
        {},
        token
      );
      const authedResponse = await app.fetch(authedRequest, mockEnv);

      expect(authedResponse.status).toBe(401);
      const errorData = (await authedResponse.json()) as any;
      expect(errorData.success).toBe(false);
      expect(errorData.error).toContain("Invalid or expired token");
    });
    it("should handle invalid tokens correctly", async () => {
      const fakeToken = "fake-token-123";

      const authedRequest = createAuthenticatedRequest(
        "http://localhost/bins",
        {},
        fakeToken
      );
      const authedResponse = await app.fetch(authedRequest, mockEnv);

      expect(authedResponse.status).toBe(401);
      const errorData = (await authedResponse.json()) as any;
      expect(errorData.success).toBe(false);
      expect(errorData.error).toContain("Invalid or expired token");
    });

    it("should handle malformed authorization headers", async () => {
      const request = new Request("http://localhost/bins", {
        headers: {
          Authorization: "Invalid format",
        },
      });

      const response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(401);
      const errorData = (await response.json()) as any;
      expect(errorData.success).toBe(false);
      expect(errorData.error).toContain("Invalid Authorization header");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should allow webhook capture without authentication (public endpoint)", async () => {
      // First create a bin with authentication
      const token = await createTestToken(mockEnv, "Test Token");

      const createBinRequest = createAuthenticatedRequest(
        "http://localhost/bins",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Test Bin",
            description: "A test webhook bin",
          }),
        },
        token
      );

      const createBinResponse = await app.fetch(createBinRequest, mockEnv);
      const binData = (await createBinResponse.json()) as any;
      const binId = binData.data.id;

      // Try to capture webhook without authentication
      const webhookRequest = new Request(`http://localhost/webhook/${binId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "webhook" }),
      });

      const webhookResponse = await app.fetch(webhookRequest, mockEnv);
      // Webhook capture should work without auth since middleware skips auth for /webhook/ paths
      expect(webhookResponse.status).toBe(200);
    });

    it("should handle token creation with missing fields", async () => {
      const tokenRequest = new Request("http://localhost/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Missing required fields
      });

      const tokenResponse = await app.fetch(tokenRequest, mockEnv);

      // Should return 500 due to missing name field
      expect(tokenResponse.status).toBe(500);
    });
  });
});
