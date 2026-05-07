import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  E2E_SESSION_COOKIE,
  isE2ETestBackendEnabled,
  isValidE2EUserId,
} from "@/lib/e2e/config";
import { createE2ETestSupabaseClient } from "@/lib/e2e/testSupabase";
import { getPublicEnv } from "@/lib/env";

type ServerSupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;
type E2EUser = {
  id: string;
  is_anonymous: true;
};
type RouteContext = {
  supabase: ServerSupabaseClient;
  user: E2EUser | null;
};

function createE2EUser(userId: string) {
  return {
    id: userId,
    is_anonymous: true,
  } satisfies E2EUser;
}

function readCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return undefined;
  }

  const prefix = `${name}=`;
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : undefined;
}

async function getE2ERouteContext(): Promise<RouteContext> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const userId =
    cookieStore.get(E2E_SESSION_COOKIE)?.value ??
    readCookieValue(headerStore.get("cookie"), E2E_SESSION_COOKIE);
  const user = isValidE2EUserId(userId) ? createE2EUser(userId) : null;

  return {
    supabase: createE2ETestSupabaseClient() as unknown as ServerSupabaseClient,
    user,
  };
}

export async function createServerSupabaseClient() {
  const env = getPublicEnv();
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Server Components can read cookies but may reject writes.
            }
          });
        },
      },
    },
  );
}

export async function requireUser() {
  if (isE2ETestBackendEnabled()) {
    const context = await getE2ERouteContext();

    if (!context.user) {
      redirect("/?reason=session-required");
    }

    return {
      supabase: context.supabase,
      user: context.user,
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/?reason=session-required");
  }

  return { supabase, user };
}

export async function getRouteUser() {
  if (isE2ETestBackendEnabled()) {
    return getE2ERouteContext();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}
