import { describe, it, expect, beforeEach, vi } from "vitest";
import { WebhooksStorage } from "../src/storage";

describe("WebhooksStorage", () => {
  let storage: WebhooksStorage;
  let mockState: any;
  let mockEnv: any;

  beforeEach(() => {
    mockState = {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
      storage: {
        list: vi.fn(),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      },
    };

    mockEnv = {
      ENVIRONMENT: "test",
    };

    storage = new WebhooksStorage(mockState, mockEnv);
  });

  describe("constructor", () => {
    it("should create a WebhooksStorage instance", () => {
      expect(storage).toBeInstanceOf(WebhooksStorage);
    });
  });

  describe("fetch", () => {
    it("should return 501 status for legacy fetch handler", async () => {
      const request = new Request("http://localhost/bins", { method: "GET" });

      const response = await storage.fetch(request);
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(501);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain("RPC-style API");
    });
  });

  describe("RPC methods", () => {
    it("should get all bins", async () => {
      // Mock the bins data
      const mockBins = new Map();
      mockBins.set("bin:test-bin-1", {
        id: "test-bin-1",
        name: "Test Bin 1",
        created_at: new Date().toISOString(),
      });
      mockBins.set("bin:test-bin-2", {
        id: "test-bin-2",
        name: "Test Bin 2",
        created_at: new Date().toISOString(),
      });

      mockState.storage.list.mockResolvedValue(mockBins);

      const bins = await storage.getAllBins();
      expect(Array.isArray(bins)).toBe(true);
      expect(bins.length).toBe(2);
    });

    it("should handle errors gracefully", async () => {
      // Mock an error
      mockState.storage.list.mockRejectedValue(new Error("Storage error"));

      await expect(storage.getAllBins()).rejects.toThrow("Storage error");
    });
  });
});
