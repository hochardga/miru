import { expect, test } from "@playwright/test";

const journalEntry =
  "Day 1: The route opened into quiet field work, so I marked the grasslands and made camp.";

test("a player can start, resolve, journal, autosave, and resume a first run", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Start Run" }).click();

  await expect(page).toHaveURL(/\/play\/[0-9a-f-]+$/i);
  await expect(
    page.getByRole("heading", { name: "Ready for the next day" }),
  ).toBeVisible();
  await expect(page.getByText("Meal Bar")).toBeVisible();

  await page.getByRole("button", { name: "Next Day" }).click();

  await expect(
    page.getByRole("heading", { name: "Make camp" }),
  ).toBeVisible();
  await expect(page.getByText("A quiet field discovery")).toBeVisible();
  await expect(page.getByText("grasslands")).toBeVisible();

  await page.getByRole("button", { name: "Camp" }).click();

  await expect(
    page.getByRole("heading", { name: "Write the day down" }),
  ).toBeVisible();
  await expect(page.getByLabel("Journal Entry")).toBeVisible();

  await page.getByLabel("Journal Entry").fill(journalEntry);
  await page.getByRole("button", { name: "Save Journal" }).click();

  await expect(
    page.getByRole("heading", { name: "Day recorded" }),
  ).toBeVisible();
  await expect(page.getByText(journalEntry)).toBeVisible();

  await page.reload();

  await expect(
    page.getByRole("heading", { name: "Day recorded" }),
  ).toBeVisible();
  await expect(page.getByText(journalEntry)).toBeVisible();

  await page.goto("/runs");
  await expect(page.getByRole("heading", { name: "Runs" })).toBeVisible();
  await expect(page.getByText(journalEntry)).toBeVisible();

  await page.getByRole("link", { name: "Resume" }).click();

  await expect(page).toHaveURL(/\/play\/[0-9a-f-]+$/i);
  await expect(
    page.getByRole("heading", { name: "Day recorded" }),
  ).toBeVisible();
  await expect(page.getByText(journalEntry)).toBeVisible();
});
