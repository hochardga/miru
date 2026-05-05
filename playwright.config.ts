import { defineConfig } from "@playwright/test";

const localSmokeBaseUrl = "http://localhost:3100";

if (!process.env.PLAYWRIGHT_BASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
  process.env.NEXT_PUBLIC_APP_URL ??= localSmokeBaseUrl;
  process.env.E2E_DISABLE_REMOTE_AUTH ??= "true";
}

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? localSmokeBaseUrl,
    trace: "on-first-retry",
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev -- --hostname localhost --port 3100",
        url: localSmokeBaseUrl,
        reuseExistingServer: false,
      },
});
