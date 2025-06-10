import * as handlers from "../src/handlers";

describe("Handler Functions", () => {
  describe("Function Existence", () => {
    it("should export getBins function", () => {
      expect(typeof handlers.getBins).toBe("function");
    });

    it("should export getBin function", () => {
      expect(typeof handlers.getBin).toBe("function");
    });

    it("should export getBinRequests function", () => {
      expect(typeof handlers.getBinRequests).toBe("function");
    });

    it("should export createBin function", () => {
      expect(typeof handlers.createBin).toBe("function");
    });

    it("should export captureWebhook function", () => {
      expect(typeof handlers.captureWebhook).toBe("function");
    });

    it("should export updateBin function", () => {
      expect(typeof handlers.updateBin).toBe("function");
    });

    it("should export deleteBin function", () => {
      expect(typeof handlers.deleteBin).toBe("function");
    });
  });

  describe("Function Types", () => {
    it("should have async functions", () => {
      // All handler functions should be async
      expect(handlers.getBins.constructor.name).toBe("AsyncFunction");
      expect(handlers.getBin.constructor.name).toBe("AsyncFunction");
      expect(handlers.getBinRequests.constructor.name).toBe("AsyncFunction");
      expect(handlers.createBin.constructor.name).toBe("AsyncFunction");
      expect(handlers.captureWebhook.constructor.name).toBe("AsyncFunction");
      expect(handlers.updateBin.constructor.name).toBe("AsyncFunction");
      expect(handlers.deleteBin.constructor.name).toBe("AsyncFunction");
    });
  });
});
