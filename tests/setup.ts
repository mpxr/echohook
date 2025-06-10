// Vitest setup file for EchoHook E2E tests
// This file runs before all test files and sets up the test environment
// for true end-to-end testing using Cloudflare Workers runtime
import { vi, beforeEach } from "vitest";

// Set up test environment variables
process.env.NODE_ENV = "test";

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Helper function to create an authentication token for tests
// Uses the real API endpoint to create tokens
export async function createTestToken(
  worker: Fetcher,
  name = "Test Token"
): Promise<string> {
  const tokenRequest = new Request("http://localhost/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  const tokenResponse = await worker.fetch(tokenRequest);
  if (!tokenResponse.ok) {
    throw new Error(`Failed to create test token: ${tokenResponse.status}`);
  }

  const tokenData = (await tokenResponse.json()) as { data: { token: string } };
  return tokenData.data.token;
}

export function createAuthenticatedRequest(
  url: string,
  options: RequestInit = {},
  token: string
): Request {
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  return new Request(url, {
    ...options,
    headers,
  });
}
