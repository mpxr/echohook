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
} from "./handlers/index";

export function setupRoutes(app: Hono<{ Bindings: Env }>) {
  app.get("/", (c) => {
    return c.json({
      message: "EchoHook - Webhook Bin Service",
      environment: c.env.ENVIRONMENT,
    });
  });

  app.post("/auth/token", createToken);
  app.get("/auth/tokens", getTokens);
  app.delete("/auth/tokens/:tokenId", deleteToken);

  app.get("/bins", getBins);
  app.get("/bins/:binId", getBin);
  app.get("/bins/:binId/requests", getBinRequests);
  app.post("/bins", createBin);
  app.put("/bins/:binId", updateBin);
  app.delete("/bins/:binId", deleteBin);

  app.all("/webhook/:binId", captureWebhook);
}
