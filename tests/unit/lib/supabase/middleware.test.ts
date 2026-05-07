import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
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
});
