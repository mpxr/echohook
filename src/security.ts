import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { Env } from "./types.js";
import { logger } from "./logger.js";

// Rate limiting configuration
const RATE_LIMITS = {
  // Token creation: very restrictive
  '/api/auth/token': { requests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  // Webhook capture: more lenient
  '/api/webhook/': { requests: 1000, windowMs: 60 * 60 * 1000 }, // 1000 per hour
  // General API: moderate
  '/api/': { requests: 100, windowMs: 60 * 60 * 1000 }, // 100 per hour
};

// Simple in-memory rate limiting store
// In production, this should use Durable Objects or external store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function getClientIP(c: Context): string {
  return (
    c.req.header("CF-Connecting-IP") ||
    c.req.header("X-Forwarded-For") ||
    c.req.header("X-Real-IP") ||
    "unknown"
  );
}

export async function rateLimitMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  // Skip rate limiting if disabled
  if (c.env.RATE_LIMIT_ENABLED !== "true") {
    await next();
    return;
  }

  const path = new URL(c.req.url).pathname;
  const ip = getClientIP(c);

  // Find matching rate limit rule
  let rateLimit = null;
  for (const [pattern, limit] of Object.entries(RATE_LIMITS)) {
    if (path.startsWith(pattern)) {
      rateLimit = limit;
      break;
    }
  }

  if (!rateLimit) {
    await next();
    return;
  }

  const key = `${ip}:${path}`;
  const now = Date.now();
  const window = rateLimitStore.get(key);

  if (!window || now > window.resetTime) {
    // Reset or create new window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + rateLimit.windowMs,
    });
    await next();
    return;
  }

  if (window.count >= rateLimit.requests) {
    const resetInSeconds = Math.ceil((window.resetTime - now) / 1000);

    logger.warn("Rate limit exceeded", {
      ip,
      path,
      count: window.count,
      limit: rateLimit.requests,
      resetInSeconds,
    });

    // Add rate limit headers
    c.res.headers.set("X-RateLimit-Limit", rateLimit.requests.toString());
    c.res.headers.set("X-RateLimit-Remaining", "0");
    c.res.headers.set("X-RateLimit-Reset", Math.ceil(window.resetTime / 1000).toString());

    throw new HTTPException(429, {
      message: `Rate limit exceeded. Try again in ${resetInSeconds} seconds.`,
    });
  }

  // Increment counter
  window.count++;
  rateLimitStore.set(key, window);

  // Add rate limit headers
  c.res.headers.set("X-RateLimit-Limit", rateLimit.requests.toString());
  c.res.headers.set("X-RateLimit-Remaining", (rateLimit.requests - window.count).toString());
  c.res.headers.set("X-RateLimit-Reset", Math.ceil(window.resetTime / 1000).toString());

  await next();
}

export async function adminAuthMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const adminKey = c.env.ADMIN_API_KEY;

  if (!adminKey) {
    throw new HTTPException(503, {
      message: "Admin API key not configured. Token creation is disabled.",
    });
  }

  const authHeader = c.req.header("X-Admin-Key");
  if (!authHeader || authHeader !== adminKey) {
    logger.warn("Unauthorized admin access attempt", {
      ip: getClientIP(c),
      path: new URL(c.req.url).pathname,
    });

    throw new HTTPException(401, {
      message: "Admin authorization required. Include 'X-Admin-Key' header with valid admin key.",
    });
  }

  await next();
}

export function isValidBinId(binId: string): boolean {
  // Basic validation: UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(binId);
}

export function isValidTokenName(name: string): boolean {
  // Token names should be reasonable length and safe characters
  if (!name || name.length < 1 || name.length > 100) {
    return false;
  }

  // Allow alphanumeric, spaces, hyphens, underscores
  const validNameRegex = /^[a-zA-Z0-9\s\-_]+$/;
  return validNameRegex.test(name);
}

export function sanitizeInput(input: string): string {
  // Basic input sanitization
  return input.trim().slice(0, 1000); // Limit length and trim
}
