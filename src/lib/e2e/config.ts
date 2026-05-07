export const E2E_SESSION_COOKIE = "miru-e2e-user-id";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isE2ETestBackendEnabled() {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  const isPlaywrightRuntime =
    process.env.E2E_RUNTIME === "playwright" ||
    process.env.NEXT_PUBLIC_E2E_RUNTIME === "playwright";

  return (
    isPlaywrightRuntime &&
    (process.env.E2E_TEST_BACKEND === "true" ||
      process.env.NEXT_PUBLIC_E2E_TEST_BACKEND === "true")
  );
}

export function isValidE2EUserId(value: string | undefined): value is string {
  return Boolean(value && UUID_PATTERN.test(value));
}
