import { applyGameAction } from "@/lib/game/engine";
import type { GameAction, GameActionResult, RunSnapshot } from "@/lib/game/types";
import type { RouteSupabaseClient } from "@/lib/runs/queries";
import { getRunSnapshot as defaultGetRunSnapshot } from "@/lib/runs/snapshot";

export class InvalidActionForStateError extends Error {
  validActions: RunSnapshot["legalActions"];

  constructor(validActions: RunSnapshot["legalActions"]) {
    super("INVALID_ACTION_FOR_STATE");
    this.name = "InvalidActionForStateError";
    this.validActions = validActions;
  }
}

export async function persistGameActionResult({
  supabase,
  userId,
  runId,
  result,
}: {
  supabase: RouteSupabaseClient;
  userId: string;
  runId: string;
  result: GameActionResult;
}) {
  const { snapshot, summary } = result;
  const updatedAt = new Date().toISOString();
  const { error: runError } = await supabase
    .from("runs")
    .update({
      current_day: snapshot.run.currentDay,
      hp: snapshot.stats.hp,
      ep: snapshot.stats.ep,
      base_atk: snapshot.stats.baseAtk,
      base_def: snapshot.stats.baseDef,
      bitliths: snapshot.stats.bitliths,
      starvation_count: snapshot.stats.starvationCount,
      sleep_deprivation_count: snapshot.stats.sleepDeprivationCount,
      minor_injury_count: snapshot.stats.minorInjuryCount,
      active_enemy: snapshot.activeEnemy,
      pending_prompt: snapshot.pendingPrompt,
      updated_at: updatedAt,
    })
    .eq("id", runId)
    .eq("user_id", userId);

  if (runError) {
    throw runError;
  }

  const { error: tileError } = await supabase
    .from("run_tiles")
    .update({
      terrain: snapshot.currentTile.terrain,
      visited: snapshot.currentTile.visited,
      event_history: snapshot.currentTile.eventHistory,
      repeatability_state: snapshot.currentTile.repeatabilityState,
      enemy_state: snapshot.currentTile.enemyState,
      notes: snapshot.currentTile.notes,
      updated_at: updatedAt,
    })
    .eq("id", snapshot.currentTile.id)
    .eq("run_id", runId)
    .eq("user_id", userId);

  if (tileError) {
    throw tileError;
  }

  await Promise.all(
    snapshot.inventory.map((item) =>
      supabase
        .from("run_inventory")
        .update({
          quantity: item.quantity,
          metadata: item.metadata,
          updated_at: updatedAt,
        })
        .eq("run_id", runId)
        .eq("user_id", userId)
        .eq("item_key", item.key)
        .then(({ error }) => {
          if (error) {
            throw error;
          }
        }),
    ),
  );

  const { data: action, error: actionError } = await supabase
    .from("action_log")
    .insert({
      run_id: runId,
      user_id: userId,
      action_type: summary.type,
      day_number: summary.dayNumber,
      tile_id: summary.tileId,
      input: {},
      result: { title: summary.title, body: summary.body },
      dice_rolls: result.diceRolls,
    })
    .select("id,created_at")
    .single();

  if (actionError) {
    throw actionError;
  }

  if (!action) {
    throw new Error("Action log insert did not return a row.");
  }

  return {
    id: action.id as string,
    createdAt: action.created_at as string,
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

  const actionRow = await persist({ supabase, userId, runId, result });
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
