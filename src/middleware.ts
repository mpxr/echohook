import { Context, Next } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { Env, WebhooksStorageRPC } from "./types.js";
import { logger } from "./logger.js";

export const corsMiddleware = cors();

export async function loggingMiddleware(c: Context, next: Next) {
  const start = Date.now();
  const method = c.req.method;
  const url = c.req.url;
  const userAgent = c.req.header("User-Agent") || "Unknown";
  const ip =
    c.req.header("CF-Connecting-IP") ||
    c.req.header("X-Forwarded-For") ||
    "Unknown";

  logger.info(`Request started`, {
    method,
    url,
    ip,
    userAgent,
    direction: "incoming",
  });

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  logger.info(`Request completed`, {
    method,
    url,
    status,
    duration,
    direction: "outgoing",
  });
}

function getDurableObject(env: Env): DurableObjectStub & WebhooksStorageRPC {
  const id = env.WEBHOOKS.idFromName("webhooks");
  return env.WEBHOOKS.get(id) as DurableObjectStub & WebhooksStorageRPC;
}

export async function authMiddleware(
  c: Context<{ Bindings: Env }>,
  next: Next
) {
  // Skip auth for root endpoint, API health check, token creation, API docs and webhook capture endpoints
  const path = new URL(c.req.url).pathname;
  if (
    path === "/" ||
    path === "/api" ||
    path === "/api/auth/token" ||
    path === "/docs/api" ||
    path.startsWith("/api/webhook/")
  ) {
    await next();
    return;
  }

  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    logger.warn(`Missing Authorization header`, { path });
    throw new HTTPException(401, {
      message:
        "Missing Authorization header. Include 'Authorization: Bearer <token>' in your request.",
    });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    logger.warn(`Invalid Authorization header format`, { path });
    throw new HTTPException(401, {
      message:
        "Invalid Authorization header format. Use 'Authorization: Bearer <token>'.",
    });
  }

  try {
    const stub = getDurableObject(c.env);
    const result = await stub.validateToken(token);

    logger.info(`Token validation successful`, {
      path,
      tokenId: result.tokenId,
      tokenName: result.name,
    });

    // Store user info in context for later use if needed
    (c as any).set("user", result);

    await next();
  } catch (error) {
    if (error instanceof Error) {
      logger.warn(`Token validation failed`, {
        path,
        error: error.message,
      });
      throw new HTTPException(401, { message: error.message });
    }
    logger.error(`Auth middleware error`, { path, error });
    throw new HTTPException(500, { message: "Authentication service error" });
  }
}

export function errorHandler(err: Error, c: Context) {
  const method = c.req.method;
  const url = c.req.url;

  if (err instanceof HTTPException) {
    logger.warn(`HTTP Exception`, {
      method,
      url,
      status: err.status,
      error: err.message,
    });
    return c.json(
      {
        success: false,
        error: err.message,
      },
      err.status
    );
  }

  logger.error(`Unhandled error`, {
    method,
    url,
    error: err.message,
    stack: err.stack,
  });
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
