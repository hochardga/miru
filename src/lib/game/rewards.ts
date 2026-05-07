export type RewardResult = {
  bitliths: number;
  inventoryKey?: string;
  summary: string;
};

export function resolveReward(rewardKey: string): RewardResult {
  if (rewardKey === "first-bitlith") {
    return {
      bitliths: 1,
      summary: "You recovered 1 Bitlith.",
    };
  }

  return {
    bitliths: 0,
    summary: "The encounter left no usable reward.",
  };
}
