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

test("home renders the Miru field-kit shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Miru" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start Run" })).toBeVisible();
  await expect(page.getByText("Guided solo play table")).toBeVisible();
});
