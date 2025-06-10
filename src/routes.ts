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
  getTokens,
  deleteToken,
} from "./handlers.js";

export function setupRoutes(app: Hono<{ Bindings: Env }>) {
  app.get("/", (c) => {
    return c.json({
      message: "EchoHook - Webhook Bin Service",
      environment: c.env.ENVIRONMENT,
      storage: "Durable Objects",
      authentication: "Token-based (Bearer tokens)",
      endpoints: {
        // Authentication
        createToken: "POST /auth/token",
        getTokens: "GET /auth/tokens",
        deleteToken: "DELETE /auth/tokens/:tokenId",
        // Webhook bins
        bins: "GET /bins",
        createBin: "POST /bins",
        getBin: "GET /bins/:binId",
        updateBin: "PUT /bins/:binId",
        deleteBin: "DELETE /bins/:binId",
        getBinRequests: "GET /bins/:binId/requests",
        captureWebhook: "POST /webhook/:binId (accepts any HTTP method)",
      },
      usage: {
        step1: 'Create a token: POST /auth/token with { "name": "My Token" }',
        step2: "Use token in all requests: Authorization: Bearer <your_token>",
        step3: "Create bins and capture webhooks with authenticated requests",
      },
    });
  });

  // Authentication routes
  app.post("/auth/token", createToken);
  app.get("/auth/tokens", getTokens);
  app.delete("/auth/tokens/:tokenId", deleteToken);

  // Webhook bin routes (all require authentication)
  app.get("/bins", getBins);
  app.get("/bins/:binId", getBin);
  app.get("/bins/:binId/requests", getBinRequests);
  app.post("/bins", createBin);
  app.put("/bins/:binId", updateBin);
  app.delete("/bins/:binId", deleteBin);

  // Webhook capture route (requires authentication)
  app.all("/webhook/:binId", captureWebhook);
}
