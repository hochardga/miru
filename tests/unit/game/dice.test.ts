import { describe, expect, it } from "vitest";
import { createFixedDiceRoller, rollDice } from "@/lib/game/dice";

describe("dice utilities", () => {
  it("rolls deterministic 2D6 values with purpose metadata", () => {
    const dice = createFixedDiceRoller([2, 5]);
    const roll = dice.roll("2d6", "terrain");

    expect(roll).toMatchObject({
      notation: "2d6",
      purpose: "terrain",
      values: [2, 5],
      total: 7,
    });
    expect(roll.id).toMatch(/^roll-/);
  });

  it("keeps random 4D6 values inside the valid range", () => {
    const roll = rollDice("4d6", "reward");

    expect(roll.values).toHaveLength(4);
    expect(roll.values.every((value) => value >= 1 && value <= 6)).toBe(true);
    expect(roll.total).toBeGreaterThanOrEqual(4);
    expect(roll.total).toBeLessThanOrEqual(24);
  });
});
