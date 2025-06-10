import { WebhookRequest, WebhookBin, Env, ApiToken } from "./types.js";

export class WebhooksStorage {
  private storage: DurableObjectStorage;
  private env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.storage = state.storage;
    this.env = env;
  }

  // Legacy fetch handler for backward compatibility if needed
  async fetch(request: Request): Promise<Response> {
    return new Response(
      JSON.stringify({
        success: false,
        error:
          "This Durable Object now uses RPC-style API. Use direct method calls instead.",
      }),
      { status: 501, headers: { "Content-Type": "application/json" } }
    );
  }

  // RPC-style methods for bins
  async getAllBins(): Promise<WebhookBin[]> {
    const bins = await this.storage.list<WebhookBin>({ prefix: "bin:" });
    return Array.from(bins.values()).sort(
      (a: WebhookBin, b: WebhookBin) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async getBin(binId: string): Promise<WebhookBin | null> {
    if (!binId) {
      throw new Error("Invalid bin ID");
    }

    return (await this.storage.get<WebhookBin>(`bin:${binId}`)) || null;
  }

  async getBinRequests(binId: string): Promise<WebhookRequest[]> {
    if (!binId) {
      throw new Error("Invalid bin ID");
    }

    const bin = await this.storage.get(`bin:${binId}`);
    if (!bin) {
      throw new Error("Bin not found");
    }

    const requests = await this.storage.list<WebhookRequest>({
      prefix: `request:${binId}:`,
    });
    return Array.from(requests.values()).sort(
      (a: WebhookRequest, b: WebhookRequest) =>
        new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
    );
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
      throw new Error("Invalid bin ID");
    }

    const bin = (await this.storage.get(`bin:${binId}`)) as WebhookBin;
    if (!bin) {
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
      throw new Error("Invalid bin ID");
    }

    const existingBin = (await this.storage.get(`bin:${binId}`)) as WebhookBin;
    if (!existingBin) {
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
      throw new Error("Invalid bin ID");
    }

    const bin = await this.storage.get(`bin:${binId}`);
    if (!bin) {
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

    await this.storage.put(`token:${id}`, apiToken);
    await this.storage.put(`token_lookup:${token}`, id);

    return apiToken;
  }

  async getTokens(): Promise<ApiToken[]> {
    const tokens = await this.storage.list<ApiToken>({ prefix: "token:" });
    return Array.from(tokens.values())
      .filter((token) => token.id && typeof token.id === "string") // Filter out lookup entries
      .sort(
        (a: ApiToken, b: ApiToken) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((token) => ({
        ...token,
        token: this.maskToken(token.token), // Don't expose full tokens
      }));
  }

  async deleteToken(tokenId: string): Promise<{ message: string }> {
    if (!tokenId) {
      throw new Error("Invalid token ID");
    }

    const apiToken = await this.storage.get<ApiToken>(`token:${tokenId}`);
    if (!apiToken) {
      throw new Error("Token not found");
    }

    // Delete both the token and its lookup entry
    await this.storage.delete(`token:${tokenId}`);
    await this.storage.delete(`token_lookup:${apiToken.token}`);

    return { message: "Token deleted successfully" };
  }

  async validateToken(
    token: string
  ): Promise<{ tokenId: string; name: string }> {
    if (!token) {
      throw new Error("Token is required");
    }

    const tokenId = await this.storage.get<string>(`token_lookup:${token}`);
    if (!tokenId) {
      throw new Error("Invalid token");
    }

    const apiToken = await this.storage.get<ApiToken>(`token:${tokenId}`);
    if (!apiToken || !apiToken.is_active) {
      throw new Error("Token is inactive or not found");
    }

    // Check if token is expired
    if (apiToken.expires_at && new Date(apiToken.expires_at) < new Date()) {
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
