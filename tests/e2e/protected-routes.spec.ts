import { expect, test } from "@playwright/test";

const smokePublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "test-anon-key",
  NEXT_PUBLIC_APP_URL:
    process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100",
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((env) => {
    window.process = {
      ...window.process,
      env: {
        ...(window.process?.env ?? {}),
        ...env,
      },
    };
  }, smokePublicEnv);
});

const protectedRoutes = [
  "/runs",
  "/rules",
  "/settings",
  "/play/smoke-run-id",
] as const;

for (const path of protectedRoutes) {
  test(`unauthenticated visitors are redirected away from ${path}`, async ({
    page,
  }) => {
    await page.goto(path);

    await expect(page).toHaveURL(/\/\?reason=session-required$/);
    await expect(page.getByRole("button", { name: "Start Run" })).toBeVisible();
  });
}
