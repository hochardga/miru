import { afterEach, describe, expect, it } from "vitest";
import { getPublicEnv } from "@/lib/env";

const originalPublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  UNRELATED_SECRET: process.env.UNRELATED_SECRET,
};

function restoreEnvVar(
  key: keyof typeof originalPublicEnv,
  value: string | undefined,
) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}

afterEach(() => {
  restoreEnvVar(
    "NEXT_PUBLIC_SUPABASE_URL",
    originalPublicEnv.NEXT_PUBLIC_SUPABASE_URL,
  );
  restoreEnvVar(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    originalPublicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  restoreEnvVar("NEXT_PUBLIC_APP_URL", originalPublicEnv.NEXT_PUBLIC_APP_URL);
  restoreEnvVar("UNRELATED_SECRET", originalPublicEnv.UNRELATED_SECRET);
});

describe("getPublicEnv", () => {
  it("returns the expected public env values when input is valid", () => {
    expect(
      getPublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      }),
    ).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    });
  });

  it("throws a clear developer error when required values are missing", () => {
    expect(() => getPublicEnv({})).toThrowError(
      /NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_APP_URL/,
    );
  });

  it("reads the required public env keys from process.env by default", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    process.env.UNRELATED_SECRET = "ignored";

    expect(getPublicEnv()).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    });
  });
});
