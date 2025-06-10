import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import {
  Env,
  WebhookBin,
  WebhookRequest,
  ApiResponse,
  ApiToken,
  WebhooksStorageRPC,
} from "./types.js";

function getDurableObject(env: Env): DurableObjectStub & WebhooksStorageRPC {
  const id = env.WEBHOOKS.idFromName("webhooks");
  return env.WEBHOOKS.get(id) as DurableObjectStub & WebhooksStorageRPC;
}

export async function getBins(c: Context<{ Bindings: Env }>) {
  try {
    const stub = getDurableObject(c.env);
    const bins = await stub.getAllBins();

    return c.json({ success: true, data: bins }, 200);
  } catch (error) {
    console.error("Error fetching bins:", error);
    throw new HTTPException(500, { message: "Failed to fetch bins" });
  }
}

export async function getBin(c: Context<{ Bindings: Env }>) {
  const binId = c.req.param("binId");

  if (!binId?.trim()) {
    throw new HTTPException(400, { message: "Invalid bin ID" });
  }

  try {
    const stub = getDurableObject(c.env);
    const bin = await stub.getBin(binId);

    if (!bin) {
      return c.json({ success: false, error: "Bin not found" }, 404);
    }

    return c.json({ success: true, data: bin }, 200);
  } catch (error) {
    console.error("Error fetching bin:", error);
    throw new HTTPException(500, { message: "Failed to fetch bin" });
  }
}

export async function getBinRequests(c: Context<{ Bindings: Env }>) {
  const binId = c.req.param("binId");

  if (!binId?.trim()) {
    throw new HTTPException(400, { message: "Invalid bin ID" });
  }

  try {
    const stub = getDurableObject(c.env);
    const requests = await stub.getBinRequests(binId);

    return c.json({ success: true, data: requests }, 200);
  } catch (error) {
    console.error("Error fetching bin requests:", error);
    if (error instanceof Error && error.message === "Bin not found") {
      return c.json({ success: false, error: "Bin not found" }, 404);
    }
    throw new HTTPException(500, { message: "Failed to fetch bin requests" });
  }
}

export async function createBin(c: Context<{ Bindings: Env }>) {
  try {
    const body = await c.req.json();
    const stub = getDurableObject(c.env);
    const bin = await stub.createBin(body);

    return c.json({ success: true, data: bin }, 201);
  } catch (error) {
    console.error("Error creating bin:", error);

    // Check if it's a JSON parsing error
    if (
      error instanceof SyntaxError ||
      (error as Error).message?.includes("JSON")
    ) {
      throw new HTTPException(400, { message: "Invalid JSON in request body" });
    }

    throw new HTTPException(500, { message: "Failed to create bin" });
  }
}

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
    console.error("Error capturing webhook:", error);
    if (error instanceof Error && error.message === "Bin not found") {
      return c.json({ success: false, error: "Bin not found" }, 404);
    }
    if (error instanceof Error && error.message === "Invalid bin ID") {
      return c.json({ success: false, error: "Invalid bin ID" }, 400);
    }
    throw new HTTPException(500, { message: "Failed to capture webhook" });
  }
}

export async function updateBin(c: Context<{ Bindings: Env }>) {
  const binId = c.req.param("binId");

  if (!binId?.trim()) {
    throw new HTTPException(400, { message: "Invalid bin ID" });
  }

  try {
    const body = await c.req.json();
    const stub = getDurableObject(c.env);
    const updatedBin = await stub.updateBin(binId, body);

    return c.json({ success: true, data: updatedBin }, 200);
  } catch (error) {
    console.error("Error updating bin:", error);

    // Check if it's a JSON parsing error
    if (
      error instanceof SyntaxError ||
      (error as Error).message?.includes("JSON")
    ) {
      throw new HTTPException(400, { message: "Invalid JSON in request body" });
    }

    if (error instanceof Error && error.message === "Bin not found") {
      return c.json({ success: false, error: "Bin not found" }, 404);
    }

    if (error instanceof Error && error.message === "Invalid bin ID") {
      return c.json({ success: false, error: "Invalid bin ID" }, 400);
    }

    throw new HTTPException(500, { message: "Failed to update bin" });
  }
}

export async function deleteBin(c: Context<{ Bindings: Env }>) {
  const binId = c.req.param("binId");

  if (!binId?.trim()) {
    throw new HTTPException(400, { message: "Invalid bin ID" });
  }

  try {
    const stub = getDurableObject(c.env);
    const result = await stub.deleteBin(binId);

    return c.json({ success: true, message: result.message }, 200);
  } catch (error) {
    console.error("Error deleting bin:", error);

    if (error instanceof Error && error.message === "Bin not found") {
      return c.json({ success: false, error: "Bin not found" }, 404);
    }

    if (error instanceof Error && error.message === "Invalid bin ID") {
      return c.json({ success: false, error: "Invalid bin ID" }, 400);
    }

    throw new HTTPException(500, { message: "Failed to delete bin" });
  }
}

export async function createToken(c: Context<{ Bindings: Env }>) {
  try {
    const body = await c.req.json();
    const stub = getDurableObject(c.env);
    const token = await stub.createToken(body);

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

    throw new HTTPException(500, { message: "Failed to create token" });
  }
}

export async function getTokens(c: Context<{ Bindings: Env }>) {
  try {
    const stub = getDurableObject(c.env);
    const tokens = await stub.getTokens();

    return c.json({ success: true, data: tokens }, 200);
  } catch (error) {
    console.error("Error fetching tokens:", error);
    throw new HTTPException(500, { message: "Failed to fetch tokens" });
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
