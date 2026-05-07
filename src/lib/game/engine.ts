import { rollDice, type DiceRoller } from "@/lib/game/dice";
import { resolveCamp } from "@/lib/game/survival";
import { resolveNextDay } from "@/lib/game/turnMachine";
import type { GameAction, GameActionResult, RunSnapshot } from "@/lib/game/types";

const randomDice: DiceRoller = { roll: rollDice };

function hasLegalAction(snapshot: RunSnapshot, type: GameAction["type"]) {
  return snapshot.legalActions.some((action) => action.type === type);
}

export function applyGameAction(
  snapshot: RunSnapshot,
  action: GameAction,
  dice: DiceRoller = randomDice,
): GameActionResult {
  if (!hasLegalAction(snapshot, action.type)) {
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
