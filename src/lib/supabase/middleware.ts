import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  E2E_SESSION_COOKIE,
  isE2ETestBackendEnabled,
  isValidE2EUserId,
} from "@/lib/e2e/config";
import { getPublicEnv } from "@/lib/env";

export const PROTECTED_ROUTE_PREFIXES = ["/play", "/runs", "/rules", "/settings"];

export function isProtectedPath(pathname: string) {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function updateSession(request: NextRequest) {
  const protectedPath = isProtectedPath(request.nextUrl.pathname);

  if (isE2ETestBackendEnabled()) {
    if (!protectedPath) {
      return NextResponse.next();
    }

    const e2eUserId = request.cookies.get(E2E_SESSION_COOKIE)?.value;
    if (!isValidE2EUserId(e2eUserId)) {
      return NextResponse.redirect(new URL("/?reason=session-required", request.url));
    }

    return NextResponse.next();
  }

  if (
    process.env.E2E_DISABLE_REMOTE_AUTH === "true" &&
    protectedPath
  ) {
    return NextResponse.redirect(new URL("/?reason=session-required", request.url));
  }

  if (!protectedPath) {
    return NextResponse.next();
  }

  const env = getPublicEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/?reason=session-required", request.url));
  }

  return response;
}
