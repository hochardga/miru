import type { DiceNotation, DicePurpose, DiceRoll } from "@/lib/game/types";

const DICE_COUNTS: Record<DiceNotation, number> = {
  "1d6": 1,
  "2d6": 2,
  "4d6": 4,
};

export type DiceRoller = {
  roll(notation: DiceNotation, purpose: DicePurpose): DiceRoll;
};

let rollSequence = 0;

function nextRollId() {
  rollSequence += 1;
  return `roll-${rollSequence}`;
}

export function rollDice(notation: DiceNotation, purpose: DicePurpose): DiceRoll {
  const count = DICE_COUNTS[notation];
  const values = Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);

  return {
    id: nextRollId(),
    notation,
    purpose,
    values,
    total: values.reduce((sum, value) => sum + value, 0),
  };
}

export function createFixedDiceRoller(values: number[]): DiceRoller {
  let cursor = 0;

  return {
    roll(notation, purpose) {
      const count = DICE_COUNTS[notation];
      const nextValues = values.slice(cursor, cursor + count);

      if (nextValues.length !== count || nextValues.some((value) => value < 1 || value > 6)) {
        throw new Error(`Fixed dice roller needs ${count} valid values for ${notation}.`);
      }

      cursor += count;

      return {
        id: nextRollId(),
        notation,
        purpose,
        values: nextValues,
        total: nextValues.reduce((sum, value) => sum + value, 0),
      };
    },
  };
}
