import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const uniqueIndexMigrationPath = path.resolve(
  __dirname,
  "../../../supabase/migrations/0004_journal_one_per_day.sql",
);
const rpcMigrationPath = path.resolve(
  __dirname,
  "../../../supabase/migrations/0005_persist_journal_entry.sql",
);

describe("0004_journal_one_per_day migration", () => {
  it("adds a one-entry-per-run-day constraint compatible with Supabase upsert", () => {
    const migration = fs.readFileSync(uniqueIndexMigrationPath, "utf8");

    expect(migration).toMatch(
      /create unique index journal_entries_run_id_day_number_key\s+on journal_entries\s*\(\s*run_id,\s*day_number\s*\)/i,
    );
  });

  it("does not reuse the existing 0003 migration number", () => {
    const migrationFile = path.basename(uniqueIndexMigrationPath);

    expect(migrationFile).toBe("0004_journal_one_per_day.sql");
  });
});

describe("0005_persist_journal_entry migration", () => {
  it("defines a transactional journal persistence RPC with auth and row locking", () => {
    const migration = fs.readFileSync(rpcMigrationPath, "utf8");

    expect(migration).toMatch(
      /create or replace function public\.persist_journal_entry\(/i,
    );
    expect(migration).toMatch(/language plpgsql/i);
    expect(migration).toMatch(/security invoker/i);
    expect(migration).toMatch(/set search_path = public,\s*auth/i);
    expect(migration).toMatch(
      /if auth\.uid\(\) is null or auth\.uid\(\) <> p_user_id then/i,
    );
    expect(migration).toMatch(
      /select \*[\s\S]+from runs[\s\S]+where runs\.id = p_run_id[\s\S]+and runs\.user_id = p_user_id[\s\S]+for update;/i,
    );
    expect(migration).toMatch(/raise exception 'RUN_NOT_FOUND'/i);
  });

  it("qualifies table predicates that would conflict with output parameters", () => {
    const migration = fs.readFileSync(rpcMigrationPath, "utf8");

    expect(migration).toMatch(
      /from runs\s+where runs\.id = p_run_id\s+and runs\.user_id = p_user_id\s+for update;/i,
    );
    expect(migration).toMatch(
      /from run_tiles\s+where run_tiles\.id = v_tile_id\s+and run_tiles\.run_id = p_run_id\s+and run_tiles\.user_id = p_user_id;/i,
    );
    expect(migration).toMatch(
      /update runs[\s\S]+where runs\.id = p_run_id\s+and runs\.user_id = p_user_id;/i,
    );
  });

  it("gates writes to the active journal prompt day and tile", () => {
    const migration = fs.readFileSync(rpcMigrationPath, "utf8");

    expect(migration).toMatch(
      /v_run\.pending_prompt is null[\s\S]+v_run\.pending_prompt->>'type' <> 'journal_available'/i,
    );
    expect(migration).toMatch(/raise exception 'INVALID_JOURNAL_STATE'/i);
    expect(migration).toMatch(/v_prompt_day := \(v_run\.pending_prompt->>'dayNumber'\)::integer/i);
    expect(migration).toMatch(/v_prompt_day is distinct from p_day_number/i);
    expect(migration).toMatch(/v_prompt_tile_id := \(v_run\.pending_prompt->>'tileId'\)::uuid/i);
    expect(migration).toMatch(/v_tile_id is distinct from v_prompt_tile_id/i);
    expect(migration).toMatch(/from run_tiles[\s\S]+where run_tiles\.id = v_tile_id[\s\S]+and run_tiles\.run_id = p_run_id[\s\S]+and run_tiles\.user_id = p_user_id/i);
    expect(migration).toMatch(/raise exception 'RUN_TILE_NOT_FOUND'/i);
  });

  it("upserts the journal entry and advances the run prompt in one function", () => {
    const migration = fs.readFileSync(rpcMigrationPath, "utf8");

    expect(migration).toMatch(/insert into journal_entries\s*\(/i);
    expect(migration).toMatch(/on conflict\s*\(\s*run_id,\s*day_number\s*\)\s*do update/i);
    expect(migration).toMatch(/returning\s+journal_entries\.id/i);
    expect(migration).toMatch(/update runs\s+set/i);
    expect(migration).toMatch(/last_journal_entry = p_body/i);
    expect(migration).toMatch(/pending_prompt = jsonb_build_object\(/i);
    expect(migration).toMatch(/'type',\s*'day_complete'/i);
    expect(migration).toMatch(/grant execute on function public\.persist_journal_entry/i);
  });
});
