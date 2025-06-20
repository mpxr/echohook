import { Hono } from "hono";
import { Env } from "./types.js";
import {
  getBins,
  getBin,
  getBinRequests,
  createBin,
  updateBin,
  deleteBin,
  captureWebhook,
  createToken,
  deleteToken,
} from "./handlers/index";

export function setupRoutes(app: Hono<{ Bindings: Env }>) {
  // API health check
  app.get("/api", (c) => {
    return c.json({
      message: "EchoHook - Webhook Bin Service",
      environment: c.env.ENVIRONMENT,
    });
  });

  // Authentication endpoints under /api
  app.post("/api/auth/token", createToken);
  app.delete("/api/auth/tokens/:tokenId", deleteToken);

  // Bin management endpoints under /api
  app.get("/api/bins", getBins);
  app.get("/api/bins/:binId", getBin);
  app.get("/api/bins/:binId/requests", getBinRequests);
  app.post("/api/bins", createBin);
  app.put("/api/bins/:binId", updateBin);
  app.delete("/api/bins/:binId", deleteBin);

  // Webhook capture endpoint under /api
  app.all("/api/webhook/:binId", captureWebhook);
}
