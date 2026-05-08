import { rollDice, type DiceRoller } from "@/lib/game/dice";
import { resolveCamp } from "@/lib/game/survival";
import { resolveNextDay } from "@/lib/game/turnMachine";
import type { GameAction, GameActionResult, RunSnapshot } from "@/lib/game/types";

const randomDice: DiceRoller = { roll: rollDice };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEmptyPayload(payload: Record<string, unknown> | undefined) {
  return !payload || Object.keys(payload).length === 0;
}

function payloadsMatch(
  legalPayload: Record<string, unknown> | undefined,
  submittedPayload: Record<string, unknown> | undefined,
): boolean {
  if (isEmptyPayload(legalPayload) && isEmptyPayload(submittedPayload)) {
    return true;
  }

  if (!legalPayload || !submittedPayload) {
    return false;
  }

  const legalEntries = Object.entries(legalPayload);

  if (legalEntries.length !== Object.keys(submittedPayload).length) {
    return false;
  }

  return legalEntries.every(([key, value]) => {
    const submittedValue = submittedPayload[key];

    if (isRecord(value) && isRecord(submittedValue)) {
      return payloadsMatch(value, submittedValue);
    }

    return Object.is(value, submittedValue);
  });
}

function hasLegalAction(snapshot: RunSnapshot, action: GameAction) {
  return snapshot.legalActions.some(
    (legalAction) => legalAction.type === action.type && payloadsMatch(legalAction.payload, action.payload),
  );
}

export function applyGameAction(
  snapshot: RunSnapshot,
  action: GameAction,
  dice: DiceRoller = randomDice,
): GameActionResult {
  if (!hasLegalAction(snapshot, action)) {
    throw new Error("INVALID_ACTION_FOR_STATE");
  }

  if (action.type === "next_day") {
    return resolveNextDay(snapshot, dice);
  }

  if (action.type === "camp") {
    const camp = resolveCamp({
      stats: snapshot.stats,
      inventory: snapshot.inventory,
      foodChoice: action.payload.foodChoice,
    });
    const nextSnapshot: RunSnapshot = {
      ...snapshot,
      stats: camp.stats,
      inventory: camp.inventory,
      pendingPrompt: {
        type: "journal_available",
        title: "Write the day down",
        body: "Add a short note before moving on.",
        dayNumber: snapshot.run.currentDay,
        tileId: snapshot.currentTile.id,
      },
      legalActions: [{ type: "journal", label: "Write Journal" }],
    };

    return {
      snapshot: nextSnapshot,
      summary: {
        type: "camp",
        title: "Camp resolved",
        body: camp.summary,
        dayNumber: snapshot.run.currentDay,
        tileId: snapshot.currentTile.id,
        diceRolls: [],
      },
      diceRolls: [],
    };
  }

  throw new Error("INVALID_ACTION_FOR_STATE");
}
