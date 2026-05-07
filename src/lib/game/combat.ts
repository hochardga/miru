import type { DiceRoller } from "@/lib/game/dice";
import { resolveReward, type RewardResult } from "@/lib/game/rewards";
import type { EnemyState, RunStats } from "@/lib/game/types";

type CombatInput = {
  stats: RunStats;
  enemy: EnemyState;
  move: "attack" | "escape";
  dice: DiceRoller;
};

type CombatResult = {
  stats: RunStats;
  enemy: EnemyState | null;
  reward: RewardResult;
  diceRolls: ReturnType<DiceRoller["roll"]>[];
  summary: string;
};

export function resolveCombatRound(input: CombatInput): CombatResult {
  const roll = input.dice.roll("2d6", "combat");

  if (input.move === "escape") {
    return {
      stats: input.stats,
      enemy: input.enemy,
      reward: { bitliths: 0, summary: "You held your ground and looked for distance." },
      diceRolls: [roll],
      summary: "You looked for an opening to escape.",
    };
  }

  const damageToEnemy = Math.max(0, input.stats.baseAtk + roll.values[0] - input.enemy.def);
  const nextEnemyHp = input.enemy.hp - damageToEnemy;

  if (nextEnemyHp <= 0) {
    const reward = resolveReward(input.enemy.rewardKey);

    return {
      stats: { ...input.stats, bitliths: input.stats.bitliths + reward.bitliths },
      enemy: null,
      reward,
      diceRolls: [roll],
      summary: `You defeated ${input.enemy.name}. ${reward.summary}`,
    };
  }

  const damageToPlayer = Math.max(0, input.enemy.atk + roll.values[1] - input.stats.baseDef);

  return {
    stats: { ...input.stats, hp: Math.max(0, input.stats.hp - damageToPlayer) },
    enemy: { ...input.enemy, hp: nextEnemyHp },
    reward: { bitliths: 0, summary: "The fight continues." },
    diceRolls: [roll],
    summary: `${input.enemy.name} remains in the fight.`,
  };
}
