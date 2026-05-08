import { afterEach, describe, expect, it, vi } from "vitest";
import { isE2ETestBackendEnabled } from "@/lib/e2e/config";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isE2ETestBackendEnabled", () => {
  it("requires the Playwright runtime guard", () => {
    vi.stubEnv("E2E_TEST_BACKEND", "true");
    vi.stubEnv("NEXT_PUBLIC_E2E_TEST_BACKEND", "true");
    vi.stubEnv("E2E_RUNTIME", undefined);
    vi.stubEnv("NEXT_PUBLIC_E2E_RUNTIME", undefined);

    expect(isE2ETestBackendEnabled()).toBe(false);
  });

  it("enables the backend when Playwright runtime and backend flags are present", () => {
    vi.stubEnv("E2E_TEST_BACKEND", "true");
    vi.stubEnv("E2E_RUNTIME", "playwright");

    expect(isE2ETestBackendEnabled()).toBe(true);
  });

  it("never enables the backend in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("E2E_TEST_BACKEND", "true");
    vi.stubEnv("E2E_RUNTIME", "playwright");

    expect(isE2ETestBackendEnabled()).toBe(false);
  });

  it("enables the backend in production when preview demo mode is explicit", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_MIRU_DEMO_BACKEND", "true");

    expect(isE2ETestBackendEnabled()).toBe(true);
  });
});
