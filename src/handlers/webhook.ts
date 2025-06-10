import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "../logger.js";
import { Env } from "../types.js";
import { getDurableObject } from "../utils.js";

export async function captureWebhook(c: Context<{ Bindings: Env }>) {
  const binId = c.req.param("binId");

  if (!binId?.trim()) {
    throw new HTTPException(400, { message: "Invalid bin ID" });
  }

  try {
    const stub = getDurableObject(c.env);
    const result = await stub.captureWebhook(binId, c.req.raw);

    return c.json({ success: true, ...result }, 200);
  } catch (error) {
    logger.error("Error capturing webhook:", {
      error: error instanceof Error ? error.message : String(error),
    });
    if (error instanceof Error && error.message === "Bin not found") {
      return c.json({ success: false, error: "Bin not found" }, 404);
    }
    if (error instanceof Error && error.message === "Invalid bin ID") {
      return c.json({ success: false, error: "Invalid bin ID" }, 400);
    }
    throw new HTTPException(500, { message: "Failed to capture webhook" });
  }
}
