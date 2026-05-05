import { expect, test } from "@playwright/test";

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
