import { DurableObject } from "cloudflare:workers";
import { WebhookRequest, WebhookBin, Env, ApiToken } from "./types.js";
import { logger } from "./logger.js";

export class WebhooksStorage extends DurableObject<Env> {
  private storage: DurableObjectStorage;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.storage = state.storage;
    logger.info("WebhooksStorage instance created");
  }

  async getAllBins(): Promise<WebhookBin[]> {
    const bins = await this.storage.list<WebhookBin>({ prefix: "bin:" });
    const result = Array.from(bins.values()).sort(
      (a: WebhookBin, b: WebhookBin) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return result;
  }

  async getBin(binId: string): Promise<WebhookBin | null> {
    if (!binId) {
      logger.warn("getBin called with invalid bin ID");
      throw new Error("Invalid bin ID");
    }

    const result = (await this.storage.get<WebhookBin>(`bin:${binId}`)) || null;
    return result;
  }

  async getBinRequests(binId: string): Promise<WebhookRequest[]> {
    if (!binId) {
      logger.warn("getBinRequests called with invalid bin ID");
      throw new Error("Invalid bin ID");
    }

    const bin = await this.storage.get(`bin:${binId}`);
    if (!bin) {
      logger.warn("Bin not found", { binId });
      throw new Error("Bin not found");
    }

    const requests = await this.storage.list<WebhookRequest>({
      prefix: `request:${binId}:`,
    });

    const result = Array.from(requests.values()).sort(
      (a: WebhookRequest, b: WebhookRequest) =>
        new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
    );

    return result;
  }

  async createBin(body: Partial<WebhookBin>): Promise<WebhookBin> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const bin: WebhookBin = {
      id,
      name: body.name?.trim() || `Webhook Bin ${id.slice(0, 8)}`,
      description: body.description || undefined,
      created_at: now,
      updated_at: now,
      request_count: 0,
    };

    await this.storage.put(`bin:${id}`, bin);

    return bin;
  }

  async captureWebhook(
    binId: string,
    request: Request
  ): Promise<{
    bin_id: string;
    request_id: string;
    message: string;
  }> {
    if (!binId) {
      logger.warn("captureWebhook called with invalid bin ID");
      throw new Error("Invalid bin ID");
    }

    logger.info("Capturing webhook", { binId, method: request.method });

    const bin = (await this.storage.get(`bin:${binId}`)) as WebhookBin;
    if (!bin) {
      logger.warn("Bin not found for webhook capture", { binId });
      throw new Error("Bin not found");
    }

    const url = new URL(request.url);
    const headers: Record<string, string> = {};
    const queryParams: Record<string, string> = {};

    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const body = await request.text();
    const requestId = crypto.randomUUID();
    const now = new Date().toISOString();

    const webhookRequest: WebhookRequest = {
      id: requestId,
      bin_id: binId,
      method: request.method,
      url: request.url,
      headers,
      body,
      query_params: queryParams,
      ip_address: headers["cf-connecting-ip"] || headers["x-forwarded-for"],
      user_agent: headers["user-agent"],
      content_type: headers["content-type"],
      content_length: body ? body.length : 0,
      received_at: now,
    };

    await this.storage.put(`request:${binId}:${requestId}`, webhookRequest);

    const updatedBin: WebhookBin = {
      ...bin,
      request_count: bin.request_count + 1,
      last_request_at: now,
      updated_at: now,
    };

    await this.storage.put(`bin:${binId}`, updatedBin);

    return {
      bin_id: binId,
      request_id: requestId,
      message: "Webhook captured successfully",
    };
  }

  async updateBin(
    binId: string,
    body: Partial<WebhookBin>
  ): Promise<WebhookBin> {
    if (!binId) {
      logger.warn("updateBin called with invalid bin ID");
      throw new Error("Invalid bin ID");
    }

    const existingBin = (await this.storage.get(`bin:${binId}`)) as WebhookBin;
    if (!existingBin) {
      logger.warn("Bin not found for update", { binId });
      throw new Error("Bin not found");
    }

    const updatedBin: WebhookBin = {
      ...existingBin,
      name: body.name?.trim() || existingBin.name,
      description:
        body.description !== undefined
          ? body.description
          : existingBin.description,
      updated_at: new Date().toISOString(),
    };

    await this.storage.put(`bin:${binId}`, updatedBin);

    return updatedBin;
  }

  async deleteBin(binId: string): Promise<{ message: string }> {
    if (!binId) {
      logger.warn("deleteBin called with invalid bin ID");
      throw new Error("Invalid bin ID");
    }

    const bin = await this.storage.get(`bin:${binId}`);
    if (!bin) {
      logger.warn("Bin not found for deletion", { binId });
      throw new Error("Bin not found");
    }

    await this.storage.delete(`bin:${binId}`);

    const requests = await this.storage.list({ prefix: `request:${binId}:` });
    const deletePromises = Array.from(requests.keys()).map((key) =>
      this.storage.delete(key)
    );
    await Promise.all(deletePromises);

    return {
      message: "Bin and all requests deleted successfully",
    };
  }

  // Authentication methods
  async createToken(body: {
    name?: string;
    description?: string;
    expiresIn?: string;
  }): Promise<ApiToken> {
    const token = this.generateSecureToken();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    let expiresAt: string | undefined;
    if (body.expiresIn) {
      const expirationDate = new Date();
      // Parse expiration (default to 365 days if invalid)
      const days = parseInt(body.expiresIn) || 365;
      expirationDate.setDate(expirationDate.getDate() + days);
      expiresAt = expirationDate.toISOString();
    }

    const apiToken: ApiToken = {
      id,
      token,
      name: body.name?.trim() || `API Token ${id.slice(0, 8)}`,
      description: body.description || undefined,
      created_at: now,
      expires_at: expiresAt,
      is_active: true,
    };

    logger.info("Creating new API token", {
      tokenId: id,
      name: apiToken.name,
      expiresAt: expiresAt,
    });

    await this.storage.put(`token:${id}`, apiToken);
    await this.storage.put(`token_lookup:${token}`, id);

    logger.info("API token created successfully", {
      tokenId: id,
      name: apiToken.name,
    });

    return apiToken;
  }

  async deleteToken(tokenId: string): Promise<{ message: string }> {
    if (!tokenId) {
      logger.warn("deleteToken called with invalid token ID");
      throw new Error("Invalid token ID");
    }

    logger.info("Deleting API token", { tokenId });

    const apiToken = await this.storage.get<ApiToken>(`token:${tokenId}`);
    if (!apiToken) {
      logger.warn("Token not found for deletion", { tokenId });
      throw new Error("Token not found");
    }

    // Delete both the token and its lookup entry
    await this.storage.delete(`token:${tokenId}`);
    await this.storage.delete(`token_lookup:${apiToken.token}`);

    logger.info("API token deleted successfully", {
      tokenId,
      name: apiToken.name,
    });

    return { message: "Token deleted successfully" };
  }

  async validateToken(
    token: string
  ): Promise<{ tokenId: string; name: string }> {
    if (!token) {
      logger.warn("validateToken called with empty token");
      throw new Error("Token is required");
    }

    logger.info("Validating API token");

    const tokenId = await this.storage.get<string>(`token_lookup:${token}`);
    if (!tokenId) {
      logger.warn("Token lookup failed - invalid token");
      throw new Error("Invalid token");
    }

    const apiToken = await this.storage.get<ApiToken>(`token:${tokenId}`);
    if (!apiToken || !apiToken.is_active) {
      logger.warn("Token validation failed - inactive or not found", {
        tokenId,
      });
      throw new Error("Token is inactive or not found");
    }

    // Check if token is expired
    if (apiToken.expires_at && new Date(apiToken.expires_at) < new Date()) {
      logger.warn("Token validation failed - expired", {
        tokenId,
        expiresAt: apiToken.expires_at,
      });
      throw new Error("Token has expired");
    }

    // Update last used timestamp
    const updatedToken = {
      ...apiToken,
      last_used_at: new Date().toISOString(),
    };
    await this.storage.put(`token:${tokenId}`, updatedToken);

    return { tokenId, name: apiToken.name || "Unknown Token" };
  }

  private generateSecureToken(): string {
    // Generate a secure random token (32 bytes = 64 hex characters)
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }

  private maskToken(token: string): string {
    // Show only first 8 and last 4 characters
    if (token.length <= 12) return token;
    return `${token.slice(0, 8)}...${token.slice(-4)}`;
  }
}
