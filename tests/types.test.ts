import { describe, it, expect } from "vitest";
import { WebhookBin, WebhookRequest, ApiResponse } from "../src/types";

describe("Type Definitions", () => {
  describe("WebhookBin", () => {
    it("should have correct structure", () => {
      const bin: WebhookBin = {
        id: "test-id",
        name: "Test Bin",
        description: "Test Description",
        created_at: new Date(),
        updated_at: new Date(),
        request_count: 0,
      };

      expect(bin.id).toBe("test-id");
      expect(bin.name).toBe("Test Bin");
      expect(bin.description).toBe("Test Description");
      expect(typeof bin.created_at).toBe("object");
      expect(typeof bin.updated_at).toBe("object");
      expect(bin.request_count).toBe(0);
    });
  });

  describe("WebhookRequest", () => {
    it("should have correct structure", () => {
      const request: WebhookRequest = {
        id: "request-id",
        bin_id: "bin-id",
        method: "POST",
        url: "https://example.com/webhook",
        headers: { "Content-Type": "application/json" },
        body: '{"test": "data"}',
        received_at: new Date(),
      };

      expect(request.id).toBe("request-id");
      expect(request.bin_id).toBe("bin-id");
      expect(request.method).toBe("POST");
      expect(request.url).toBe("https://example.com/webhook");
      expect(request.headers).toEqual({ "Content-Type": "application/json" });
      expect(request.body).toBe('{"test": "data"}');
      expect(typeof request.received_at).toBe("object");
    });
  });

  describe("ApiResponse", () => {
    it("should have correct structure for success", () => {
      const response: ApiResponse<string> = {
        success: true,
        data: "test data",
        message: "Success",
      };

      expect(response.success).toBe(true);
      expect(response.data).toBe("test data");
      expect(response.message).toBe("Success");
    });

    it("should have correct structure for error", () => {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: "Error occurred",
        error: "Detailed error message",
      };

      expect(response.success).toBe(false);
      expect(response.data).toBe(null);
      expect(response.message).toBe("Error occurred");
      expect(response.error).toBe("Detailed error message");
    });
  });
});
