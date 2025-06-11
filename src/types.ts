export interface Env {
  WEBHOOKS: DurableObjectNamespace;
  ENVIRONMENT: string;
  LOG_LEVEL?: string;
  JWT_SECRET?: string; // For signing tokens, falls back to default if not set;
  ADMIN_API_KEY?: string; // Admin API key for creating tokens
  RATE_LIMIT_ENABLED?: string; // "true" to enable rate limiting
  DEFAULT_TOKEN_QUOTA?: string; // Default daily request quota (defaults to 1000)
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
    dailyQuota?: number;
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
  daily_quota?: number; // Daily request limit
  usage_count?: number; // Current daily usage
  usage_reset_date?: string; // When usage resets (daily)
  total_requests?: number; // Total lifetime requests
}

export interface RateLimitInfo {
  ip: string;
  endpoint: string;
  count: number;
  resetTime: number;
  windowMs: number;
}
