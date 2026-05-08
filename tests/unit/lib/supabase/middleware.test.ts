import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { E2E_SESSION_COOKIE } from "@/lib/e2e/config";
import { updateSession } from "@/lib/supabase/middleware";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("updateSession", () => {
  it("lets public routes render when Supabase env is not configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", undefined);
    vi.stubEnv("NEXT_PUBLIC_APP_URL", undefined);
    vi.stubEnv("E2E_DISABLE_REMOTE_AUTH", undefined);
    vi.stubEnv("E2E_TEST_BACKEND", undefined);
    vi.stubEnv("NEXT_PUBLIC_E2E_TEST_BACKEND", undefined);

    await expect(
      updateSession(new NextRequest("http://localhost/")),
    ).resolves.toBeDefined();
  });

  it("uses preview demo sessions for protected routes when demo mode is enabled", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_MIRU_DEMO_BACKEND", "true");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", undefined);
    vi.stubEnv("NEXT_PUBLIC_APP_URL", undefined);

    const request = new NextRequest("http://localhost/runs", {
      headers: {
        cookie: `${E2E_SESSION_COOKIE}=123e4567-e89b-42d3-a456-426614174000`,
      },
    });

    const response = await updateSession(request);

    expect(response.headers.get("location")).toBeNull();
  });
});
