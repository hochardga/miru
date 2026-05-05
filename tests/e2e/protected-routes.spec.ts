import { expect, test } from "@playwright/test";

test("protected routes redirect an unauthenticated visitor to home", async ({
  page,
}) => {
  await page.goto("/runs");

  await expect(page).toHaveURL(/\/\?reason=session-required/);
  await expect(page.getByRole("button", { name: "Start Run" })).toBeVisible();
});
