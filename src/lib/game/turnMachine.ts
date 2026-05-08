import { REPRESENTATIVE_EVENTS } from "@/data/miru1v2e/events";
import type { DiceRoller } from "@/lib/game/dice";
import type { GameActionResult, RunSnapshot } from "@/lib/game/types";

export function resolveNextDay(snapshot: RunSnapshot, dice: DiceRoller): GameActionResult {
  const terrainRoll = dice.roll("2d6", "terrain");
  const event = REPRESENTATIVE_EVENTS["first-field-discovery"];
  const nextTile = {
    ...snapshot.currentTile,
    terrain: event.terrain,
    visited: true,
    eventHistory: Array.from(new Set([...snapshot.currentTile.eventHistory, event.key])),
  };
  const nextSnapshot: RunSnapshot = {
    ...snapshot,
    currentTile: nextTile,
    visibleTiles: snapshot.visibleTiles.map((tile) => (tile.id === nextTile.id ? nextTile : tile)),
    pendingPrompt: {
      type: "camp_required",
      title: "Make camp",
      body: `${event.body} Resolve camp before the day can close.`,
      choices: [{ key: "eat_meal_bar", label: "Eat Meal Bar" }],
    },
    legalActions: [{ type: "camp", label: "Camp", payload: { foodChoice: "eat_meal_bar" } }],
  };

  return {
    snapshot: nextSnapshot,
    summary: {
      type: "next_day",
      title: event.title,
      body: event.body,
      dayNumber: snapshot.run.currentDay,
      tileId: snapshot.currentTile.id,
      diceRolls: [terrainRoll],
    },
    diceRolls: [terrainRoll],
  };
}
