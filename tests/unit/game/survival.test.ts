import { describe, expect, it } from "vitest";
import { resolveCamp } from "@/lib/game/survival";
import type { InventoryItem, RunStats } from "@/lib/game/types";

const stats: RunStats = {
  hp: 10,
  ep: 10,
  baseAtk: 1,
  baseDef: 1,
  bitliths: 0,
  starvationCount: 0,
  sleepDeprivationCount: 0,
  minorInjuryCount: 0,
};

describe("resolveCamp", () => {
  it("eats a Meal Bar, heals within caps, and clears survival pressure", () => {
    const inventory: InventoryItem[] = [
      { key: "meal-bar", name: "Meal Bar", category: "food", quantity: 3, metadata: {} },
    ];

    const result = resolveCamp({
      stats: { ...stats, hp: 18, ep: 19, starvationCount: 1, sleepDeprivationCount: 1 },
      inventory,
      foodChoice: "eat_meal_bar",
    });

    expect(result.stats).toMatchObject({
      hp: 20,
      ep: 20,
      starvationCount: 0,
      sleepDeprivationCount: 0,
    });
    expect(result.inventory[0]?.quantity).toBe(2);
  });

  it("tracks starvation when food is skipped", () => {
    const result = resolveCamp({
      stats,
      inventory: [],
      foodChoice: "skip_food",
    });

    expect(result.stats.starvationCount).toBe(1);
    expect(result.summary).toContain("went without food");
  });

  it("tracks sleep deprivation when sleep is skipped", () => {
    const result = resolveCamp({
      stats,
      inventory: [],
      foodChoice: "skip_food",
      sleepChoice: "skip_sleep",
    });

    expect(result.stats.sleepDeprivationCount).toBe(1);
  });

  it("resets sleep deprivation when sleep is taken", () => {
    const result = resolveCamp({
      stats: { ...stats, sleepDeprivationCount: 2 },
      inventory: [],
      foodChoice: "skip_food",
      sleepChoice: "sleep",
    });

    expect(result.stats.sleepDeprivationCount).toBe(0);
  });

  it("does not mutate input inventory when a Meal Bar is consumed", () => {
    const inventory: InventoryItem[] = [
      { key: "meal-bar", name: "Meal Bar", category: "food", quantity: 3, metadata: {} },
    ];

    const result = resolveCamp({
      stats,
      inventory,
      foodChoice: "eat_meal_bar",
    });

    expect(result.inventory[0]?.quantity).toBe(2);
    expect(inventory[0]?.quantity).toBe(3);
  });
});
