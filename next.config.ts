import type { NextConfig } from "next";

type EnvInput = Partial<Record<string, string | undefined>>;

function hasHostedSupabaseEnv(env: EnvInput) {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

export function shouldEnablePreviewDemoBackend(env: EnvInput) {
  if (
    env.NEXT_PUBLIC_MIRU_DEMO_BACKEND === "true" ||
    env.MIRU_DEMO_BACKEND === "true"
  ) {
    return true;
  }

  if (env.MIRU_DISABLE_PREVIEW_DEMO_BACKEND === "true") {
    return false;
  }

  return env.VERCEL_ENV === "preview" && !hasHostedSupabaseEnv(env);
}

const previewDemoBackendEnabled = shouldEnablePreviewDemoBackend(process.env);

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_MIRU_DEMO_BACKEND: previewDemoBackendEnabled ? "true" : "false",
  },
};

export default nextConfig;
