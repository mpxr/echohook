import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    poolOptions: {
      workers: {
        wrangler: { 
          configPath: "./wrangler.toml",
          environment: "test"
        },
      },
    },
    // Disable coverage for workers pool due to Node.js module compatibility issues
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.spec.ts", "tests/**"],
      reporter: ["text", "json", "html"],
      enabled: false, // Disable for Cloudflare Workers environment
    },
  },
});
