import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { Env } from "../types.js";
import { getDurableObject } from "../utils.js";
import { isValidTokenName, sanitizeInput } from "../security.js";

export async function createToken(c: Context<{ Bindings: Env }>) {
  try {
    const body = await c.req.json();

    // Validate and sanitize input
    if (body.name && !isValidTokenName(body.name)) {
      throw new HTTPException(400, {
        message:
          "Invalid token name. Use only alphanumeric characters, spaces, hyphens, and underscores (1-100 chars).",
      });
    }

    // Sanitize inputs
    const sanitizedBody = {
      name: body.name ? sanitizeInput(body.name) : undefined,
      description: body.description
        ? sanitizeInput(body.description)
        : undefined,
      expiresIn: body.expiresIn ? String(body.expiresIn) : undefined,
    };

    const stub = getDurableObject(c.env);
    const token = await stub.createToken(sanitizedBody);

    return c.json({ success: true, data: token }, 201);
  } catch (error) {
    console.error("Error creating token:", error);

    // Check if it's a JSON parsing error
    if (
      error instanceof SyntaxError ||
      (error as Error).message?.includes("JSON")
    ) {
      throw new HTTPException(400, { message: "Invalid JSON in request body" });
    }

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, { message: "Failed to create token" });
  }
}

export async function deleteToken(c: Context<{ Bindings: Env }>) {
  const tokenId = c.req.param("tokenId");

  if (!tokenId?.trim()) {
    throw new HTTPException(400, { message: "Invalid token ID" });
  }

  try {
    const stub = getDurableObject(c.env);
    const result = await stub.deleteToken(tokenId);

    return c.json({ success: true, message: result.message }, 200);
  } catch (error) {
    console.error("Error deleting token:", error);

    if (error instanceof Error && error.message === "Token not found") {
      return c.json({ success: false, error: "Token not found" }, 404);
    }

    if (error instanceof Error && error.message === "Invalid token ID") {
      return c.json({ success: false, error: "Invalid token ID" }, 400);
    }

    throw new HTTPException(500, { message: "Failed to delete token" });
  }
}
