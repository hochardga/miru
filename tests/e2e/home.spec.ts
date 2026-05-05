import { expect, test } from "@playwright/test";

test("home renders the Miru field-kit shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Miru" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start Run" })).toBeVisible();
  await expect(page.getByText("Guided solo play table")).toBeVisible();
});
