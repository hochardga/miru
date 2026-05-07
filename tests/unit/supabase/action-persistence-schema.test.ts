import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = path.resolve(
  __dirname,
  "../../../supabase/migrations/0003_persist_run_action_result.sql",
);

describe("0003_persist_run_action_result migration", () => {
  it("defines a transactional action persistence RPC with locking and stale guards", () => {
    const migration = fs.readFileSync(migrationPath, "utf8");

    expect(migration).toMatch(
      /create or replace function public\.persist_run_action_result\(/i,
    );
    expect(migration).toMatch(/language plpgsql/i);
    expect(migration).toMatch(/security invoker/i);
    expect(migration).toMatch(/set search_path = public,\s*auth/i);
    expect(migration).toMatch(
      /if auth\.uid\(\) is null or auth\.uid\(\) <> p_user_id then/i,
    );
    expect(migration).toMatch(
      /select \*[\s\S]+from runs[\s\S]+where id = p_run_id[\s\S]+and user_id = p_user_id[\s\S]+for update;/i,
    );
    expect(migration).toMatch(/v_run\.updated_at is distinct from p_expected_updated_at/i);
    expect(migration).toMatch(/raise exception 'STALE_RUN_ACTION'/i);
    expect(migration).toMatch(/insert into action_log\s*\(/i);
    expect(migration).toMatch(/input,\s*result,\s*dice_rolls/i);
    expect(migration).toMatch(
      /returning action_log\.id,\s*action_log\.created_at\s+into/i,
    );
    expect(migration).toMatch(/grant execute on function public\.persist_run_action_result/i);
  });
});
