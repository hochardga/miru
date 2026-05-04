import { describe, expect, it } from "vitest";
import { getPublicEnv } from "@/lib/env";

describe("getPublicEnv", () => {
  it("throws a clear developer error when required values are missing", () => {
    expect(() => getPublicEnv({})).toThrowError(
      /NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_APP_URL/,
    );
  });
});
