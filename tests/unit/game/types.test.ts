import { describe, expect, it } from "vitest";
import { MIRU1V2E_MANIFEST } from "@/data/miru1v2e/manifest";
import type { RunSnapshot } from "@/lib/game/types";

describe("game type contracts", () => {
  it("models the starting playable snapshot without any casts", () => {
    const snapshot = {
      run: {
        id: "run-1",
        title: "Field Notes",
        status: "active",
        rulesVersion: "miru1v2e",
        currentDay: 1,
        updatedAt: "2026-05-07T00:00:00.000Z",
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
        title: "Ready for the next day",
        body: "Begin the next day when your notes are settled.",
      },
      legalActions: [{ type: "next_day", label: "Next Day" }],
      recentActions: [],
      latestJournalEntry: null,
    } satisfies RunSnapshot;

    expect(snapshot.run.rulesVersion).toBe(MIRU1V2E_MANIFEST.rulesVersion);
    expect(snapshot.legalActions).toEqual([{ type: "next_day", label: "Next Day" }]);
  });
});
