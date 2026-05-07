import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getE2EStorePath } from "@/lib/e2e/testSupabase";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getE2EStorePath", () => {
  it("keeps local E2E data inside the Next workspace", () => {
    vi.stubEnv("NEXT_PUBLIC_MIRU_DEMO_BACKEND", undefined);

    expect(getE2EStorePath()).toBe(
      join(process.cwd(), ".next", "e2e-test-store.json"),
    );
  });

  it("uses writable temp storage for preview demo mode", () => {
    vi.stubEnv("NEXT_PUBLIC_MIRU_DEMO_BACKEND", "true");

    expect(getE2EStorePath()).toBe(join(tmpdir(), "miru-demo-store.json"));
  });
});
