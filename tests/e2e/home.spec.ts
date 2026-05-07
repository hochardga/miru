import { expect, test } from "@playwright/test";

test("home renders the Miru field-kit shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Miru" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start Run" })).toBeVisible();
  await expect(page.getByText("Guided solo play table")).toBeVisible();
});

test("home publishes a browser icon", async ({ page }) => {
  await page.goto("/");

  const icon = page.locator('link[rel~="icon"]').first();
  await expect(icon).toHaveAttribute("href", /icon/);

  const href = await icon.getAttribute("href");
  expect(href).toBeTruthy();

  const iconResponse = await page.request.get(href as string);
  expect(iconResponse.ok()).toBe(true);
});
