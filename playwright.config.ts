import { defineConfig } from "@playwright/test";

const localSmokeBaseUrl = "http://localhost:3100";
const shouldManageLocalSmokeServer = !process.env.PLAYWRIGHT_BASE_URL;

const localSmokeEnv = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "test-anon-key",
  NEXT_PUBLIC_APP_URL: localSmokeBaseUrl,
  E2E_DISABLE_REMOTE_AUTH: process.env.E2E_DISABLE_REMOTE_AUTH ?? "true",
};

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? localSmokeBaseUrl,
    trace: "on-first-retry",
  },
  webServer: shouldManageLocalSmokeServer
    ? {
        command: "npm run dev -- --hostname localhost --port 3100",
        env: localSmokeEnv,
        reuseExistingServer: false,
        url: localSmokeBaseUrl,
      }
    : undefined,
});
