import { describe, expect, it } from "vitest";
import { createFixedDiceRoller } from "@/lib/game/dice";
import { applyGameAction } from "@/lib/game/engine";
import type { RunSnapshot } from "@/lib/game/types";

function baseSnapshot(
  promptType: RunSnapshot["pendingPrompt"]["type"] = "ready_for_next_day",
): RunSnapshot {
  return {
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
    inventory: [{ key: "meal-bar", name: "Meal Bar", category: "food", quantity: 3, metadata: {} }],
    techSkills: [],
    activeEnemy: null,
    pendingPrompt:
      promptType === "camp_required"
        ? {
            type: "camp_required",
            title: "Make camp",
            body: "Resolve food and rest before the next day.",
            choices: [{ key: "eat_meal_bar", label: "Eat Meal Bar" }],
          }
        : {
            type: "ready_for_next_day",
            title: "Ready for the next day",
            body: "Begin the next day when your notes are settled.",
          },
    legalActions:
      promptType === "camp_required"
        ? [{ type: "camp", label: "Camp", payload: { foodChoice: "eat_meal_bar" } }]
        : [{ type: "next_day", label: "Next Day" }],
    recentActions: [],
    latestJournalEntry: null,
  };
}

describe("applyGameAction", () => {
  it("resolves the default first Next Day into a camp prompt with a recorded roll", () => {
    const result = applyGameAction(baseSnapshot(), { type: "next_day" }, createFixedDiceRoller([3, 4]));

    expect(result.snapshot.pendingPrompt.type).toBe("camp_required");
    expect(result.snapshot.legalActions).toEqual([
      { type: "camp", label: "Camp", payload: { foodChoice: "eat_meal_bar" } },
    ]);
    expect(result.diceRolls).toHaveLength(1);
    expect(result.diceRolls[0]).toMatchObject({
      notation: "2d6",
      purpose: "terrain",
      values: [3, 4],
    });
    expect(result.summary.type).toBe("next_day");
  });

  it("resolves camp into a journal prompt without advancing the client first", () => {
    const result = applyGameAction(
      baseSnapshot("camp_required"),
      { type: "camp", payload: { foodChoice: "eat_meal_bar" } },
      createFixedDiceRoller([]),
    );

    expect(result.snapshot.pendingPrompt).toMatchObject({
      type: "journal_available",
      dayNumber: 1,
      tileId: "tile-1",
    });
    expect(result.snapshot.inventory[0]?.quantity).toBe(2);
    expect(result.snapshot.legalActions).toEqual([{ type: "journal", label: "Write Journal" }]);
  });

  it("rejects actions that are illegal for the current prompt", () => {
    expect(() =>
      applyGameAction(baseSnapshot("camp_required"), { type: "next_day" }, createFixedDiceRoller([])),
    ).toThrow("INVALID_ACTION_FOR_STATE");
  });

  it("rejects payload-bearing actions that do not match the legal action payload", () => {
    expect(() =>
      applyGameAction(
        baseSnapshot("camp_required"),
        { type: "camp", payload: { foodChoice: "skip_food" } },
        createFixedDiceRoller([]),
      ),
    ).toThrow("INVALID_ACTION_FOR_STATE");
  });
});
