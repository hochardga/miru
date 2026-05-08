import type { InventoryItem, RunStats } from "@/lib/game/types";

type ResolveCampInput = {
  stats: RunStats;
  inventory: InventoryItem[];
  foodChoice: "eat_meal_bar" | "skip_food";
  sleepChoice?: "sleep" | "skip_sleep";
};

type ResolveCampResult = {
  stats: RunStats;
  inventory: InventoryItem[];
  summary: string;
};

function clampStat(value: number) {
  return Math.max(0, Math.min(20, value));
}

export function resolveCamp(input: ResolveCampInput): ResolveCampResult {
  const inventory = input.inventory.map((item) => ({ ...item }));
  const mealBar = inventory.find((item) => item.key === "meal-bar");
  const ateFood = input.foodChoice === "eat_meal_bar" && mealBar && mealBar.quantity > 0;
  const slept = input.sleepChoice !== "skip_sleep";

  if (ateFood) {
    mealBar.quantity -= 1;
  }

  const stats: RunStats = {
    ...input.stats,
    hp: clampStat(input.stats.hp + 2),
    ep: clampStat(input.stats.ep + 2),
    starvationCount: ateFood ? 0 : input.stats.starvationCount + 1,
    sleepDeprivationCount: slept ? 0 : input.stats.sleepDeprivationCount + 1,
  };

  return {
    stats,
    inventory,
    summary: ateFood
      ? "You ate a Meal Bar, rested, and recovered at camp."
      : "You went without food, rested, and felt hunger settle in.",
  };
}
