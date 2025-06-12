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

    const defaultQuota = parseInt(this.env.DEFAULT_TOKEN_QUOTA || "1000"); // Default daily quota from env
    const dailyQuota = defaultQuota;

    const apiToken: ApiToken = {
      id,
      token,
      name: body.name?.trim() || `API Token ${id.slice(0, 8)}`,
      description: body.description || undefined,
      created_at: now,
      expires_at: expiresAt,
      is_active: true,
      daily_quota: dailyQuota,
      usage_count: 0,
      usage_reset_date: this.getTodayDateString(),
      total_requests: 0,
    };

    logger.info("Creating new API token", {
      tokenId: id,
      name: apiToken.name,
      expiresAt: expiresAt,
      dailyQuota,
    });

    await this.storage.put(`token:${id}`, apiToken);
    await this.storage.put(`token_lookup:${token}`, id);

    logger.info("API token created successfully", {
      tokenId: id,
      name: apiToken.name,
    });

    // Return filtered token (excluding internal fields)
    return {
      id: apiToken.id,
      token: apiToken.token,
      name: apiToken.name,
      description: apiToken.description,
      created_at: apiToken.created_at,
      expires_at: apiToken.expires_at,
      is_active: apiToken.is_active,
      // Don't expose: daily_quota, usage_count, usage_reset_date, total_requests, last_used_at
    };
  }

  async getTokens(): Promise<ApiToken[]> {
    logger.info("Fetching all API tokens");

    const tokens = await this.storage.list<ApiToken>({ prefix: "token:" });
    const result = Array.from(tokens.values())
      .filter((token) => token.id && typeof token.id === "string") // Filter out lookup entries
      .sort(
        (a: ApiToken, b: ApiToken) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((token) => ({
        id: token.id,
        token: this.maskToken(token.token), // Don't expose full tokens
        name: token.name,
        description: token.description,
        created_at: token.created_at,
        last_used_at: token.last_used_at,
        expires_at: token.expires_at,
        is_active: token.is_active,
        // Don't expose internal fields: daily_quota, usage_count, usage_reset_date, total_requests
      }));

    logger.info("Retrieved API tokens", { count: result.length });
    return result;
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

    // Check daily quota
    const today = this.getTodayDateString();
    let usageCount = apiToken.usage_count || 0;

    // Reset usage if it's a new day
    if (apiToken.usage_reset_date !== today) {
      usageCount = 0;
    }

    const dailyQuota = apiToken.daily_quota || 1000;
    if (usageCount >= dailyQuota) {
      logger.warn("Token validation failed - quota exceeded", {
        tokenId,
        usageCount,
        dailyQuota,
      });
      throw new Error("Daily quota exceeded");
    }

    // Increment usage counter
    await this.incrementTokenUsage(tokenId);

    logger.info("Token validation successful", {
      tokenId,
      name: apiToken.name,
      usageCount: usageCount + 1,
      dailyQuota,
    });

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

  private getTodayDateString(): string {
    return new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  }

  private async incrementTokenUsage(tokenId: string): Promise<void> {
    const apiToken = await this.storage.get<ApiToken>(`token:${tokenId}`);
    if (!apiToken) return;

    const today = this.getTodayDateString();
    let usageCount = apiToken.usage_count || 0;
    let totalRequests = apiToken.total_requests || 0;

    // Reset daily usage if it's a new day
    if (apiToken.usage_reset_date !== today) {
      usageCount = 0;
    }

    const updatedToken: ApiToken = {
      ...apiToken,
      usage_count: usageCount + 1,
      total_requests: totalRequests + 1,
      usage_reset_date: today,
      last_used_at: new Date().toISOString(),
    };

    await this.storage.put(`token:${tokenId}`, updatedToken);
  }
}
