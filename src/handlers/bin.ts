import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "../logger.js";
import { Env } from "../types.js";
import { getDurableObject } from "../utils.js";

export async function getBins(c: Context<{ Bindings: Env }>) {
  try {
    const stub = getDurableObject(c.env);
    const bins = await stub.getAllBins();

    return c.json({ success: true, data: bins }, 200);
  } catch (error) {
    logger.error("Error fetching bins", {
      error: error instanceof Error ? error.message : String(error),
    });
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
    logger.error("Error fetching bin", {
      binId,
      error: error instanceof Error ? error.message : String(error),
    });
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
    logger.error("Error fetching bin requests", {
      binId,
      error: error instanceof Error ? error.message : String(error),
    });
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
    logger.error("Error creating bin", {
      error: error instanceof Error ? error.message : String(error),
    });

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
