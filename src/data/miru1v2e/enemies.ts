import type { EnemyState } from "@/lib/game/types";

export const REPRESENTATIVE_ENEMIES: Record<string, EnemyState> = {
  "training-drone": {
    key: "training-drone",
    name: "Training Drone",
    hp: 3,
    atk: 1,
    def: 0,
    rewardKey: "first-bitlith",
  },
};
