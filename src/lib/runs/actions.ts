import { applyGameAction } from "@/lib/game/engine";
import type { GameAction, GameActionResult, RunSnapshot } from "@/lib/game/types";
import type { RouteSupabaseClient } from "@/lib/runs/queries";
import { getRunSnapshot as defaultGetRunSnapshot } from "@/lib/runs/snapshot";

const STALE_RUN_ACTION_MESSAGE = "STALE_RUN_ACTION";

type PersistRunActionRow = {
  id: string;
  created_at: string;
};

export class InvalidActionForStateError extends Error {
  validActions: RunSnapshot["legalActions"];

  constructor(validActions: RunSnapshot["legalActions"]) {
    super("INVALID_ACTION_FOR_STATE");
    this.name = "InvalidActionForStateError";
    this.validActions = validActions;
  }
}

export class StaleRunActionPersistenceError extends Error {
  constructor() {
    super(STALE_RUN_ACTION_MESSAGE);
    this.name = "StaleRunActionPersistenceError";
  }
}

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return null;
}

function isStaleRunActionPersistenceError(error: unknown) {
  return error instanceof StaleRunActionPersistenceError || isStaleRunActionRpcError(error);
}

function isStaleRunActionRpcError(error: unknown) {
  return errorMessage(error)?.includes(STALE_RUN_ACTION_MESSAGE) ?? false;
}

function serializeActionInput(action: GameAction) {
  const input: Record<string, unknown> = { type: action.type };

  if ("payload" in action && action.payload !== undefined) {
    input.payload = action.payload;
  }

  return input;
}

export async function persistGameActionResult({
  supabase,
  userId,
  runId,
  action,
  expectedUpdatedAt,
  result,
}: {
  supabase: RouteSupabaseClient;
  userId: string;
  runId: string;
  action: GameAction;
  expectedUpdatedAt: string;
  result: GameActionResult;
}) {
  const { snapshot, summary } = result;
  const { data, error } = await supabase.rpc("persist_run_action_result", {
    p_user_id: userId,
    p_run_id: runId,
    p_expected_updated_at: expectedUpdatedAt,
    p_current_day: snapshot.run.currentDay,
    p_hp: snapshot.stats.hp,
    p_ep: snapshot.stats.ep,
    p_base_atk: snapshot.stats.baseAtk,
    p_base_def: snapshot.stats.baseDef,
    p_bitliths: snapshot.stats.bitliths,
    p_starvation_count: snapshot.stats.starvationCount,
    p_sleep_deprivation_count: snapshot.stats.sleepDeprivationCount,
    p_minor_injury_count: snapshot.stats.minorInjuryCount,
    p_active_enemy: snapshot.activeEnemy,
    p_pending_prompt: snapshot.pendingPrompt,
    p_current_tile_id: snapshot.currentTile.id,
    p_terrain: snapshot.currentTile.terrain,
    p_visited: snapshot.currentTile.visited,
    p_event_history: snapshot.currentTile.eventHistory,
    p_repeatability_state: snapshot.currentTile.repeatabilityState,
    p_enemy_state: snapshot.currentTile.enemyState,
    p_notes: snapshot.currentTile.notes,
    p_inventory: snapshot.inventory.map((item) => ({
      item_key: item.key,
      item_name: item.name,
      category: item.category,
      quantity: item.quantity,
      metadata: item.metadata,
    })),
    p_action_input: serializeActionInput(action),
    p_action_type: summary.type,
    p_day_number: summary.dayNumber,
    p_tile_id: summary.tileId,
    p_action_result: { title: summary.title, body: summary.body },
    p_dice_rolls: result.diceRolls,
  });

  if (error) {
    if (isStaleRunActionRpcError(error)) {
      throw new StaleRunActionPersistenceError();
    }

    throw error;
  }

  const row = (Array.isArray(data) ? data[0] : data) as PersistRunActionRow | null;

  if (!row?.id || !row.created_at) {
    throw new Error("persist_run_action_result returned an incomplete row.");
  }

  return {
    id: row.id,
    createdAt: row.created_at,
  };
}

export async function applyRunAction({
  supabase,
  userId,
  runId,
  action,
  getRunSnapshot = defaultGetRunSnapshot,
  persistGameActionResult: persist = persistGameActionResult,
}: {
  supabase: RouteSupabaseClient;
  userId: string;
  runId: string;
  action: GameAction;
  getRunSnapshot?: typeof defaultGetRunSnapshot;
  persistGameActionResult?: typeof persistGameActionResult;
}) {
  const snapshot = await getRunSnapshot(supabase, userId, runId);

  if (!snapshot) {
    return null;
  }

  let result: GameActionResult;

  try {
    result = applyGameAction(snapshot, action);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ACTION_FOR_STATE") {
      throw new InvalidActionForStateError(snapshot.legalActions);
    }

    throw error;
  }

  let actionRow: Awaited<ReturnType<typeof persistGameActionResult>>;

  try {
    actionRow = await persist({
      supabase,
      userId,
      runId,
      action,
      expectedUpdatedAt: snapshot.run.updatedAt,
      result,
    });
  } catch (error) {
    if (isStaleRunActionPersistenceError(error)) {
      const latestSnapshot = await getRunSnapshot(supabase, userId, runId).catch(() => null);
      throw new InvalidActionForStateError(latestSnapshot?.legalActions ?? snapshot.legalActions);
    }

    throw error;
  }

  const updatedSnapshot = await getRunSnapshot(supabase, userId, runId);

  if (!updatedSnapshot) {
    throw new Error("Run disappeared after action persistence.");
  }

  return {
    snapshot: updatedSnapshot,
    action: {
      ...result.summary,
      id: actionRow.id,
      createdAt: actionRow.createdAt,
    },
  };
}
