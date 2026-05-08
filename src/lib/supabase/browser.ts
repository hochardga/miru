import { createBrowserClient } from "@supabase/ssr";
import { createE2EBrowserSupabaseClient } from "@/lib/e2e/browserSupabase";
import { isE2ETestBackendEnabled } from "@/lib/e2e/config";
import { getPublicEnv } from "@/lib/env";

type BrowserSupabaseClient =
  | ReturnType<typeof createBrowserClient>
  | ReturnType<typeof createE2EBrowserSupabaseClient>;

let browserClient: BrowserSupabaseClient | null = null;

export function createBrowserSupabaseClient() {
  if (browserClient) {
    return browserClient;
  }

  if (isE2ETestBackendEnabled()) {
    browserClient = createE2EBrowserSupabaseClient();
    return browserClient;
  }

  const env = getPublicEnv();
  browserClient = createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return browserClient;
}
