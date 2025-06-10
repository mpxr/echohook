// Vitest setup file for EchoHook tests
// This file runs before all test files
import { vi, beforeEach } from "vitest";
import app from "../src/index";
import { Env } from "../src/types";

// Mock fetch globally for tests
global.fetch = vi.fn();

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
export async function createTestToken(
  mockEnv: Env,
  name = "Test Token"
): Promise<string> {
  const tokenRequest = new Request("http://localhost/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  const tokenResponse = await app.fetch(tokenRequest, mockEnv);
  if (!tokenResponse.ok) {
    throw new Error(`Failed to create test token: ${tokenResponse.status}`);
  }

  const tokenData = (await tokenResponse.json()) as { data: { token: string } };
  return tokenData.data.token;
}

// Helper function to make authenticated requests
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
