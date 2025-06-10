import { describe, it, expect, beforeEach } from "vitest";
import app from "../src/index";
import { Env } from "../src/types";
import { createTestToken, createAuthenticatedRequest } from "./setup";

// Mock environment with performance tracking
const createPerformanceMockEnv = (): Env => {
  const processingTimes: number[] = [];
  let tokenCounter = 0;
  let binCounter = 0;
  const createdTokens: { [key: string]: any } = {};

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
          // Simulate some processing delay
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 10)
          );
          return [];
        },

        async getBin(binId: string) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 5)
          );
          return null;
        },

        async getBinRequests(binId: string) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 5)
          );
          return [];
        },

        async createBin(body: any) {
          const startTime = Date.now();

          // Simulate some processing delay
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 10)
          );

          const id = `bin-${++binCounter}`;
          const bin = {
            id,
            name: body.name || `Webhook Bin ${id.slice(0, 8)}`,
            description: body.description,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            request_count: 0,
          };

          const endTime = Date.now();
          processingTimes.push(endTime - startTime);

          return bin;
        },

        async captureWebhook(binId: string, request: Request) {
          const startTime = Date.now();

          // Simulate some processing delay
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 15)
          );

          const result = {
            bin_id: binId,
            request_id: `req-${Math.random().toString(36).substr(2, 9)}`,
            message: "Webhook captured successfully",
          };

          const endTime = Date.now();
          processingTimes.push(endTime - startTime);

          return result;
        },

        async updateBin(binId: string, body: any) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 8)
          );
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
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 5)
          );
          return { message: "Bin and all requests deleted successfully" };
        },

        async createToken(body: any) {
          const startTime = Date.now();

          // Simulate some processing delay
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 10)
          );

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

          const endTime = Date.now();
          processingTimes.push(endTime - startTime);

          return tokenData;
        },

        async getTokens() {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 5)
          );
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
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 3)
          );
          if (createdTokens[token]) {
            return {
              tokenId: createdTokens[token].id,
              name: createdTokens[token].name,
            };
          }
          throw new Error("Invalid token");
        },

        // Method to get performance metrics
        getPerformanceMetrics() {
          return {
            processingTimes: [...processingTimes],
            averageTime:
              processingTimes.length > 0
                ? processingTimes.reduce((a, b) => a + b, 0) /
                  processingTimes.length
                : 0,
            maxTime: Math.max(...processingTimes),
            minTime: Math.min(...processingTimes),
          };
        },
      }),
    } as any,
  };
};

describe("Performance and Stress Tests", () => {
  let mockEnv: Env;
  let testToken: string;

  beforeEach(async () => {
    mockEnv = createPerformanceMockEnv();
    testToken = await createTestToken(mockEnv);
  });

  describe("Response Time Tests", () => {
    it("should respond to root endpoint quickly", async () => {
      const startTime = Date.now();

      const request = new Request("http://localhost/");
      const response = await app.fetch(request, mockEnv);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(100); // Should respond in under 100ms
    });

    it("should handle bin creation efficiently", async () => {
      const times: number[] = [];

      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();

        const request = createAuthenticatedRequest(
          "http://localhost/bins",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: `Performance Test Bin ${i}` }),
          },
          testToken
        );

        const response = await app.fetch(request, mockEnv);
        const endTime = Date.now();

        expect(response.status).toBe(201);
        times.push(endTime - startTime);
      }

      const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);

      expect(averageTime).toBeLessThan(50); // Average under 50ms
      expect(maxTime).toBeLessThan(200); // Max under 200ms

      console.log(
        `Bin creation - Average: ${averageTime.toFixed(2)}ms, Max: ${maxTime}ms`
      );
    });

    it("should handle webhook capture efficiently", async () => {
      const times: number[] = [];
      const binId = "performance-test-bin";

      for (let i = 0; i < 20; i++) {
        const startTime = Date.now();

        const request = new Request(`http://localhost/webhook/${binId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_id: i,
            timestamp: Date.now(),
            data: { test: true, iteration: i },
          }),
        });

        const response = await app.fetch(request, mockEnv);
        const endTime = Date.now();

        expect(response.status).toBe(200);
        times.push(endTime - startTime);
      }

      const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);

      expect(averageTime).toBeLessThan(100); // Average under 100ms
      expect(maxTime).toBeLessThan(300); // Max under 300ms

      console.log(
        `Webhook capture - Average: ${averageTime.toFixed(
          2
        )}ms, Min: ${minTime}ms, Max: ${maxTime}ms`
      );
    });
  });

  describe("Concurrent Request Handling", () => {
    it("should handle multiple concurrent bin creations", async () => {
      const promises = [];

      for (let i = 0; i < 15; i++) {
        const promise = app.fetch(
          createAuthenticatedRequest(
            "http://localhost/bins",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: `Concurrent Bin ${i}` }),
            },
            testToken
          ),
          mockEnv
        );

        promises.push(promise);
      }

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const endTime = Date.now();

      const totalTime = endTime - startTime;

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(201);
      });

      // Should handle 15 concurrent requests in reasonable time
      expect(totalTime).toBeLessThan(1000); // Under 1 second

      console.log(`15 concurrent bin creations completed in ${totalTime}ms`);
    });
  });
});
