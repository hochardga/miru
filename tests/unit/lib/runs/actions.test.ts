import { afterEach, describe, expect, it, vi } from "vitest";
import type { GameActionResult } from "@/lib/game/types";
import { applyRunAction, persistGameActionResult } from "@/lib/runs/actions";

type EqCall = [column: string, value: unknown];

function createSupabaseRecorder(actionRow = {
  id: "action-1",
  created_at: "2026-05-07T14:00:00.000Z",
}) {
  const updateCalls: Array<{
    table: string;
    payload: Record<string, unknown>;
    eqs: EqCall[];
  }> = [];
  const insertCalls: Array<{
    table: string;
    payload: Record<string, unknown>;
  }> = [];
  const supabase = {
    from: vi.fn((table: string) => {
      const eqs: EqCall[] = [];
      const builder = {
        update: vi.fn((payload: Record<string, unknown>) => {
          updateCalls.push({ table, payload, eqs });
          return builder;
        }),
        insert: vi.fn((payload: Record<string, unknown>) => {
          insertCalls.push({ table, payload });
          return builder;
        }),
        select: vi.fn(() => builder),
        single: vi.fn(() => Promise.resolve({ data: actionRow, error: null })),
        eq: vi.fn((column: string, value: unknown) => {
          eqs.push([column, value]);
          return builder;
        }),
        then: (
          onFulfilled: (value: { error: null }) => unknown,
          onRejected?: (reason: unknown) => unknown,
        ) => Promise.resolve({ error: null }).then(onFulfilled, onRejected),
      };

      return builder;
    }),
  };

  return { supabase, updateCalls, insertCalls };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("applyRunAction", () => {
  it("loads, transitions, persists, logs, and reloads a run snapshot", async () => {
    const supabase = { from: vi.fn() };
    const getRunSnapshot = vi.fn()
      .mockResolvedValueOnce({
        run: { id: "run-1", currentDay: 1 },
        stats: { hp: 10, ep: 10, baseAtk: 1, baseDef: 1, bitliths: 0, starvationCount: 0, sleepDeprivationCount: 0, minorInjuryCount: 0 },
        currentTile: { id: "tile-1", coordinate: "E01", row: 1, column: "E", terrain: "unknown", visited: true, icons: [], eventHistory: [], repeatabilityState: {}, enemyState: null, notes: null },
        visibleTiles: [],
        inventory: [{ key: "meal-bar", name: "Meal Bar", category: "food", quantity: 3, metadata: {} }],
        techSkills: [],
        activeEnemy: null,
        pendingPrompt: { type: "ready_for_next_day", title: "Ready", body: "Begin." },
        legalActions: [{ type: "next_day", label: "Next Day" }],
        recentActions: [],
        latestJournalEntry: null,
      })
      .mockResolvedValueOnce({ run: { id: "run-1" }, legalActions: [{ type: "camp", label: "Camp" }] });
    const persistGameActionResult = vi.fn().mockResolvedValue({
      id: "action-1",
      createdAt: "2026-05-07T14:00:00.000Z",
    });

    const result = await applyRunAction({
      supabase: supabase as never,
      userId: "user-1",
      runId: "run-1",
      action: { type: "next_day" },
      getRunSnapshot,
      persistGameActionResult,
    });

    expect(persistGameActionResult).toHaveBeenCalled();
    expect(getRunSnapshot).toHaveBeenCalledTimes(2);
    expect(result).not.toBeNull();
    expect(result?.snapshot).toEqual({ run: { id: "run-1" }, legalActions: [{ type: "camp", label: "Camp" }] });
    expect(result?.action).toMatchObject({
      id: "action-1",
      createdAt: "2026-05-07T14:00:00.000Z",
      type: "next_day",
    });
  });
});

describe("persistGameActionResult", () => {
  it("persists run state, tile state, inventory state, and action log rows", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-07T13:00:00.000Z"));

    const activeEnemy = {
      key: "drift-wight",
      name: "Drift Wight",
      hp: 5,
      atk: 2,
      def: 1,
      rewardKey: "wight-ash",
    };
    const tileEnemy = { ...activeEnemy, hp: 3 };
    const pendingPrompt = {
      type: "combat_choice" as const,
      title: "A shape in the fog",
      body: "It blocks the ridge path.",
      enemy: activeEnemy,
    };
    const diceRoll = {
      id: "roll-1",
      notation: "1d6" as const,
      purpose: "event" as const,
      values: [4],
      total: 4,
    };
    const result: GameActionResult = {
      snapshot: {
        run: {
          id: "run-1",
          title: "Field Notes",
          status: "active",
          rulesVersion: "miru1v2e",
          currentDay: 2,
          updatedAt: "2026-05-07T12:00:00.000Z",
        },
        stats: {
          hp: 8,
          ep: 7,
          baseAtk: 4,
          baseDef: 2,
          bitliths: 12,
          starvationCount: 1,
          sleepDeprivationCount: 2,
          minorInjuryCount: 3,
        },
        currentTile: {
          id: "tile-1",
          coordinate: "E01",
          row: 1,
          column: "E",
          terrain: "forest",
          visited: true,
          icons: ["enemy"],
          eventHistory: ["first-field-discovery"],
          repeatabilityState: { firstFieldDiscovery: true },
          enemyState: tileEnemy,
          notes: "The fog tastes metallic.",
        },
        visibleTiles: [],
        inventory: [
          {
            key: "meal-bar",
            name: "Meal Bar",
            category: "food",
            quantity: 2,
            metadata: { sealed: true },
          },
          {
            key: "rusted-knife",
            name: "Rusted Knife",
            category: "equipment",
            quantity: 1,
            metadata: { edge: "chipped" },
          },
        ],
        techSkills: [],
        activeEnemy,
        pendingPrompt,
        legalActions: [{ type: "combat_action", label: "Attack", payload: { move: "attack" } }],
        recentActions: [],
        latestJournalEntry: null,
      },
      summary: {
        type: "next_day",
        title: "A quiet field discovery",
        body: "The grass bends toward something unseen.",
        dayNumber: 2,
        tileId: "tile-1",
        diceRolls: [diceRoll],
      },
      diceRolls: [diceRoll],
    };
    const { supabase, updateCalls, insertCalls } = createSupabaseRecorder();

    const actionRow = await persistGameActionResult({
      supabase: supabase as never,
      userId: "user-1",
      runId: "run-1",
      result,
    });

    expect(actionRow).toEqual({
      id: "action-1",
      createdAt: "2026-05-07T14:00:00.000Z",
    });

    const runUpdate = updateCalls.find((call) => call.table === "runs");
    expect(runUpdate?.payload).toEqual({
      current_day: 2,
      hp: 8,
      ep: 7,
      base_atk: 4,
      base_def: 2,
      bitliths: 12,
      starvation_count: 1,
      sleep_deprivation_count: 2,
      minor_injury_count: 3,
      active_enemy: activeEnemy,
      pending_prompt: pendingPrompt,
      updated_at: "2026-05-07T13:00:00.000Z",
    });
    expect(runUpdate?.eqs).toEqual([
      ["id", "run-1"],
      ["user_id", "user-1"],
    ]);

    const tileUpdate = updateCalls.find((call) => call.table === "run_tiles");
    expect(tileUpdate?.payload).toEqual({
      terrain: "forest",
      visited: true,
      event_history: ["first-field-discovery"],
      repeatability_state: { firstFieldDiscovery: true },
      enemy_state: tileEnemy,
      notes: "The fog tastes metallic.",
      updated_at: "2026-05-07T13:00:00.000Z",
    });
    expect(tileUpdate?.eqs).toEqual([
      ["id", "tile-1"],
      ["run_id", "run-1"],
      ["user_id", "user-1"],
    ]);

    const inventoryUpdates = updateCalls.filter((call) => call.table === "run_inventory");
    expect(inventoryUpdates).toHaveLength(2);
    expect(inventoryUpdates.map((call) => call.payload)).toEqual([
      {
        quantity: 2,
        metadata: { sealed: true },
        updated_at: "2026-05-07T13:00:00.000Z",
      },
      {
        quantity: 1,
        metadata: { edge: "chipped" },
        updated_at: "2026-05-07T13:00:00.000Z",
      },
    ]);
    expect(inventoryUpdates.map((call) => call.eqs)).toEqual([
      [
        ["run_id", "run-1"],
        ["user_id", "user-1"],
        ["item_key", "meal-bar"],
      ],
      [
        ["run_id", "run-1"],
        ["user_id", "user-1"],
        ["item_key", "rusted-knife"],
      ],
    ]);

    expect(insertCalls).toEqual([
      {
        table: "action_log",
        payload: {
          run_id: "run-1",
          user_id: "user-1",
          action_type: "next_day",
          day_number: 2,
          tile_id: "tile-1",
          input: {},
          result: {
            title: "A quiet field discovery",
            body: "The grass bends toward something unseen.",
          },
          dice_rolls: [diceRoll],
        },
      },
    ]);
  });
});
