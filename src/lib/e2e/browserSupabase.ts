import {
  E2E_SESSION_COOKIE,
  isValidE2EUserId,
} from "@/lib/e2e/config";

type E2ESession = {
  user: {
    id: string;
    is_anonymous: true;
  };
};

function createSession(userId: string): E2ESession {
  return {
    user: {
      id: userId,
      is_anonymous: true,
    },
  };
}

function readCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(prefix.length));
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
}

function createUuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (token) => {
    const randomValue = Math.floor(Math.random() * 16);
    const value = token === "x" ? randomValue : (randomValue & 0x3) | 0x8;

    return value.toString(16);
  });
}

function getUserIdFromCookie() {
  const userId = readCookie(E2E_SESSION_COOKIE) ?? undefined;

  return isValidE2EUserId(userId) ? userId : null;
}

export function createE2EBrowserSupabaseClient() {
  return {
    auth: {
      async getSession() {
        const userId = getUserIdFromCookie();

        return {
          data: {
            session: userId ? createSession(userId) : null,
          },
          error: null,
        };
      },
      async signInAnonymously() {
        const userId = getUserIdFromCookie() ?? createUuid();

        writeCookie(E2E_SESSION_COOKIE, userId);

        return {
          data: {
            session: createSession(userId),
          },
          error: null,
        };
      },
    },
  };
}
