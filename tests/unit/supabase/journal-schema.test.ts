import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = path.resolve(
  __dirname,
  "../../../supabase/migrations/0004_journal_one_per_day.sql",
);

describe("0004_journal_one_per_day migration", () => {
  it("adds a one-entry-per-run-day constraint compatible with Supabase upsert", () => {
    const migration = fs.readFileSync(migrationPath, "utf8");

    expect(migration).toMatch(
      /create unique index journal_entries_run_id_day_number_key\s+on journal_entries\s*\(\s*run_id,\s*day_number\s*\)/i,
    );
  });

  it("does not reuse the existing 0003 migration number", () => {
    const migrationFile = path.basename(migrationPath);

    expect(migrationFile).toBe("0004_journal_one_per_day.sql");
  });
});
