import { describe, expect, it } from "vitest";
import { createFixedDiceRoller } from "@/lib/game/dice";
import { resolveCombatRound } from "@/lib/game/combat";
import { REPRESENTATIVE_ENEMIES } from "@/data/miru1v2e/enemies";

describe("resolveCombatRound", () => {
  it("lets the player defeat the representative enemy and receive a reward summary", () => {
    const result = resolveCombatRound({
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
      enemy: { ...REPRESENTATIVE_ENEMIES["training-drone"], hp: 1 },
      move: "attack",
      dice: createFixedDiceRoller([6, 1]),
    });

    expect(result.enemy).toBeNull();
    expect(result.reward.bitliths).toBe(1);
    expect(result.diceRolls).toHaveLength(1);
    expect(result.summary).toContain("defeated");
  });
});
