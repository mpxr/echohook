import { Hono } from "hono";
import { Env } from "./types.js";
import { HTML_CONTENT } from "./html.js";
import { generateApiDocsHTML } from "./api-docs.js";
import {
  getBins,
  getBin,
  getBinRequests,
  createBin,
  updateBin,
  deleteBin,
  captureWebhook,
  createToken,
  getTokens,
  deleteToken,
} from "./handlers/index";

export function setupRoutes(app: Hono<{ Bindings: Env }>) {
  // Serve HTML landing page at root
  app.get("/", (c) => {
    return c.html(HTML_CONTENT);
  });

  // Serve API documentation page
  app.get("/docs/api", (c) => {
    return c.html(generateApiDocsHTML());
  });

  // API health check
  app.get("/api", (c) => {
    return c.json({
      message: "EchoHook - Webhook Bin Service",
      environment: c.env.ENVIRONMENT,
    });
  });

  // Authentication endpoints under /api
  app.post("/api/auth/token", createToken);
  app.get("/api/auth/tokens", getTokens);
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
