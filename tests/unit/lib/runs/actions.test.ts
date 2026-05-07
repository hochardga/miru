import { describe, expect, it, vi } from "vitest";
import { applyRunAction } from "@/lib/runs/actions";

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
    const persistGameActionResult = vi.fn().mockResolvedValue(undefined);

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
  });
});
