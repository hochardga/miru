import { describe, expect, it } from "vitest";
import { shouldEnablePreviewDemoBackend } from "../../next.config";

describe("shouldEnablePreviewDemoBackend", () => {
  it("enables demo mode for Vercel previews missing Supabase env", () => {
    expect(
      shouldEnablePreviewDemoBackend({
        VERCEL_ENV: "preview",
      }),
    ).toBe(true);
  });

  it("keeps preview on Supabase when hosted Supabase env is configured", () => {
    expect(
      shouldEnablePreviewDemoBackend({
        VERCEL_ENV: "preview",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      }),
    ).toBe(false);
  });

  it("does not enable demo mode for production deployments", () => {
    expect(
      shouldEnablePreviewDemoBackend({
        VERCEL_ENV: "production",
      }),
    ).toBe(false);
  });
});
