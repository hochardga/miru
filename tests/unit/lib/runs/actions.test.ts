import { describe, expect, it, vi } from "vitest";
import type { GameActionResult, RunSnapshot } from "@/lib/game/types";
import {
  applyRunAction,
  InvalidActionForStateError,
  persistGameActionResult,
  StaleRunActionPersistenceError,
} from "@/lib/runs/actions";

function createReadySnapshot(overrides: Partial<RunSnapshot> = {}): RunSnapshot {
  return {
    run: {
      id: "run-1",
      title: "Field Notes",
      status: "active",
      rulesVersion: "miru1v2e",
      currentDay: 1,
      updatedAt: "2026-05-07T12:00:00.000Z",
    },
    stats: {
      hp: 10,
      ep: 10,
      baseAtk: 1,
      baseDef: 1,
      bitliths: 0,
      starvationCount: 0,
      sleepDeprivationCount: 0,
      minorInjuryCount: 0,
    },
    currentTile: {
      id: "tile-1",
      coordinate: "E01",
      row: 1,
      column: "E",
      terrain: "unknown",
      visited: true,
      icons: [],
      eventHistory: [],
      repeatabilityState: {},
      enemyState: null,
      notes: null,
    },
    visibleTiles: [],
    inventory: [
      {
        key: "meal-bar",
        name: "Meal Bar",
        category: "food",
        quantity: 3,
        metadata: {},
      },
    ],
    techSkills: [],
    activeEnemy: null,
    pendingPrompt: {
      type: "ready_for_next_day",
      title: "Ready",
      body: "Begin.",
    },
    legalActions: [{ type: "next_day", label: "Next Day" }],
    recentActions: [],
    latestJournalEntry: null,
    ...overrides,
  };
}

function createCampResult(): GameActionResult {
  const activeEnemy = {
    key: "drift-wight",
    name: "Drift Wight",
    hp: 5,
    atk: 2,
    def: 1,
    rewardKey: "wight-ash",
  };
  const diceRoll = {
    id: "roll-1",
    notation: "1d6" as const,
    purpose: "camp" as const,
    values: [4],
    total: 4,
  };

  return {
    snapshot: {
      ...createReadySnapshot(),
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
        enemyState: { ...activeEnemy, hp: 3 },
        notes: "The fog tastes metallic.",
      },
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
      activeEnemy,
      pendingPrompt: {
        type: "combat_choice",
        title: "A shape in the fog",
        body: "It blocks the ridge path.",
        enemy: activeEnemy,
      },
      legalActions: [
        {
          type: "combat_action",
          label: "Attack",
          payload: { move: "attack" },
        },
      ],
    },
    summary: {
      type: "camp",
      title: "Camp resolved",
      body: "You spend a meal bar and keep watch.",
      dayNumber: 2,
      tileId: "tile-1",
      diceRolls: [diceRoll],
    },
    diceRolls: [diceRoll],
  };
}

describe("applyRunAction", () => {
  it("loads, transitions, persists with the expected snapshot timestamp, logs, and reloads", async () => {
    const supabase = { rpc: vi.fn() };
    const initialSnapshot = createReadySnapshot();
    const getRunSnapshot = vi.fn()
      .mockResolvedValueOnce(initialSnapshot)
      .mockResolvedValueOnce({
        run: { id: "run-1" },
        legalActions: [{ type: "camp", label: "Camp" }],
      });
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

    expect(persistGameActionResult).toHaveBeenCalledWith({
      supabase,
      userId: "user-1",
      runId: "run-1",
      action: { type: "next_day" },
      expectedUpdatedAt: "2026-05-07T12:00:00.000Z",
      result: expect.objectContaining({
        summary: expect.objectContaining({ type: "next_day" }),
      }),
    });
    expect(getRunSnapshot).toHaveBeenCalledTimes(2);
    expect(result).not.toBeNull();
    expect(result?.snapshot).toEqual({
      run: { id: "run-1" },
      legalActions: [{ type: "camp", label: "Camp" }],
    });
    expect(result?.action).toMatchObject({
      id: "action-1",
      createdAt: "2026-05-07T14:00:00.000Z",
      type: "next_day",
    });
  });

  it("reloads the latest snapshot and exposes recovery actions after stale persistence", async () => {
    const supabase = { rpc: vi.fn() };
    const latestSnapshot = createReadySnapshot({
      legalActions: [{ type: "camp", label: "Camp" }],
    });
    const getRunSnapshot = vi.fn()
      .mockResolvedValueOnce(createReadySnapshot())
      .mockResolvedValueOnce(latestSnapshot);
    const persistGameActionResult = vi
      .fn()
      .mockRejectedValue(new StaleRunActionPersistenceError());

    let caughtError: unknown;
    try {
      await applyRunAction({
        supabase: supabase as never,
        userId: "user-1",
        runId: "run-1",
        action: { type: "next_day" },
        getRunSnapshot,
        persistGameActionResult,
      });
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(InvalidActionForStateError);
    expect(caughtError).toMatchObject({
      message: "INVALID_ACTION_FOR_STATE",
      validActions: [{ type: "camp", label: "Camp" }],
    });
    expect(getRunSnapshot).toHaveBeenCalledTimes(2);
  });
});

describe("persistGameActionResult", () => {
  it("persists the action result through the transactional RPC with serialized input", async () => {
    const result = createCampResult();
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: [
          {
            id: "action-1",
            created_at: "2026-05-07T14:00:00.000Z",
          },
        ],
        error: null,
      }),
    };

    const actionRow = await persistGameActionResult({
      supabase: supabase as never,
      userId: "user-1",
      runId: "run-1",
      action: { type: "camp", payload: { foodChoice: "skip_food" } },
      expectedUpdatedAt: "2026-05-07T12:00:00.000Z",
      result,
    });

    expect(actionRow).toEqual({
      id: "action-1",
      createdAt: "2026-05-07T14:00:00.000Z",
    });
    expect(supabase.rpc).toHaveBeenCalledWith("persist_run_action_result", {
      p_user_id: "user-1",
      p_run_id: "run-1",
      p_expected_updated_at: "2026-05-07T12:00:00.000Z",
      p_current_day: 2,
      p_hp: 8,
      p_ep: 7,
      p_base_atk: 4,
      p_base_def: 2,
      p_bitliths: 12,
      p_starvation_count: 1,
      p_sleep_deprivation_count: 2,
      p_minor_injury_count: 3,
      p_active_enemy: result.snapshot.activeEnemy,
      p_pending_prompt: result.snapshot.pendingPrompt,
      p_current_tile_id: "tile-1",
      p_terrain: "forest",
      p_visited: true,
      p_event_history: ["first-field-discovery"],
      p_repeatability_state: { firstFieldDiscovery: true },
      p_enemy_state: result.snapshot.currentTile.enemyState,
      p_notes: "The fog tastes metallic.",
      p_inventory: [
        {
          item_key: "meal-bar",
          quantity: 2,
          metadata: { sealed: true },
        },
        {
          item_key: "rusted-knife",
          quantity: 1,
          metadata: { edge: "chipped" },
        },
      ],
      p_action_input: {
        type: "camp",
        payload: { foodChoice: "skip_food" },
      },
      p_action_type: "camp",
      p_day_number: 2,
      p_tile_id: "tile-1",
      p_action_result: {
        title: "Camp resolved",
        body: "You spend a meal bar and keep watch.",
      },
      p_dice_rolls: result.diceRolls,
    });
  });

  it("maps stale RPC failures to a stale persistence error", async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { code: "40001", message: "STALE_RUN_ACTION" },
      }),
    };

    await expect(
      persistGameActionResult({
        supabase: supabase as never,
        userId: "user-1",
        runId: "run-1",
        action: { type: "camp", payload: { foodChoice: "skip_food" } },
        expectedUpdatedAt: "2026-05-07T12:00:00.000Z",
        result: createCampResult(),
      }),
    ).rejects.toBeInstanceOf(StaleRunActionPersistenceError);
  });
});
