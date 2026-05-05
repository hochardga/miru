import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const initialSchemaPath = path.resolve(
  __dirname,
  "../../../supabase/migrations/0001_initial_schema.sql",
);

describe("0001_initial_schema migration", () => {
  it("clears runs.current_tile_id before deleting a run tile", () => {
    const migration = fs.readFileSync(initialSchemaPath, "utf8");

    expect(migration).toMatch(
      /update runs\s+set current_tile_id = null\s+where id = old\.run_id\s+and current_tile_id = old\.id;/i,
    );
  });
});
