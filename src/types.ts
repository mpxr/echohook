export interface Env {
  WEBHOOKS: DurableObjectNamespace;
  ENVIRONMENT: string;
  LOG_LEVEL?: string;
  JWT_SECRET?: string; // For signing tokens, falls back to default if not set;
}

export interface WebhooksStorageRPC {
  getAllBins(): Promise<WebhookBin[]>;
  getBin(binId: string): Promise<WebhookBin | null>;
  getBinRequests(binId: string): Promise<WebhookRequest[]>;
  createBin(body: Partial<WebhookBin>): Promise<WebhookBin>;
  captureWebhook(
    binId: string,
    request: Request
  ): Promise<{
    bin_id: string;
    request_id: string;
    message: string;
  }>;
  updateBin(binId: string, body: Partial<WebhookBin>): Promise<WebhookBin>;
  deleteBin(binId: string): Promise<{ message: string }>;
  createToken(body: {
    name?: string;
    description?: string;
    expiresIn?: string;
  }): Promise<ApiToken>;
  getTokens(): Promise<ApiToken[]>;
  deleteToken(tokenId: string): Promise<{ message: string }>;
  validateToken(token: string): Promise<{ tokenId: string; name: string }>;
}

export interface WebhookRequest {
  id: string;
  bin_id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  query_params: Record<string, string>;
  ip_address?: string;
  user_agent?: string;
  content_type?: string;
  content_length?: number;
  received_at: string;
}

export interface WebhookBin {
  id: string;
  name?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  request_count: number;
  last_request_at?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiToken {
  id: string;
  token: string;
  name?: string;
  description?: string;
  created_at: string;
  last_used_at?: string;
  expires_at?: string;
  is_active: boolean;
}
