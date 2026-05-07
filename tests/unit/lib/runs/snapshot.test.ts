import { describe, expect, it } from "vitest";
import { mapRunRowsToSnapshot } from "@/lib/runs/snapshot";

describe("mapRunRowsToSnapshot", () => {
  it("maps persisted rows to a resumable RunSnapshot", () => {
    const snapshot = mapRunRowsToSnapshot({
      run: {
        id: "run-1",
        title: "Field Notes",
        status: "active",
        rules_version: "miru1v2e",
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
        current_tile_id: "tile-1",
        updated_at: "2026-05-07T00:00:00.000Z",
        last_journal_entry: null,
      },
      currentTile: {
        id: "tile-1",
        row_number: 1,
        column_letter: "E",
        terrain: "unknown",
        visited: true,
        icons: [],
        event_history: [],
        repeatability_state: {},
        enemy_state: null,
        notes: null,
      },
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
});
