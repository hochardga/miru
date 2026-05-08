import { coordinateToId, getVisibleMapTiles } from "@/lib/game/map";
import type { RunPrompt, RunSnapshot, RunTile } from "@/lib/game/types";
import { UUID_PATTERN, type RouteSupabaseClient } from "@/lib/runs/queries";

type RunTileRow = {
  id: string;
  row_number: number;
  column_letter: string;
  terrain: RunTile["terrain"];
  visited: boolean;
  icons: RunTile["icons"] | null;
  event_history: string[] | null;
  repeatability_state: Record<string, unknown> | null;
  enemy_state: RunTile["enemyState"];
  notes: string | null;
};
type ActionLogRow = {
  id: string;
  action_type: RunSnapshot["recentActions"][number]["type"];
  day_number: number;
  tile_id: string | null;
  result: Record<string, unknown> | null;
  dice_rolls: RunSnapshot["recentActions"][number]["diceRolls"] | null;
  created_at: string;
};
type JournalEntryRow = {
  id: string;
  run_id: string;
  day_number: number;
  tile_id: string | null;
  body: string;
  updated_at: string;
};

export class RunSnapshotIncompleteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RunSnapshotIncompleteError";
  }
}

function defaultPrompt(): RunPrompt {
  return {
    type: "ready_for_next_day",
    title: "Ready for the next day",
    body: "Begin the next day when your notes are settled.",
  };
}

function mapTile(row: RunTileRow): RunTile {
  const rowNumber = row.row_number as RunTile["row"];
  const column = row.column_letter as RunTile["column"];

  return {
    id: row.id,
    row: rowNumber,
    column,
    coordinate: coordinateToId({
      row: rowNumber,
      column,
    }),
    terrain: row.terrain,
    visited: row.visited,
    icons: row.icons ?? [],
    eventHistory: row.event_history ?? [],
    repeatabilityState: row.repeatability_state ?? {},
    enemyState: row.enemy_state ?? null,
    notes: row.notes,
  };
}

function stringFromResult(
  result: ActionLogRow["result"],
  key: "title" | "body",
  fallback: string,
) {
  const value = result?.[key];

  return String(value ?? fallback);
}

function mapAction(row: ActionLogRow): RunSnapshot["recentActions"][number] {
  return {
    id: row.id,
    type: row.action_type,
    title: stringFromResult(row.result, "title", row.action_type),
    body: stringFromResult(row.result, "body", ""),
    dayNumber: row.day_number,
    tileId: row.tile_id,
    diceRolls: row.dice_rolls ?? [],
    createdAt: row.created_at,
  };
}

function mapJournalEntry(
  row: JournalEntryRow | null,
): RunSnapshot["latestJournalEntry"] {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    runId: row.run_id,
    dayNumber: row.day_number,
    tileId: row.tile_id,
    body: row.body,
    updatedAt: row.updated_at,
  };
}

export function mapRunRowsToSnapshot(input: {
  run: {
    id: string;
    title: string;
    status: RunSnapshot["run"]["status"];
    rules_version: "miru1v2e";
    current_day: number;
    hp: number;
    ep: number;
    base_atk: number;
    base_def: number;
    bitliths: number;
    starvation_count: number;
    sleep_deprivation_count: number;
    minor_injury_count: number;
    active_enemy: RunSnapshot["activeEnemy"];
    pending_prompt: RunPrompt | null;
    current_tile_id?: string | null;
    updated_at: string;
    last_journal_entry?: string | null;
  };
  currentTile: RunTileRow;
  visibleTiles: RunTileRow[];
  inventory: Array<{
    item_key: string;
    item_name: string;
    category: RunSnapshot["inventory"][number]["category"];
    quantity: number;
    metadata: Record<string, unknown> | null;
  }>;
  techSkills: Array<{
    skill_key: string;
    skill_name: string;
    unlocked: boolean;
    training_level: number;
  }>;
  recentActions: RunSnapshot["recentActions"];
  latestJournalEntry: RunSnapshot["latestJournalEntry"];
}): RunSnapshot {
  const currentTile = mapTile(input.currentTile);
  const prompt = input.run.pending_prompt ?? defaultPrompt();

  return {
    run: {
      id: input.run.id,
      title: input.run.title,
      status: input.run.status,
      rulesVersion: input.run.rules_version,
      currentDay: input.run.current_day,
      updatedAt: input.run.updated_at,
    },
    stats: {
      hp: input.run.hp,
      ep: input.run.ep,
      baseAtk: input.run.base_atk,
      baseDef: input.run.base_def,
      bitliths: input.run.bitliths,
      starvationCount: input.run.starvation_count,
      sleepDeprivationCount: input.run.sleep_deprivation_count,
      minorInjuryCount: input.run.minor_injury_count,
    },
    currentTile,
    visibleTiles: getVisibleMapTiles(input.visibleTiles.map(mapTile)),
    inventory: input.inventory.map((item) => ({
      key: item.item_key,
      name: item.item_name,
      category: item.category,
      quantity: item.quantity,
      metadata: item.metadata ?? {},
    })),
    techSkills: input.techSkills.map((skill) => ({
      key: skill.skill_key,
      name: skill.skill_name,
      unlocked: skill.unlocked,
      trainingLevel: skill.training_level,
    })),
    activeEnemy: input.run.active_enemy,
    pendingPrompt: prompt,
    legalActions:
      prompt.type === "camp_required"
        ? [
            {
              type: "camp",
              label: "Camp",
              payload: { foodChoice: "eat_meal_bar" },
            },
          ]
        : prompt.type === "journal_available"
          ? [{ type: "journal", label: "Write Journal" }]
          : prompt.type === "combat_choice"
            ? [
                {
                  type: "combat_action",
                  label: "Attack",
                  payload: { move: "attack" },
                },
              ]
            : [{ type: "next_day", label: "Next Day" }],
    recentActions: input.recentActions,
    latestJournalEntry: input.latestJournalEntry,
  };
}

export async function getRunSnapshot(
  supabase: RouteSupabaseClient,
  userId: string,
  runId: string,
) {
  if (!UUID_PATTERN.test(runId)) {
    return null;
  }

  const { data: run, error: runError } = await supabase
    .from("runs")
    .select("*")
    .eq("id", runId)
    .eq("user_id", userId)
    .maybeSingle();

  if (runError) {
    throw runError;
  }

  if (!run) {
    return null;
  }

  if (!run.current_tile_id) {
    throw new RunSnapshotIncompleteError("Run is missing a current tile.");
  }

  const { data: currentTile, error: currentTileError } = await supabase
    .from("run_tiles")
    .select("*")
    .eq("id", run.current_tile_id)
    .eq("run_id", run.id)
    .maybeSingle();

  if (currentTileError) {
    throw currentTileError;
  }

  if (!currentTile) {
    throw new RunSnapshotIncompleteError("Current tile could not be loaded.");
  }

  const [
    { data: visibleTiles, error: visibleTilesError },
    { data: inventory, error: inventoryError },
    { data: techSkills, error: techSkillsError },
    { data: recentActions, error: recentActionsError },
    { data: latestJournal, error: journalError },
  ] = await Promise.all([
    supabase.from("run_tiles").select("*").eq("run_id", run.id),
    supabase
      .from("run_inventory")
      .select("*")
      .eq("run_id", run.id)
      .order("category")
      .order("item_name"),
    supabase
      .from("tech_skills")
      .select("*")
      .eq("run_id", run.id)
      .order("skill_name"),
    supabase
      .from("action_log")
      .select("id,action_type,day_number,tile_id,result,dice_rolls,created_at")
      .eq("run_id", run.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("journal_entries")
      .select("id,run_id,day_number,tile_id,body,updated_at")
      .eq("run_id", run.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (visibleTilesError) {
    throw visibleTilesError;
  }

  if (inventoryError) {
    throw inventoryError;
  }

  if (techSkillsError) {
    throw techSkillsError;
  }

  if (recentActionsError) {
    throw recentActionsError;
  }

  if (journalError) {
    throw journalError;
  }

  return mapRunRowsToSnapshot({
    run,
    currentTile,
    visibleTiles: visibleTiles ?? [],
    inventory: inventory ?? [],
    techSkills: techSkills ?? [],
    recentActions: ((recentActions ?? []) as ActionLogRow[]).map(mapAction),
    latestJournalEntry: mapJournalEntry(latestJournal as JournalEntryRow | null),
  });
}
