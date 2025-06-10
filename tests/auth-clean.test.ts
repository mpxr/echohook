import { describe, it, expect, beforeEach } from "vitest";
import app from "../src/index";
import { Env } from "../src/types";

describe("Authentication System", () => {
  let mockEnv: Env;
  let createdTokens: { [key: string]: any } = {};
  let tokenCounter = 0;

  beforeEach(() => {
    createdTokens = {};
    tokenCounter = 0;

    mockEnv = {
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
            return [];
          },

          async getBin(binId: string) {
            return null;
          },

          async getBinRequests(binId: string) {
            return [];
          },

          async createBin(body: any) {
            const id = `bin-${++tokenCounter}`;
            return {
              id,
              name: body.name || `Webhook Bin ${id.slice(0, 8)}`,
              description: body.description,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              request_count: 0,
            };
          },

          async captureWebhook(binId: string, request: Request) {
            return {
              bin_id: binId,
              request_id: `req-${Math.random().toString(36).substr(2, 9)}`,
              message: "Webhook captured successfully",
            };
          },

          async updateBin(binId: string, body: any) {
            return {
              id: binId,
              name: body.name || "Updated Bin",
              description: body.description,
              updated_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              request_count: 0,
            };
          },

          async deleteBin(binId: string) {
            return { message: "Bin and all requests deleted successfully" };
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
  });

  describe("Token Creation", () => {
    it("should create an API token without authentication", async () => {
      const request = new Request("http://localhost/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Token",
          description: "Token for testing",
          expiresIn: "30",
        }),
      });

      const response = await app.fetch(request, mockEnv);
      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("token");
      expect(data.data.name).toBe("Test Token");
      expect(data.data.description).toBe("Token for testing");
    });

    it("should create a token with minimal data", async () => {
      const request = new Request("http://localhost/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const response = await app.fetch(request, mockEnv);
      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("token");
      expect(data.data.name).toContain("API Token");
    });
  });

  describe("Authentication Middleware", () => {
    let validToken: string;

    beforeEach(async () => {
      // Create a token first
      const tokenRequest = new Request("http://localhost/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test Token" }),
      });

      const tokenResponse = await app.fetch(tokenRequest, mockEnv);
      const tokenData = await tokenResponse.json();
      validToken = tokenData.data.token;
    });

    it("should allow access to root endpoint without token", async () => {
      const request = new Request("http://localhost/");
      const response = await app.fetch(request, mockEnv);
      expect(response.status).toBe(200);
    });

    it("should allow token creation without authentication", async () => {
      const request = new Request("http://localhost/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Another Token" }),
      });

      const response = await app.fetch(request, mockEnv);
      expect(response.status).toBe(201);
    });

    it("should reject requests to protected endpoints without token", async () => {
      const request = new Request("http://localhost/bins");
      const response = await app.fetch(request, mockEnv);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain("Missing Authorization header");
    });

    it("should reject requests with invalid token format", async () => {
      const request = new Request("http://localhost/bins", {
        headers: { Authorization: "InvalidFormat" },
      });

      const response = await app.fetch(request, mockEnv);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain("Invalid Authorization header format");
    });

    it("should reject requests with invalid token", async () => {
      const request = new Request("http://localhost/bins", {
        headers: { Authorization: "Bearer invalid-token" },
      });

      const response = await app.fetch(request, mockEnv);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain("Invalid token");
    });

    it("should allow access to protected endpoints with valid token", async () => {
      const request = new Request("http://localhost/bins", {
        headers: { Authorization: `Bearer ${validToken}` },
      });

      const response = await app.fetch(request, mockEnv);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe("Token Management", () => {
    let validToken: string;

    beforeEach(async () => {
      // Create a token first
      const tokenRequest = new Request("http://localhost/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test Token" }),
      });

      const tokenResponse = await app.fetch(tokenRequest, mockEnv);
      const tokenData = await tokenResponse.json();
      validToken = tokenData.data.token;
    });

    it("should list tokens with authentication", async () => {
      const request = new Request("http://localhost/auth/tokens", {
        headers: { Authorization: `Bearer ${validToken}` },
      });

      const response = await app.fetch(request, mockEnv);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);

      // Check that tokens are masked
      const token = data.data[0];
      expect(token.token).toMatch(/^.{8}\.{3}.{4}$/);
    });

    it("should delete tokens with authentication", async () => {
      // First get the list of tokens to find a token ID
      const listRequest = new Request("http://localhost/auth/tokens", {
        headers: { Authorization: `Bearer ${validToken}` },
      });

      const listResponse = await app.fetch(listRequest, mockEnv);
      const listData = await listResponse.json();
      const tokenId = listData.data[0].id;

      // Delete the token
      const deleteRequest = new Request(
        `http://localhost/auth/tokens/${tokenId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${validToken}` },
        }
      );

      const response = await app.fetch(deleteRequest, mockEnv);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain("Token deleted successfully");
    });
  });
});
