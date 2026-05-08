import { describe, expect, it, vi } from "vitest";
import { getRunSnapshot, mapRunRowsToSnapshot } from "@/lib/runs/snapshot";

const runId = "00000000-0000-4000-8000-000000000001";
const tileId = "00000000-0000-4000-8000-000000000002";

function baseRun() {
  return {
    id: runId,
    title: "Field Notes",
    status: "active" as const,
    rules_version: "miru1v2e" as const,
    current_day: 1,
    hp: 10,
    ep: 10,
    base_atk: 1,
    base_def: 1,
    bitliths: 0,
    starvation_count: 0,
    sleep_deprivation_count: 0,
    minor_injury_count: 0,
    active_enemy: null,
    pending_prompt: null,
    current_tile_id: tileId,
    updated_at: "2026-05-07T00:00:00.000Z",
    last_journal_entry: null,
  };
}

function baseTile() {
  return {
    id: tileId,
    row_number: 1,
    column_letter: "E",
    terrain: "unknown" as const,
    visited: true,
    icons: [],
    event_history: [],
    repeatability_state: {},
    enemy_state: null,
    notes: null,
  };
}

describe("mapRunRowsToSnapshot", () => {
  it("maps persisted rows to a resumable RunSnapshot", () => {
    const snapshot = mapRunRowsToSnapshot({
      run: {
        ...baseRun(),
        id: "run-1",
        current_tile_id: "tile-1",
      },
      currentTile: { ...baseTile(), id: "tile-1" },
      visibleTiles: [],
      inventory: [
        {
          item_key: "meal-bar",
          item_name: "Meal Bar",
          category: "food",
          quantity: 3,
          metadata: {},
        },
      ],
      techSkills: [],
      recentActions: [],
      latestJournalEntry: null,
    });

    expect(snapshot.currentTile.coordinate).toBe("E01");
    expect(snapshot.pendingPrompt.type).toBe("ready_for_next_day");
    expect(snapshot.legalActions).toEqual([
      { type: "next_day", label: "Next Day" },
    ]);
  });

  it("preserves recent actions and the latest journal entry", () => {
    const snapshot = mapRunRowsToSnapshot({
      run: baseRun(),
      currentTile: baseTile(),
      visibleTiles: [],
      inventory: [],
      techSkills: [],
      recentActions: [
        {
          id: "action-1",
          type: "next_day",
          title: "Day 2",
          body: "You reached the black obelisk.",
          dayNumber: 2,
          tileId,
          diceRolls: [],
          createdAt: "2026-05-07T02:00:00.000Z",
        },
      ],
      latestJournalEntry: {
        id: "journal-1",
        runId,
        dayNumber: 2,
        tileId,
        body: "The ruin kept humming after dusk.",
        updatedAt: "2026-05-07T03:00:00.000Z",
      },
    });

    expect(snapshot.recentActions).toEqual([
      {
        id: "action-1",
        type: "next_day",
        title: "Day 2",
        body: "You reached the black obelisk.",
        dayNumber: 2,
        tileId,
        diceRolls: [],
        createdAt: "2026-05-07T02:00:00.000Z",
      },
    ]);
    expect(snapshot.latestJournalEntry).toEqual({
      id: "journal-1",
      runId,
      dayNumber: 2,
      tileId,
      body: "The ruin kept humming after dusk.",
      updatedAt: "2026-05-07T03:00:00.000Z",
    });
  });
});

describe("getRunSnapshot", () => {
  it("returns null without querying PostgREST when runId is not a UUID", async () => {
    const supabase = {
      from: vi.fn(),
    };

    await expect(
      getRunSnapshot(supabase as never, "user-1", "not-a-uuid"),
    ).resolves.toBeNull();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("loads recent actions and latest journal into the snapshot", async () => {
    const diceRoll = {
      id: "roll-1",
      notation: "1d6" as const,
      purpose: "event" as const,
      values: [5],
      total: 5,
    };
    const resultByTable: Record<string, Array<{ data: unknown; error: null }>> = {
      runs: [{ data: baseRun(), error: null }],
      run_tiles: [
        { data: baseTile(), error: null },
        { data: [baseTile()], error: null },
      ],
      run_inventory: [{ data: [], error: null }],
      tech_skills: [{ data: [], error: null }],
      action_log: [
        {
          data: [
            {
              id: "action-1",
              action_type: "next_day",
              day_number: 2,
              tile_id: tileId,
              result: { title: "Day 2", body: "You reached the obelisk." },
              dice_rolls: [diceRoll],
              created_at: "2026-05-07T02:00:00.000Z",
            },
          ],
          error: null,
        },
      ],
      journal_entries: [
        {
          data: {
            id: "journal-1",
            run_id: runId,
            day_number: 2,
            tile_id: tileId,
            body: "The ruin kept humming after dusk.",
            updated_at: "2026-05-07T03:00:00.000Z",
          },
          error: null,
        },
      ],
    };
    const supabase = {
      from: vi.fn((table: string) => {
        const result = resultByTable[table].shift();
        const builder = {
          select: vi.fn(() => builder),
          eq: vi.fn(() => builder),
          order: vi.fn(() => builder),
          limit: vi.fn(() => builder),
          maybeSingle: vi.fn(() => Promise.resolve(result)),
          then: (
            onFulfilled: (value: typeof result) => unknown,
            onRejected?: (reason: unknown) => unknown,
          ) => Promise.resolve(result).then(onFulfilled, onRejected),
        };

        return builder;
      }),
    };

    const snapshot = await getRunSnapshot(supabase as never, "user-1", runId);

    expect(snapshot?.recentActions).toEqual([
      {
        id: "action-1",
        type: "next_day",
        title: "Day 2",
        body: "You reached the obelisk.",
        dayNumber: 2,
        tileId,
        diceRolls: [diceRoll],
        createdAt: "2026-05-07T02:00:00.000Z",
      },
    ]);
    expect(snapshot?.latestJournalEntry).toEqual({
      id: "journal-1",
      runId,
      dayNumber: 2,
      tileId,
      body: "The ruin kept humming after dusk.",
      updatedAt: "2026-05-07T03:00:00.000Z",
    });
  });
});
