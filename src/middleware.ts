import { Context, Next } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { Env, WebhooksStorageRPC } from "./types.js";

export const corsMiddleware = cors();

export async function loggingMiddleware(c: Context, next: Next) {
  console.log(`${c.req.method} ${c.req.url}`);
  await next();
}

function getDurableObject(env: Env): DurableObjectStub & WebhooksStorageRPC {
  const id = env.WEBHOOKS.idFromName("webhooks");
  return env.WEBHOOKS.get(id) as DurableObjectStub & WebhooksStorageRPC;
}

export async function authMiddleware(
  c: Context<{ Bindings: Env }>,
  next: Next
) {
  // Skip auth for root endpoint, token creation, and webhook capture endpoints
  const path = new URL(c.req.url).pathname;
  if (path === "/" || path === "/auth/token" || path.startsWith("/webhook/")) {
    await next();
    return;
  }

  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    throw new HTTPException(401, {
      message:
        "Missing Authorization header. Include 'Authorization: Bearer <token>' in your request.",
    });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new HTTPException(401, {
      message:
        "Invalid Authorization header format. Use 'Authorization: Bearer <token>'.",
    });
  }

  try {
    const stub = getDurableObject(c.env);
    const result = await stub.validateToken(token);

    // Store user info in context for later use if needed
    (c as any).set("user", result);

    await next();
  } catch (error) {
    if (error instanceof Error) {
      throw new HTTPException(401, { message: error.message });
    }
    console.error("Auth middleware error:", error);
    throw new HTTPException(500, { message: "Authentication service error" });
  }
}

export function errorHandler(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: err.message,
      },
      err.status
    );
  }

  console.error("Unhandled error:", err);
  return c.json(
    {
      success: false,
      error: "Internal server error",
    },
    500
  );
}

export function notFoundHandler(c: Context) {
  return c.json({ success: false, error: "Not found" }, 404);
}
