# Phase 1 Core Engine Magic Moment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first playable Miru loop: start a run, load the play table, tap Next Day, resolve a curated engine-real day, camp, save a journal entry, autosave, and resume.

**Architecture:** Keep game logic in pure TypeScript under `src/lib/game`, use Supabase helpers under `src/lib/runs` for row mapping and persistence, and keep Next route handlers responsible for auth, validation, HTTP status codes, and response shape. React components render `RunSnapshot` data and submit legal actions without computing authoritative state transitions.

**Tech Stack:** Next.js 16 app router, React 19, TypeScript strict mode, Supabase SSR/client, Zod, Vitest with Testing Library, Playwright.

---

## File Structure Map

- Create `src/lib/game/types.ts`: shared engine, API, and UI contracts for snapshots, coordinates, prompts, legal actions, dice rolls, inventory, enemies, and action results.
- Create `src/data/miru1v2e/manifest.ts`: typed manifest for Miru 1 v2e starting values and representative data keys.
- Modify `src/lib/validation/schemas.ts`: request schemas for run actions and journals.
- Create `src/lib/game/dice.ts`: injectable dice roller supporting 1D6, 2D6, and bundled 4D6 rolls.
- Create `src/lib/game/map.ts`: coordinate, tile id, visible grid, and six-direction movement helpers.
- Create `src/lib/game/survival.ts`: camp and survival resolver for Phase 1 food, sleep, healing caps, starvation, and sleep deprivation.
- Create `src/data/miru1v2e/events.ts`, `src/data/miru1v2e/enemies.ts`, `src/lib/game/combat.ts`, `src/lib/game/rewards.ts`, `src/lib/game/turnMachine.ts`, and `src/lib/game/engine.ts`: curated day transition, reachable combat branch, and action dispatcher.
- Create `src/lib/runs/snapshot.ts`: Supabase row loader and mapper to `RunSnapshot`.
- Create `src/lib/runs/actions.ts`: persistence helper for engine action results and action log rows.
- Create `src/app/api/runs/[runId]/route.ts`: run detail API.
- Create `src/app/api/runs/[runId]/actions/route.ts`: action API.
- Create `src/app/api/runs/[runId]/journal/route.ts`: journal API.
- Modify `src/app/api/runs/route.ts`: keep create/list behavior and ensure summaries support resume context.
- Modify `src/app/play/[runId]/page.tsx`: load `RunSnapshot` and render the play table.
- Create `src/components/features/play/PlayTable.tsx`, `CurrentPrompt.tsx`, `ActionBar.tsx`, and `JournalPrompt.tsx`: client play loop and prompt UI.
- Create `src/components/features/character/CharacterPanel.tsx`, `src/components/features/inventory/InventoryPanel.tsx`, `src/components/features/map/HexMap.tsx`, `TileInspector.tsx`, `src/components/ui/StatBadge.tsx`, and `src/components/ui/DiceResult.tsx`: play table support surfaces.
- Modify `src/app/runs/page.tsx`: show status, day, latest journal excerpt, and resume links using existing run summaries.
- Add focused tests under `tests/unit/game`, `tests/unit/api`, `tests/unit/lib/runs`, `tests/unit/features`, and `tests/e2e/first-run.spec.ts`.

## Task 1: Core Game Contracts And Request Schemas

**Files:**
- Create: `src/lib/game/types.ts`
- Create: `src/data/miru1v2e/manifest.ts`
- Modify: `src/lib/validation/schemas.ts`
- Test: `tests/unit/game/types.test.ts`
- Test: `tests/unit/lib/validation/schemas.test.ts`

- [ ] **Step 1: Write the failing type contract test**

Create `tests/unit/game/types.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { MIRU1V2E_MANIFEST } from "@/data/miru1v2e/manifest";
import type { RunSnapshot } from "@/lib/game/types";

describe("game type contracts", () => {
  it("models the starting playable snapshot without any casts", () => {
    const snapshot = {
      run: {
        id: "run-1",
        title: "Field Notes",
        status: "active",
        rulesVersion: "miru1v2e",
        currentDay: 1,
        updatedAt: "2026-05-07T00:00:00.000Z",
      },
      stats: {
        hp: 10,
        ep: 10,
        baseAtk: 1,
        baseDef: 1,
        bitliths: 0,
        starvationCount: 0,
        sleepDeprivationCount: 0,
        minorInjuryCount: 0,
      },
      currentTile: {
        id: "tile-1",
        coordinate: "E01",
        row: 1,
        column: "E",
        terrain: "unknown",
        visited: true,
        icons: [],
        eventHistory: [],
        repeatabilityState: {},
        enemyState: null,
        notes: null,
      },
      visibleTiles: [],
      inventory: [
        {
          key: "meal-bar",
          name: "Meal Bar",
          category: "food",
          quantity: 3,
          metadata: {},
        },
      ],
      techSkills: [],
      activeEnemy: null,
      pendingPrompt: {
        type: "ready_for_next_day",
        title: "Ready for the next day",
        body: "Begin the next day when your notes are settled.",
      },
      legalActions: [{ type: "next_day", label: "Next Day" }],
      recentActions: [],
      latestJournalEntry: null,
    } satisfies RunSnapshot;

    expect(snapshot.run.rulesVersion).toBe(MIRU1V2E_MANIFEST.rulesVersion);
    expect(snapshot.legalActions).toEqual([{ type: "next_day", label: "Next Day" }]);
  });
});
```

- [ ] **Step 2: Run the type contract test and verify it fails**

Run:

```bash
npm run test:unit -- tests/unit/game/types.test.ts
```

Expected: FAIL because `@/lib/game/types` and `@/data/miru1v2e/manifest` do not exist.

- [ ] **Step 3: Create the core game types**

Create `src/lib/game/types.ts`:

```ts
export const COORDINATE_COLUMNS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"] as const;
export const TERRAIN_TYPES = ["unknown", "forest", "mountains", "grasslands", "desert", "swamp", "impassable"] as const;
export const ICON_TYPES = ["village", "enemy", "quest", "treasure", "impassable"] as const;

export type CoordinateColumn = (typeof COORDINATE_COLUMNS)[number];
export type CoordinateRow = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type CoordinateId = `${CoordinateColumn}${"01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12"}`;
export type TerrainType = (typeof TERRAIN_TYPES)[number];
export type IconType = (typeof ICON_TYPES)[number];
export type RunStatus = "active" | "won" | "dead_continuable" | "ended";

export type DicePurpose = "terrain" | "event" | "combat" | "camp" | "reward";
export type DiceNotation = "1d6" | "2d6" | "4d6";

export type DiceRoll = {
  id: string;
  notation: DiceNotation;
  purpose: DicePurpose;
  values: number[];
  total: number;
};

export type InventoryItem = {
  key: string;
  name: string;
  category: "food" | "key" | "reward" | "equipment" | "misc";
  quantity: number;
  metadata: Record<string, unknown>;
};

export type TechSkill = {
  key: string;
  name: string;
  unlocked: boolean;
  trainingLevel: number;
};

export type EnemyState = {
  key: string;
  name: string;
  hp: number;
  atk: number;
  def: number;
  rewardKey: string;
};

export type RunTile = {
  id: string;
  coordinate: CoordinateId;
  row: CoordinateRow;
  column: CoordinateColumn;
  terrain: TerrainType;
  visited: boolean;
  icons: IconType[];
  eventHistory: string[];
  repeatabilityState: Record<string, unknown>;
  enemyState: EnemyState | null;
  notes: string | null;
};

export type RunStats = {
  hp: number;
  ep: number;
  baseAtk: number;
  baseDef: number;
  bitliths: number;
  starvationCount: number;
  sleepDeprivationCount: number;
  minorInjuryCount: number;
};

export type ReadyForNextDayPrompt = {
  type: "ready_for_next_day";
  title: string;
  body: string;
};

export type CampRequiredPrompt = {
  type: "camp_required";
  title: string;
  body: string;
  choices: Array<{ key: "eat_meal_bar" | "skip_food"; label: string }>;
};

export type JournalAvailablePrompt = {
  type: "journal_available";
  title: string;
  body: string;
  dayNumber: number;
  tileId: string;
};

export type CombatChoicePrompt = {
  type: "combat_choice";
  title: string;
  body: string;
  enemy: EnemyState;
};

export type DayCompletePrompt = {
  type: "day_complete";
  title: string;
  body: string;
};

export type RunPrompt =
  | ReadyForNextDayPrompt
  | CampRequiredPrompt
  | JournalAvailablePrompt
  | CombatChoicePrompt
  | DayCompletePrompt;

export type GameActionType = "next_day" | "camp" | "combat_action" | "journal";

export type LegalAction = {
  type: GameActionType;
  label: string;
  payload?: Record<string, unknown>;
};

export type ActionSummary = {
  id: string;
  type: GameActionType | "start_run";
  title: string;
  body: string;
  dayNumber: number;
  tileId: string | null;
  diceRolls: DiceRoll[];
  createdAt: string;
};

export type JournalEntry = {
  id: string;
  runId: string;
  dayNumber: number;
  tileId: string | null;
  body: string;
  updatedAt: string;
};

export type RunSnapshot = {
  run: {
    id: string;
    title: string;
    status: RunStatus;
    rulesVersion: "miru1v2e";
    currentDay: number;
    updatedAt: string;
  };
  stats: RunStats;
  currentTile: RunTile;
  visibleTiles: RunTile[];
  inventory: InventoryItem[];
  techSkills: TechSkill[];
  activeEnemy: EnemyState | null;
  pendingPrompt: RunPrompt;
  legalActions: LegalAction[];
  recentActions: ActionSummary[];
  latestJournalEntry: JournalEntry | null;
};

export type GameAction =
  | { type: "next_day"; payload?: Record<string, never> }
  | { type: "camp"; payload: { foodChoice: "eat_meal_bar" | "skip_food" } }
  | { type: "combat_action"; payload: { move: "attack" | "escape" } }
  | { type: "journal"; payload: { body: string } };

export type GameActionResult = {
  snapshot: RunSnapshot;
  summary: Omit<ActionSummary, "id" | "createdAt">;
  diceRolls: DiceRoll[];
};
```

- [ ] **Step 4: Create the Miru 1 v2e manifest**

Create `src/data/miru1v2e/manifest.ts`:

```ts
export const MIRU1V2E_MANIFEST = {
  rulesVersion: "miru1v2e",
  startingStats: {
    hp: 10,
    ep: 10,
    baseAtk: 1,
    baseDef: 1,
    bitliths: 0,
    starvationCount: 0,
    sleepDeprivationCount: 0,
    minorInjuryCount: 0,
  },
  startingInventory: [
    {
      key: "meal-bar",
      name: "Meal Bar",
      category: "food",
      quantity: 3,
      metadata: {},
    },
  ],
  representativeEventKey: "first-field-discovery",
  representativeEnemyKey: "training-drone",
} as const;
```

- [ ] **Step 5: Add request schemas and extend validation tests**

Modify `src/lib/validation/schemas.ts`:

```ts
export const gameActionRequestSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("next_day"), payload: z.object({}).optional() }),
  z.object({
    type: z.literal("camp"),
    payload: z.object({
      foodChoice: z.enum(["eat_meal_bar", "skip_food"]),
    }),
  }),
  z.object({
    type: z.literal("combat_action"),
    payload: z.object({
      move: z.enum(["attack", "escape"]),
    }),
  }),
]);

export const journalRequestSchema = z.object({
  dayNumber: z.number().int().min(1),
  tileId: z.string().uuid().optional(),
  body: z.string().trim().min(1).max(1000),
});
```

Add tests to `tests/unit/lib/validation/schemas.test.ts`:

```ts
import {
  gameActionRequestSchema,
  journalRequestSchema,
} from "@/lib/validation/schemas";

describe("gameActionRequestSchema", () => {
  it("accepts legal Phase 1 actions", () => {
    expect(gameActionRequestSchema.parse({ type: "next_day" })).toEqual({
      type: "next_day",
    });
    expect(
      gameActionRequestSchema.parse({
        type: "camp",
        payload: { foodChoice: "eat_meal_bar" },
      }),
    ).toEqual({
      type: "camp",
      payload: { foodChoice: "eat_meal_bar" },
    });
  });

  it("rejects stale or unsupported actions", () => {
    expect(() =>
      gameActionRequestSchema.parse({ type: "move", payload: {} }),
    ).toThrow();
  });
});

describe("journalRequestSchema", () => {
  it("limits entries to 1000 characters", () => {
    expect(
      journalRequestSchema.parse({
        dayNumber: 1,
        body: "The field kit held together.",
      }),
    ).toMatchObject({ dayNumber: 1 });

    expect(() =>
      journalRequestSchema.parse({
        dayNumber: 1,
        body: "x".repeat(1001),
      }),
    ).toThrow();
  });
});
```

- [ ] **Step 6: Run tests and typecheck**

Run:

```bash
npm run test:unit -- tests/unit/game/types.test.ts tests/unit/lib/validation/schemas.test.ts
npm run typecheck
```

Expected: both commands exit 0.

- [ ] **Step 7: Commit Task 1**

Run:

```bash
git add src/lib/game/types.ts src/data/miru1v2e/manifest.ts src/lib/validation/schemas.ts tests/unit/game/types.test.ts tests/unit/lib/validation/schemas.test.ts
git commit -m "feat: define phase 1 game contracts"
```

## Task 2: Dice, Map, And Survival Helpers

**Files:**
- Create: `src/lib/game/dice.ts`
- Create: `src/lib/game/map.ts`
- Create: `src/lib/game/survival.ts`
- Test: `tests/unit/game/dice.test.ts`
- Test: `tests/unit/game/map.test.ts`
- Test: `tests/unit/game/survival.test.ts`

- [ ] **Step 1: Write failing dice tests**

Create `tests/unit/game/dice.test.ts`:

```ts
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
```

- [ ] **Step 2: Write failing map tests**

Create `tests/unit/game/map.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  coordinateToId,
  getVisibleMapTiles,
  moveCoordinate,
  parseCoordinate,
} from "@/lib/game/map";

describe("map helpers", () => {
  it("formats and parses coordinates across the 12x9 grid", () => {
    expect(coordinateToId({ column: "A", row: 1 })).toBe("A01");
    expect(parseCoordinate("I12")).toEqual({ column: "I", row: 12 });
    expect(parseCoordinate("J01")).toBeNull();
  });

  it("moves through the six Miru directions and rejects invalid edges", () => {
    expect(moveCoordinate({ column: "E", row: 1 }, "E")).toEqual({
      column: "F",
      row: 1,
    });
    expect(moveCoordinate({ column: "E", row: 1 }, "NW")).toBeNull();
    expect(moveCoordinate({ column: "E", row: 2 }, "SW")).toEqual({
      column: "D",
      row: 3,
    });
  });

  it("builds a stable 108 tile visible grid", () => {
    const tiles = getVisibleMapTiles([]);

    expect(tiles).toHaveLength(108);
    expect(tiles[0]?.coordinate).toBe("A01");
    expect(tiles[107]?.coordinate).toBe("I12");
  });
});
```

- [ ] **Step 3: Write failing survival tests**

Create `tests/unit/game/survival.test.ts`:

```ts
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
});
```

- [ ] **Step 4: Run helper tests and verify they fail**

Run:

```bash
npm run test:unit -- tests/unit/game/dice.test.ts tests/unit/game/map.test.ts tests/unit/game/survival.test.ts
```

Expected: FAIL because the helper modules do not exist.

- [ ] **Step 5: Implement dice utilities**

Create `src/lib/game/dice.ts`:

```ts
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
```

- [ ] **Step 6: Implement map helpers**

Create `src/lib/game/map.ts`:

```ts
import {
  COORDINATE_COLUMNS,
  type CoordinateColumn,
  type CoordinateId,
  type CoordinateRow,
  type RunTile,
} from "@/lib/game/types";

export type Coordinate = { column: CoordinateColumn; row: CoordinateRow };
export type MoveDirection = "W" | "NW" | "NE" | "E" | "SE" | "SW";

const ROWS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export function coordinateToId(coordinate: Coordinate): CoordinateId {
  return `${coordinate.column}${String(coordinate.row).padStart(2, "0")}` as CoordinateId;
}

export function parseCoordinate(value: string): Coordinate | null {
  const column = value.slice(0, 1) as CoordinateColumn;
  const row = Number(value.slice(1));

  if (!COORDINATE_COLUMNS.includes(column) || !ROWS.includes(row as CoordinateRow)) {
    return null;
  }

  return { column, row: row as CoordinateRow };
}

function columnOffset(column: CoordinateColumn) {
  return COORDINATE_COLUMNS.indexOf(column);
}

function coordinateFromOffset(columnIndex: number, row: number): Coordinate | null {
  const column = COORDINATE_COLUMNS[columnIndex];

  if (!column || !ROWS.includes(row as CoordinateRow)) {
    return null;
  }

  return { column, row: row as CoordinateRow };
}

export function moveCoordinate(coordinate: Coordinate, direction: MoveDirection): Coordinate | null {
  const currentColumn = columnOffset(coordinate.column);
  const isEvenRow = coordinate.row % 2 === 0;
  const offsets: Record<MoveDirection, [number, number]> = {
    W: [-1, 0],
    E: [1, 0],
    NW: [isEvenRow ? 0 : -1, -1],
    NE: [isEvenRow ? 1 : 0, -1],
    SW: [isEvenRow ? 0 : -1, 1],
    SE: [isEvenRow ? 1 : 0, 1],
  };
  const [columnDelta, rowDelta] = offsets[direction];

  return coordinateFromOffset(currentColumn + columnDelta, coordinate.row + rowDelta);
}

export function getVisibleMapTiles(existingTiles: RunTile[]): RunTile[] {
  const byCoordinate = new Map(existingTiles.map((tile) => [tile.coordinate, tile]));

  return ROWS.flatMap((row) =>
    COORDINATE_COLUMNS.map((column) => {
      const coordinate = coordinateToId({ column, row });
      return (
        byCoordinate.get(coordinate) ?? {
          id: coordinate,
          coordinate,
          row,
          column,
          terrain: "unknown",
          visited: false,
          icons: [],
          eventHistory: [],
          repeatabilityState: {},
          enemyState: null,
          notes: null,
        }
      );
    }),
  );
}
```

- [ ] **Step 7: Implement survival resolver**

Create `src/lib/game/survival.ts`:

```ts
import type { InventoryItem, RunStats } from "@/lib/game/types";

type ResolveCampInput = {
  stats: RunStats;
  inventory: InventoryItem[];
  foodChoice: "eat_meal_bar" | "skip_food";
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

  if (ateFood) {
    mealBar.quantity -= 1;
  }

  const stats: RunStats = {
    ...input.stats,
    hp: clampStat(input.stats.hp + 2),
    ep: clampStat(input.stats.ep + 2),
    starvationCount: ateFood ? 0 : input.stats.starvationCount + 1,
    sleepDeprivationCount: 0,
  };

  return {
    stats,
    inventory,
    summary: ateFood
      ? "You ate a Meal Bar, rested, and recovered at camp."
      : "You went without food, rested, and felt hunger settle in.",
  };
}
```

- [ ] **Step 8: Run helper tests and typecheck**

Run:

```bash
npm run test:unit -- tests/unit/game/dice.test.ts tests/unit/game/map.test.ts tests/unit/game/survival.test.ts
npm run typecheck
```

Expected: both commands exit 0.

- [ ] **Step 9: Commit Task 2**

Run:

```bash
git add src/lib/game/dice.ts src/lib/game/map.ts src/lib/game/survival.ts tests/unit/game/dice.test.ts tests/unit/game/map.test.ts tests/unit/game/survival.test.ts
git commit -m "feat: add core game helpers"
```

## Task 3: Engine State Machine And Representative Branches

**Files:**
- Create: `src/data/miru1v2e/events.ts`
- Create: `src/data/miru1v2e/enemies.ts`
- Create: `src/lib/game/combat.ts`
- Create: `src/lib/game/rewards.ts`
- Create: `src/lib/game/turnMachine.ts`
- Create: `src/lib/game/engine.ts`
- Test: `tests/unit/game/engine.test.ts`
- Test: `tests/unit/game/combat.test.ts`

- [ ] **Step 1: Write failing engine tests**

Create `tests/unit/game/engine.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createFixedDiceRoller } from "@/lib/game/dice";
import { applyGameAction } from "@/lib/game/engine";
import type { RunSnapshot } from "@/lib/game/types";

function baseSnapshot(promptType: RunSnapshot["pendingPrompt"]["type"] = "ready_for_next_day"): RunSnapshot {
  return {
    run: {
      id: "run-1",
      title: "Field Notes",
      status: "active",
      rulesVersion: "miru1v2e",
      currentDay: 1,
      updatedAt: "2026-05-07T00:00:00.000Z",
    },
    stats: {
      hp: 10,
      ep: 10,
      baseAtk: 1,
      baseDef: 1,
      bitliths: 0,
      starvationCount: 0,
      sleepDeprivationCount: 0,
      minorInjuryCount: 0,
    },
    currentTile: {
      id: "tile-1",
      coordinate: "E01",
      row: 1,
      column: "E",
      terrain: "unknown",
      visited: true,
      icons: [],
      eventHistory: [],
      repeatabilityState: {},
      enemyState: null,
      notes: null,
    },
    visibleTiles: [],
    inventory: [{ key: "meal-bar", name: "Meal Bar", category: "food", quantity: 3, metadata: {} }],
    techSkills: [],
    activeEnemy: null,
    pendingPrompt:
      promptType === "camp_required"
        ? {
            type: "camp_required",
            title: "Make camp",
            body: "Resolve food and rest before the next day.",
            choices: [{ key: "eat_meal_bar", label: "Eat Meal Bar" }],
          }
        : {
            type: "ready_for_next_day",
            title: "Ready for the next day",
            body: "Begin the next day when your notes are settled.",
          },
    legalActions: [{ type: promptType === "camp_required" ? "camp" : "next_day", label: promptType === "camp_required" ? "Camp" : "Next Day" }],
    recentActions: [],
    latestJournalEntry: null,
  };
}

describe("applyGameAction", () => {
  it("resolves the default first Next Day into a camp prompt with a recorded roll", () => {
    const result = applyGameAction(
      baseSnapshot(),
      { type: "next_day" },
      createFixedDiceRoller([3, 4]),
    );

    expect(result.snapshot.pendingPrompt.type).toBe("camp_required");
    expect(result.snapshot.legalActions).toEqual([{ type: "camp", label: "Camp", payload: { foodChoice: "eat_meal_bar" } }]);
    expect(result.diceRolls).toHaveLength(1);
    expect(result.diceRolls[0]).toMatchObject({ notation: "2d6", purpose: "terrain", values: [3, 4] });
    expect(result.summary.type).toBe("next_day");
  });

  it("resolves camp into a journal prompt without advancing the client first", () => {
    const result = applyGameAction(
      baseSnapshot("camp_required"),
      { type: "camp", payload: { foodChoice: "eat_meal_bar" } },
      createFixedDiceRoller([]),
    );

    expect(result.snapshot.pendingPrompt).toMatchObject({
      type: "journal_available",
      dayNumber: 1,
      tileId: "tile-1",
    });
    expect(result.snapshot.inventory[0]?.quantity).toBe(2);
    expect(result.snapshot.legalActions).toEqual([{ type: "journal", label: "Write Journal" }]);
  });

  it("rejects actions that are illegal for the current prompt", () => {
    expect(() =>
      applyGameAction(
        baseSnapshot("camp_required"),
        { type: "next_day" },
        createFixedDiceRoller([]),
      ),
    ).toThrow("INVALID_ACTION_FOR_STATE");
  });
});
```

- [ ] **Step 2: Write failing combat test**

Create `tests/unit/game/combat.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createFixedDiceRoller } from "@/lib/game/dice";
import { resolveCombatRound } from "@/lib/game/combat";
import { REPRESENTATIVE_ENEMIES } from "@/data/miru1v2e/enemies";

describe("resolveCombatRound", () => {
  it("lets the player defeat the representative enemy and receive a reward summary", () => {
    const result = resolveCombatRound({
      stats: {
        hp: 10,
        ep: 10,
        baseAtk: 1,
        baseDef: 1,
        bitliths: 0,
        starvationCount: 0,
        sleepDeprivationCount: 0,
        minorInjuryCount: 0,
      },
      enemy: { ...REPRESENTATIVE_ENEMIES["training-drone"], hp: 1 },
      move: "attack",
      dice: createFixedDiceRoller([6, 1]),
    });

    expect(result.enemy).toBeNull();
    expect(result.reward.bitliths).toBe(1);
    expect(result.diceRolls).toHaveLength(1);
    expect(result.summary).toContain("defeated");
  });
});
```

- [ ] **Step 3: Run engine tests and verify they fail**

Run:

```bash
npm run test:unit -- tests/unit/game/engine.test.ts tests/unit/game/combat.test.ts
```

Expected: FAIL because engine and representative data modules do not exist.

- [ ] **Step 4: Create representative event and enemy data**

Create `src/data/miru1v2e/events.ts`:

```ts
export const REPRESENTATIVE_EVENTS = {
  "first-field-discovery": {
    key: "first-field-discovery",
    title: "A quiet field discovery",
    body: "The route opens into a safe stretch of field kit work: mark the terrain, note the find, and make camp.",
    terrain: "grasslands",
  },
} as const;
```

Create `src/data/miru1v2e/enemies.ts`:

```ts
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
```

- [ ] **Step 5: Implement rewards and combat**

Create `src/lib/game/rewards.ts`:

```ts
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
```

Create `src/lib/game/combat.ts`:

```ts
import type { DiceRoller } from "@/lib/game/dice";
import type { EnemyState, RunStats } from "@/lib/game/types";
import { resolveReward, type RewardResult } from "@/lib/game/rewards";

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
```

- [ ] **Step 6: Implement turn machine and action dispatcher**

Create `src/lib/game/turnMachine.ts`:

```ts
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
    visibleTiles: snapshot.visibleTiles.map((tile) =>
      tile.id === nextTile.id ? nextTile : tile,
    ),
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
```

Create `src/lib/game/engine.ts`:

```ts
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
```

- [ ] **Step 7: Run engine tests and typecheck**

Run:

```bash
npm run test:unit -- tests/unit/game/engine.test.ts tests/unit/game/combat.test.ts
npm run typecheck
```

Expected: both commands exit 0.

- [ ] **Step 8: Commit Task 3**

Run:

```bash
git add src/data/miru1v2e/events.ts src/data/miru1v2e/enemies.ts src/lib/game/combat.ts src/lib/game/rewards.ts src/lib/game/turnMachine.ts src/lib/game/engine.ts tests/unit/game/engine.test.ts tests/unit/game/combat.test.ts
git commit -m "feat: add phase 1 game engine slice"
```

## Task 4: Run Snapshot Mapper And Detail API

**Files:**
- Create: `src/lib/runs/snapshot.ts`
- Create: `src/app/api/runs/[runId]/route.ts`
- Modify: `src/lib/runs/queries.ts`
- Test: `tests/unit/lib/runs/snapshot.test.ts`
- Test: `tests/unit/api/run-detail-route.test.ts`

- [ ] **Step 1: Write failing snapshot mapper tests**

Create `tests/unit/lib/runs/snapshot.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { mapRunRowsToSnapshot } from "@/lib/runs/snapshot";

describe("mapRunRowsToSnapshot", () => {
  it("maps persisted rows to a resumable RunSnapshot", () => {
    const snapshot = mapRunRowsToSnapshot({
      run: {
        id: "run-1",
        title: "Field Notes",
        status: "active",
        rules_version: "miru1v2e",
        current_day: 1,
        hp: 10,
        ep: 10,
        base_atk: 1,
        base_def: 1,
        bitliths: 0,
        starvation_count: 0,
        sleep_deprivation_count: 0,
        minor_injury_count: 0,
        active_enemy: null,
        pending_prompt: null,
        current_tile_id: "tile-1",
        updated_at: "2026-05-07T00:00:00.000Z",
        last_journal_entry: null,
      },
      currentTile: {
        id: "tile-1",
        row_number: 1,
        column_letter: "E",
        terrain: "unknown",
        visited: true,
        icons: [],
        event_history: [],
        repeatability_state: {},
        enemy_state: null,
        notes: null,
      },
      visibleTiles: [],
      inventory: [{ item_key: "meal-bar", item_name: "Meal Bar", category: "food", quantity: 3, metadata: {} }],
      techSkills: [],
      recentActions: [],
      latestJournalEntry: null,
    });

    expect(snapshot.currentTile.coordinate).toBe("E01");
    expect(snapshot.pendingPrompt.type).toBe("ready_for_next_day");
    expect(snapshot.legalActions).toEqual([{ type: "next_day", label: "Next Day" }]);
  });
});
```

- [ ] **Step 2: Write failing run detail route tests**

Create `tests/unit/api/run-detail-route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetRunSnapshot, mockGetRouteUser } = vi.hoisted(() => ({
  mockGetRunSnapshot: vi.fn(),
  mockGetRouteUser: vi.fn(),
}));

vi.mock("@/lib/runs/snapshot", () => ({
  getRunSnapshot: mockGetRunSnapshot,
}));

vi.mock("@/lib/supabase/server", () => ({
  getRouteUser: mockGetRouteUser,
}));

describe("/api/runs/[runId]", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns a run snapshot for the owner", async () => {
    mockGetRouteUser.mockResolvedValue({ supabase: {}, user: { id: "user-1" } });
    mockGetRunSnapshot.mockResolvedValue({
      run: { id: "run-1", title: "Field Notes", status: "active", rulesVersion: "miru1v2e", currentDay: 1, updatedAt: "now" },
    });

    const { GET } = await import("@/app/api/runs/[runId]/route");
    const response = await GET(new Request("http://localhost/api/runs/run-1"), {
      params: Promise.resolve({ runId: "run-1" }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        run: { id: "run-1", title: "Field Notes", status: "active", rulesVersion: "miru1v2e", currentDay: 1, updatedAt: "now" },
      },
    });
  });

  it("returns an owner-safe 404 when no snapshot is found", async () => {
    mockGetRouteUser.mockResolvedValue({ supabase: {}, user: { id: "user-1" } });
    mockGetRunSnapshot.mockResolvedValue(null);

    const { GET } = await import("@/app/api/runs/[runId]/route");
    const response = await GET(new Request("http://localhost/api/runs/run-2"), {
      params: Promise.resolve({ runId: "run-2" }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: { code: "RUN_NOT_FOUND", message: "That run could not be found for this session." },
    });
  });
});
```

- [ ] **Step 3: Run snapshot and route tests and verify they fail**

Run:

```bash
npm run test:unit -- tests/unit/lib/runs/snapshot.test.ts tests/unit/api/run-detail-route.test.ts
```

Expected: FAIL because the snapshot mapper and detail route do not exist.

- [ ] **Step 4: Implement `mapRunRowsToSnapshot` and `getRunSnapshot`**

Create `src/lib/runs/snapshot.ts`:

```ts
import type { createServerSupabaseClient } from "@/lib/supabase/server";
import { coordinateToId, getVisibleMapTiles } from "@/lib/game/map";
import type { RunPrompt, RunSnapshot, RunTile } from "@/lib/game/types";

type RouteSupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

export class RunSnapshotIncompleteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RunSnapshotIncompleteError";
  }
}

function defaultPrompt(): RunPrompt {
  return {
    type: "ready_for_next_day",
    title: "Ready for the next day",
    body: "Begin the next day when your notes are settled.",
  };
}

function mapTile(row: {
  id: string;
  row_number: number;
  column_letter: string;
  terrain: RunTile["terrain"];
  visited: boolean;
  icons: RunTile["icons"];
  event_history: string[];
  repeatability_state: Record<string, unknown>;
  enemy_state: RunTile["enemyState"];
  notes: string | null;
}): RunTile {
  return {
    id: row.id,
    row: row.row_number as RunTile["row"],
    column: row.column_letter as RunTile["column"],
    coordinate: coordinateToId({
      row: row.row_number as RunTile["row"],
      column: row.column_letter as RunTile["column"],
    }),
    terrain: row.terrain,
    visited: row.visited,
    icons: row.icons ?? [],
    eventHistory: row.event_history ?? [],
    repeatabilityState: row.repeatability_state ?? {},
    enemyState: row.enemy_state ?? null,
    notes: row.notes,
  };
}

export function mapRunRowsToSnapshot(input: {
  run: {
    id: string;
    title: string;
    status: RunSnapshot["run"]["status"];
    rules_version: "miru1v2e";
    current_day: number;
    hp: number;
    ep: number;
    base_atk: number;
    base_def: number;
    bitliths: number;
    starvation_count: number;
    sleep_deprivation_count: number;
    minor_injury_count: number;
    active_enemy: RunSnapshot["activeEnemy"];
    pending_prompt: RunPrompt | null;
    updated_at: string;
  };
  currentTile: Parameters<typeof mapTile>[0];
  visibleTiles: Array<Parameters<typeof mapTile>[0]>;
  inventory: Array<{ item_key: string; item_name: string; category: RunSnapshot["inventory"][number]["category"]; quantity: number; metadata: Record<string, unknown> }>;
  techSkills: Array<{ skill_key: string; skill_name: string; unlocked: boolean; training_level: number }>;
  recentActions: RunSnapshot["recentActions"];
  latestJournalEntry: RunSnapshot["latestJournalEntry"];
}): RunSnapshot {
  const currentTile = mapTile(input.currentTile);
  const prompt = input.run.pending_prompt ?? defaultPrompt();

  return {
    run: {
      id: input.run.id,
      title: input.run.title,
      status: input.run.status,
      rulesVersion: input.run.rules_version,
      currentDay: input.run.current_day,
      updatedAt: input.run.updated_at,
    },
    stats: {
      hp: input.run.hp,
      ep: input.run.ep,
      baseAtk: input.run.base_atk,
      baseDef: input.run.base_def,
      bitliths: input.run.bitliths,
      starvationCount: input.run.starvation_count,
      sleepDeprivationCount: input.run.sleep_deprivation_count,
      minorInjuryCount: input.run.minor_injury_count,
    },
    currentTile,
    visibleTiles: getVisibleMapTiles(input.visibleTiles.map(mapTile)),
    inventory: input.inventory.map((item) => ({
      key: item.item_key,
      name: item.item_name,
      category: item.category,
      quantity: item.quantity,
      metadata: item.metadata ?? {},
    })),
    techSkills: input.techSkills.map((skill) => ({
      key: skill.skill_key,
      name: skill.skill_name,
      unlocked: skill.unlocked,
      trainingLevel: skill.training_level,
    })),
    activeEnemy: input.run.active_enemy,
    pendingPrompt: prompt,
    legalActions: prompt.type === "camp_required"
      ? [{ type: "camp", label: "Camp", payload: { foodChoice: "eat_meal_bar" } }]
      : prompt.type === "journal_available"
        ? [{ type: "journal", label: "Write Journal" }]
        : prompt.type === "combat_choice"
          ? [{ type: "combat_action", label: "Attack", payload: { move: "attack" } }]
          : [{ type: "next_day", label: "Next Day" }],
    recentActions: input.recentActions,
    latestJournalEntry: input.latestJournalEntry,
  };
}

export async function getRunSnapshot(
  supabase: RouteSupabaseClient,
  userId: string,
  runId: string,
) {
  const { data: run, error: runError } = await supabase
    .from("runs")
    .select("*")
    .eq("id", runId)
    .eq("user_id", userId)
    .maybeSingle();

  if (runError) throw runError;
  if (!run) return null;
  if (!run.current_tile_id) {
    throw new RunSnapshotIncompleteError("Run is missing a current tile.");
  }

  const { data: currentTile, error: currentTileError } = await supabase
    .from("run_tiles")
    .select("*")
    .eq("id", run.current_tile_id)
    .eq("run_id", run.id)
    .maybeSingle();

  if (currentTileError) throw currentTileError;
  if (!currentTile) {
    throw new RunSnapshotIncompleteError("Current tile could not be loaded.");
  }

  const [{ data: visibleTiles, error: visibleTilesError }, { data: inventory, error: inventoryError }, { data: techSkills, error: techSkillsError }] =
    await Promise.all([
      supabase.from("run_tiles").select("*").eq("run_id", run.id),
      supabase.from("run_inventory").select("*").eq("run_id", run.id).order("category").order("item_name"),
      supabase.from("tech_skills").select("*").eq("run_id", run.id).order("skill_name"),
    ]);

  if (visibleTilesError) throw visibleTilesError;
  if (inventoryError) throw inventoryError;
  if (techSkillsError) throw techSkillsError;

  return mapRunRowsToSnapshot({
    run,
    currentTile,
    visibleTiles: visibleTiles ?? [],
    inventory: inventory ?? [],
    techSkills: techSkills ?? [],
    recentActions: [],
    latestJournalEntry: null,
  });
}
```

- [ ] **Step 5: Implement the run detail route**

Create `src/app/api/runs/[runId]/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getRunSnapshot } from "@/lib/runs/snapshot";
import { getRouteUser } from "@/lib/supabase/server";

function unauthorized() {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Start from the home screen to create or restore your Miru session.",
      },
    },
    { status: 401 },
  );
}

function notFound() {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "RUN_NOT_FOUND",
        message: "That run could not be found for this session.",
      },
    },
    { status: 404 },
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { supabase, user } = await getRouteUser();

  if (!user) {
    return unauthorized();
  }

  const { runId } = await params;
  const snapshot = await getRunSnapshot(supabase, user.id, runId);

  if (!snapshot) {
    return notFound();
  }

  return NextResponse.json({ ok: true, data: snapshot });
}
```

- [ ] **Step 6: Run snapshot and route tests**

Run:

```bash
npm run test:unit -- tests/unit/lib/runs/snapshot.test.ts tests/unit/api/run-detail-route.test.ts
npm run typecheck
```

Expected: both commands exit 0.

- [ ] **Step 7: Commit Task 4**

Run:

```bash
git add src/lib/runs/snapshot.ts src/app/api/runs/[runId]/route.ts tests/unit/lib/runs/snapshot.test.ts tests/unit/api/run-detail-route.test.ts
git commit -m "feat: add run snapshot API"
```

## Task 5: Action Persistence And Action API

**Files:**
- Create: `src/lib/runs/actions.ts`
- Create: `src/app/api/runs/[runId]/actions/route.ts`
- Test: `tests/unit/api/run-actions-route.test.ts`
- Test: `tests/unit/lib/runs/actions.test.ts`

- [ ] **Step 1: Write failing action route tests**

Create `tests/unit/api/run-actions-route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockApplyRunAction, mockGetRouteUser } = vi.hoisted(() => ({
  mockApplyRunAction: vi.fn(),
  mockGetRouteUser: vi.fn(),
}));

vi.mock("@/lib/runs/actions", () => ({
  applyRunAction: mockApplyRunAction,
}));

vi.mock("@/lib/supabase/server", () => ({
  getRouteUser: mockGetRouteUser,
}));

describe("/api/runs/[runId]/actions", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("applies a legal action and returns the updated snapshot", async () => {
    mockGetRouteUser.mockResolvedValue({ supabase: {}, user: { id: "user-1" } });
    mockApplyRunAction.mockResolvedValue({
      snapshot: { run: { id: "run-1" }, legalActions: [{ type: "camp", label: "Camp" }] },
      action: { type: "next_day", title: "A quiet field discovery" },
    });

    const { POST } = await import("@/app/api/runs/[runId]/actions/route");
    const response = await POST(
      new Request("http://localhost/api/runs/run-1/actions", {
        method: "POST",
        body: JSON.stringify({ type: "next_day" }),
      }),
      { params: Promise.resolve({ runId: "run-1" }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        snapshot: { run: { id: "run-1" }, legalActions: [{ type: "camp", label: "Camp" }] },
        action: { type: "next_day", title: "A quiet field discovery" },
      },
    });
  });

  it("returns 409 with valid actions when the engine rejects a stale action", async () => {
    mockGetRouteUser.mockResolvedValue({ supabase: {}, user: { id: "user-1" } });
    mockApplyRunAction.mockRejectedValue(
      Object.assign(new Error("INVALID_ACTION_FOR_STATE"), {
        validActions: [{ type: "camp", label: "Camp" }],
      }),
    );

    const { POST } = await import("@/app/api/runs/[runId]/actions/route");
    const response = await POST(
      new Request("http://localhost/api/runs/run-1/actions", {
        method: "POST",
        body: JSON.stringify({ type: "next_day" }),
      }),
      { params: Promise.resolve({ runId: "run-1" }) },
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "INVALID_ACTION_FOR_STATE",
        message: "That action is no longer valid for this run state.",
        details: { validActions: [{ type: "camp", label: "Camp" }] },
      },
    });
  });
});
```

- [ ] **Step 2: Write failing action helper test**

Create `tests/unit/lib/runs/actions.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { applyRunAction } from "@/lib/runs/actions";

describe("applyRunAction", () => {
  it("loads, transitions, persists, logs, and reloads a run snapshot", async () => {
    const supabase = { from: vi.fn() };
    const getRunSnapshot = vi.fn()
      .mockResolvedValueOnce({
        run: { id: "run-1", currentDay: 1 },
        stats: { hp: 10, ep: 10, baseAtk: 1, baseDef: 1, bitliths: 0, starvationCount: 0, sleepDeprivationCount: 0, minorInjuryCount: 0 },
        currentTile: { id: "tile-1", coordinate: "E01", row: 1, column: "E", terrain: "unknown", visited: true, icons: [], eventHistory: [], repeatabilityState: {}, enemyState: null, notes: null },
        visibleTiles: [],
        inventory: [{ key: "meal-bar", name: "Meal Bar", category: "food", quantity: 3, metadata: {} }],
        techSkills: [],
        activeEnemy: null,
        pendingPrompt: { type: "ready_for_next_day", title: "Ready", body: "Begin." },
        legalActions: [{ type: "next_day", label: "Next Day" }],
        recentActions: [],
        latestJournalEntry: null,
      })
      .mockResolvedValueOnce({ run: { id: "run-1" }, legalActions: [{ type: "camp", label: "Camp" }] });
    const persistGameActionResult = vi.fn().mockResolvedValue(undefined);

    const result = await applyRunAction({
      supabase: supabase as never,
      userId: "user-1",
      runId: "run-1",
      action: { type: "next_day" },
      getRunSnapshot,
      persistGameActionResult,
    });

    expect(persistGameActionResult).toHaveBeenCalled();
    expect(getRunSnapshot).toHaveBeenCalledTimes(2);
    expect(result.snapshot).toEqual({ run: { id: "run-1" }, legalActions: [{ type: "camp", label: "Camp" }] });
  });
});
```

- [ ] **Step 3: Run action tests and verify they fail**

Run:

```bash
npm run test:unit -- tests/unit/api/run-actions-route.test.ts tests/unit/lib/runs/actions.test.ts
```

Expected: FAIL because the action route and helper do not exist.

- [ ] **Step 4: Implement action helper**

Create `src/lib/runs/actions.ts`:

```ts
import { applyGameAction } from "@/lib/game/engine";
import type { GameAction, GameActionResult, RunSnapshot } from "@/lib/game/types";
import { getRunSnapshot as defaultGetRunSnapshot } from "@/lib/runs/snapshot";
import type { createServerSupabaseClient } from "@/lib/supabase/server";

type RouteSupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

export class InvalidActionForStateError extends Error {
  validActions: RunSnapshot["legalActions"];

  constructor(validActions: RunSnapshot["legalActions"]) {
    super("INVALID_ACTION_FOR_STATE");
    this.name = "InvalidActionForStateError";
    this.validActions = validActions;
  }
}

export async function persistGameActionResult({
  supabase,
  userId,
  runId,
  result,
}: {
  supabase: RouteSupabaseClient;
  userId: string;
  runId: string;
  result: GameActionResult;
}) {
  const { snapshot, summary } = result;
  const { error: runError } = await supabase
    .from("runs")
    .update({
      current_day: snapshot.run.currentDay,
      hp: snapshot.stats.hp,
      ep: snapshot.stats.ep,
      bitliths: snapshot.stats.bitliths,
      starvation_count: snapshot.stats.starvationCount,
      sleep_deprivation_count: snapshot.stats.sleepDeprivationCount,
      minor_injury_count: snapshot.stats.minorInjuryCount,
      active_enemy: snapshot.activeEnemy,
      pending_prompt: snapshot.pendingPrompt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", runId)
    .eq("user_id", userId);

  if (runError) throw runError;

  const { error: tileError } = await supabase
    .from("run_tiles")
    .update({
      terrain: snapshot.currentTile.terrain,
      visited: snapshot.currentTile.visited,
      event_history: snapshot.currentTile.eventHistory,
      repeatability_state: snapshot.currentTile.repeatabilityState,
      enemy_state: snapshot.currentTile.enemyState,
      notes: snapshot.currentTile.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", snapshot.currentTile.id)
    .eq("run_id", runId)
    .eq("user_id", userId);

  if (tileError) throw tileError;

  await Promise.all(
    snapshot.inventory.map((item) =>
      supabase
        .from("run_inventory")
        .update({
          quantity: item.quantity,
          metadata: item.metadata,
          updated_at: new Date().toISOString(),
        })
        .eq("run_id", runId)
        .eq("user_id", userId)
        .eq("item_key", item.key)
        .then(({ error }) => {
          if (error) throw error;
        }),
    ),
  );

  const { data: action, error: actionError } = await supabase
    .from("action_log")
    .insert({
      run_id: runId,
      user_id: userId,
      action_type: summary.type,
      day_number: summary.dayNumber,
      tile_id: summary.tileId,
      input: {},
      result: { title: summary.title, body: summary.body },
      dice_rolls: result.diceRolls,
    })
    .select("id,created_at")
    .single();

  if (actionError) throw actionError;

  return {
    id: action.id as string,
    createdAt: action.created_at as string,
  };
}

export async function applyRunAction({
  supabase,
  userId,
  runId,
  action,
  getRunSnapshot = defaultGetRunSnapshot,
  persistGameActionResult: persist = persistGameActionResult,
}: {
  supabase: RouteSupabaseClient;
  userId: string;
  runId: string;
  action: GameAction;
  getRunSnapshot?: typeof defaultGetRunSnapshot;
  persistGameActionResult?: typeof persistGameActionResult;
}) {
  const snapshot = await getRunSnapshot(supabase, userId, runId);

  if (!snapshot) {
    return null;
  }

  let result: GameActionResult;

  try {
    result = applyGameAction(snapshot, action);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ACTION_FOR_STATE") {
      throw new InvalidActionForStateError(snapshot.legalActions);
    }

    throw error;
  }

  const actionRow = await persist({ supabase, userId, runId, result });
  const updatedSnapshot = await getRunSnapshot(supabase, userId, runId);

  if (!updatedSnapshot) {
    throw new Error("Run disappeared after action persistence.");
  }

  return {
    snapshot: updatedSnapshot,
    action: {
      ...result.summary,
      id: actionRow.id,
      createdAt: actionRow.createdAt,
    },
  };
}
```

- [ ] **Step 5: Implement action route**

Create `src/app/api/runs/[runId]/actions/route.ts`:

```ts
import { NextResponse } from "next/server";
import { applyRunAction, InvalidActionForStateError } from "@/lib/runs/actions";
import { getRouteUser } from "@/lib/supabase/server";
import { gameActionRequestSchema } from "@/lib/validation/schemas";

async function readJsonBody(request: Request) {
  const rawBody = await request.text();
  return rawBody.trim() ? (JSON.parse(rawBody) as unknown) : {};
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { supabase, user } = await getRouteUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHORIZED", message: "Start from the home screen to create or restore your Miru session." } },
      { status: 401 },
    );
  }

  const parsed = gameActionRequestSchema.safeParse(await readJsonBody(request));

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: { code: "BAD_REQUEST", message: "Invalid run action payload." } },
      { status: 400 },
    );
  }

  try {
    const { runId } = await params;
    const result = await applyRunAction({
      supabase,
      userId: user.id,
      runId,
      action: parsed.data,
    });

    if (!result) {
      return NextResponse.json(
        { ok: false, error: { code: "RUN_NOT_FOUND", message: "That run could not be found for this session." } },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof InvalidActionForStateError) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INVALID_ACTION_FOR_STATE",
            message: "That action is no longer valid for this run state.",
            details: { validActions: error.validActions },
          },
        },
        { status: 409 },
      );
    }

    throw error;
  }
}
```

- [ ] **Step 6: Run action tests and typecheck**

Run:

```bash
npm run test:unit -- tests/unit/api/run-actions-route.test.ts tests/unit/lib/runs/actions.test.ts
npm run typecheck
```

Expected: both commands exit 0.

- [ ] **Step 7: Commit Task 5**

Run:

```bash
git add src/lib/runs/actions.ts src/app/api/runs/[runId]/actions/route.ts tests/unit/api/run-actions-route.test.ts tests/unit/lib/runs/actions.test.ts
git commit -m "feat: add run action endpoint"
```

## Task 6: Journal Endpoint And Resume Context

**Files:**
- Create: `supabase/migrations/0003_journal_one_per_day.sql`
- Create: `src/app/api/runs/[runId]/journal/route.ts`
- Modify: `src/lib/runs/snapshot.ts`
- Modify: `src/lib/runs/queries.ts`
- Modify: `src/app/api/runs/route.ts`
- Test: `tests/unit/supabase/journal-schema.test.ts`
- Test: `tests/unit/api/journal-route.test.ts`
- Test: `tests/unit/lib/runs/snapshot.test.ts`

- [ ] **Step 1: Write failing journal route tests**

Create `tests/unit/api/journal-route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetRouteUser } = vi.hoisted(() => ({
  mockGetRouteUser: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  getRouteUser: mockGetRouteUser,
}));

function journalSupabase() {
  const maybeSingle = vi.fn().mockResolvedValue({ data: { id: "run-1", current_tile_id: "tile-1" }, error: null });
  const runSelect = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle }) }) });
  const upsertSingle = vi.fn().mockResolvedValue({
    data: { id: "journal-1", run_id: "run-1", day_number: 1, tile_id: "tile-1", body: "Camp was quiet.", updated_at: "now" },
    error: null,
  });
  const upsertSelect = vi.fn().mockReturnValue({ single: upsertSingle });
  const upsert = vi.fn().mockReturnValue({ select: upsertSelect });
  const updateEq2 = vi.fn().mockResolvedValue({ error: null });
  const updateEq1 = vi.fn().mockReturnValue({ eq: updateEq2 });
  const update = vi.fn().mockReturnValue({ eq: updateEq1 });

  return {
    from: vi.fn((table: string) => {
      if (table === "runs") return { select: runSelect, update };
      return { upsert };
    }),
  };
}

describe("/api/runs/[runId]/journal", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("saves a day and tile tied journal entry", async () => {
    const supabase = journalSupabase();
    mockGetRouteUser.mockResolvedValue({ supabase, user: { id: "user-1" } });

    const { POST } = await import("@/app/api/runs/[runId]/journal/route");
    const response = await POST(
      new Request("http://localhost/api/runs/run-1/journal", {
        method: "POST",
        body: JSON.stringify({ dayNumber: 1, tileId: "00000000-0000-4000-8000-000000000001", body: "Camp was quiet." }),
      }),
      { params: Promise.resolve({ runId: "run-1" }) },
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      data: { body: "Camp was quiet.", dayNumber: 1 },
    });
  });

  it("returns 400 when the journal body is too long", async () => {
    mockGetRouteUser.mockResolvedValue({ supabase: {}, user: { id: "user-1" } });

    const { POST } = await import("@/app/api/runs/[runId]/journal/route");
    const response = await POST(
      new Request("http://localhost/api/runs/run-1/journal", {
        method: "POST",
        body: JSON.stringify({ dayNumber: 1, body: "x".repeat(1001) }),
      }),
      { params: Promise.resolve({ runId: "run-1" }) },
    );

    expect(response.status).toBe(400);
  });
});
```

- [ ] **Step 2: Write the journal uniqueness schema test**

Create `tests/unit/supabase/journal-schema.test.ts`:

```ts
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("journal schema", () => {
  it("keeps one journal entry per run and day for upsert", () => {
    const migration = readFileSync(
      path.join(process.cwd(), "supabase/migrations/0003_journal_one_per_day.sql"),
      "utf8",
    );

    expect(migration).toMatch(
      /create unique index journal_entries_one_per_run_day_idx\s+on journal_entries\s+\(run_id,\s*day_number\);/i,
    );
  });
});
```

- [ ] **Step 3: Run journal tests and verify they fail**

Run:

```bash
npm run test:unit -- tests/unit/api/journal-route.test.ts tests/unit/supabase/journal-schema.test.ts
```

Expected: FAIL because the journal route and journal uniqueness migration do not exist.

- [ ] **Step 4: Create journal uniqueness migration**

Create `supabase/migrations/0003_journal_one_per_day.sql`:

```sql
create unique index journal_entries_one_per_run_day_idx
  on journal_entries (run_id, day_number);
```

- [ ] **Step 5: Implement journal route**

Create `src/app/api/runs/[runId]/journal/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getRouteUser } from "@/lib/supabase/server";
import { journalRequestSchema } from "@/lib/validation/schemas";

async function readJsonBody(request: Request) {
  const rawBody = await request.text();
  return rawBody.trim() ? (JSON.parse(rawBody) as unknown) : {};
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { supabase, user } = await getRouteUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHORIZED", message: "Start from the home screen to create or restore your Miru session." } },
      { status: 401 },
    );
  }

  const parsed = journalRequestSchema.safeParse(await readJsonBody(request));

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_JOURNAL_ENTRY", message: "Journal entries must be 1 to 1000 characters." } },
      { status: 400 },
    );
  }

  const { runId } = await params;
  const { data: run, error: runError } = await supabase
    .from("runs")
    .select("id,current_tile_id")
    .eq("id", runId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (runError) throw runError;
  if (!run) {
    return NextResponse.json(
      { ok: false, error: { code: "RUN_NOT_FOUND", message: "That run could not be found for this session." } },
      { status: 404 },
    );
  }

  const tileId = parsed.data.tileId ?? run.current_tile_id;
  const { data: entry, error: journalError } = await supabase
    .from("journal_entries")
    .upsert(
      {
        run_id: runId,
        user_id: user.id,
        day_number: parsed.data.dayNumber,
        tile_id: tileId,
        body: parsed.data.body,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "run_id,day_number" },
    )
    .select("id,run_id,day_number,tile_id,body,updated_at")
    .single();

  if (journalError) throw journalError;

  const { error: runUpdateError } = await supabase
    .from("runs")
    .update({
      last_journal_entry: parsed.data.body,
      pending_prompt: {
        type: "day_complete",
        title: "Day recorded",
        body: "Your notes are saved. You can begin the next day.",
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", runId)
    .eq("user_id", user.id);

  if (runUpdateError) throw runUpdateError;

  return NextResponse.json(
    {
      ok: true,
      data: {
        id: entry.id,
        runId: entry.run_id,
        dayNumber: entry.day_number,
        tileId: entry.tile_id,
        body: entry.body,
        updatedAt: entry.updated_at,
      },
    },
    { status: 201 },
  );
}
```

- [ ] **Step 6: Extend snapshot mapper to include journal and recent actions**

Modify `src/lib/runs/snapshot.ts` so `getRunSnapshot` loads:

```ts
const [{ data: recentActions, error: recentActionsError }, { data: latestJournal, error: journalError }] =
  await Promise.all([
    supabase
      .from("action_log")
      .select("id,action_type,day_number,tile_id,result,dice_rolls,created_at")
      .eq("run_id", run.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("journal_entries")
      .select("id,run_id,day_number,tile_id,body,updated_at")
      .eq("run_id", run.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

if (recentActionsError) throw recentActionsError;
if (journalError) throw journalError;
```

Map rows before calling `mapRunRowsToSnapshot`:

```ts
const mappedRecentActions = (recentActions ?? []).map((action) => ({
  id: action.id,
  type: action.action_type,
  title: String(action.result?.title ?? action.action_type),
  body: String(action.result?.body ?? ""),
  dayNumber: action.day_number,
  tileId: action.tile_id,
  diceRolls: action.dice_rolls ?? [],
  createdAt: action.created_at,
}));

const mappedLatestJournal = latestJournal
  ? {
      id: latestJournal.id,
      runId: latestJournal.run_id,
      dayNumber: latestJournal.day_number,
      tileId: latestJournal.tile_id,
      body: latestJournal.body,
      updatedAt: latestJournal.updated_at,
    }
  : null;
```

Pass `mappedRecentActions` and `mappedLatestJournal` into `mapRunRowsToSnapshot`.

- [ ] **Step 7: Run journal and snapshot tests**

Run:

```bash
npm run test:unit -- tests/unit/api/journal-route.test.ts tests/unit/supabase/journal-schema.test.ts tests/unit/lib/runs/snapshot.test.ts tests/unit/api/runs-route.test.ts
npm run typecheck
```

Expected: both commands exit 0.

- [ ] **Step 8: Commit Task 6**

Run:

```bash
git add supabase/migrations/0003_journal_one_per_day.sql src/app/api/runs/[runId]/journal/route.ts src/lib/runs/snapshot.ts src/lib/runs/queries.ts src/app/api/runs/route.ts tests/unit/supabase/journal-schema.test.ts tests/unit/api/journal-route.test.ts tests/unit/lib/runs/snapshot.test.ts
git commit -m "feat: add journal resume context"
```

## Task 7: Play Table Shell And Action UI

**Files:**
- Modify: `src/app/play/[runId]/page.tsx`
- Create: `src/components/features/play/PlayTable.tsx`
- Create: `src/components/features/play/CurrentPrompt.tsx`
- Create: `src/components/features/play/ActionBar.tsx`
- Create: `src/components/ui/DiceResult.tsx`
- Test: `tests/unit/app/play-run-page.test.tsx`
- Test: `tests/unit/features/play/play-table.test.tsx`

- [ ] **Step 1: Write failing play table component tests**

Create `tests/unit/features/play/play-table.test.tsx`:

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlayTable } from "@/components/features/play/PlayTable";
import type { RunSnapshot } from "@/lib/game/types";

const snapshot: RunSnapshot = {
  run: { id: "run-1", title: "Field Notes", status: "active", rulesVersion: "miru1v2e", currentDay: 1, updatedAt: "now" },
  stats: { hp: 10, ep: 10, baseAtk: 1, baseDef: 1, bitliths: 0, starvationCount: 0, sleepDeprivationCount: 0, minorInjuryCount: 0 },
  currentTile: { id: "tile-1", coordinate: "E01", row: 1, column: "E", terrain: "unknown", visited: true, icons: [], eventHistory: [], repeatabilityState: {}, enemyState: null, notes: null },
  visibleTiles: [],
  inventory: [{ key: "meal-bar", name: "Meal Bar", category: "food", quantity: 3, metadata: {} }],
  techSkills: [],
  activeEnemy: null,
  pendingPrompt: { type: "ready_for_next_day", title: "Ready for the next day", body: "Begin when ready." },
  legalActions: [{ type: "next_day", label: "Next Day" }],
  recentActions: [],
  latestJournalEntry: null,
};

describe("PlayTable", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the current prompt and legal action", () => {
    render(<PlayTable initialSnapshot={snapshot} />);

    expect(screen.getByRole("heading", { name: /ready for the next day/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next day/i })).toBeInTheDocument();
    expect(screen.getByText("E01")).toBeInTheDocument();
  });

  it("disables actions while saving and renders the returned camp prompt", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          snapshot: {
            ...snapshot,
            pendingPrompt: { type: "camp_required", title: "Make camp", body: "Resolve camp.", choices: [{ key: "eat_meal_bar", label: "Eat Meal Bar" }] },
            legalActions: [{ type: "camp", label: "Camp", payload: { foodChoice: "eat_meal_bar" } }],
          },
          action: { title: "A quiet field discovery", diceRolls: [{ id: "roll-1", notation: "2d6", purpose: "terrain", values: [3, 4], total: 7 }] },
        },
      }),
    } as Response);

    render(<PlayTable initialSnapshot={snapshot} />);
    await user.click(screen.getByRole("button", { name: /next day/i }));

    expect(screen.getByRole("button", { name: /next day/i })).toBeDisabled();
    expect(await screen.findByRole("heading", { name: /make camp/i })).toBeInTheDocument();
    expect(screen.getByText(/2d6/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run play table tests and verify they fail**

Run:

```bash
npm run test:unit -- tests/unit/features/play/play-table.test.tsx
```

Expected: FAIL because `PlayTable` does not exist.

- [ ] **Step 3: Implement prompt, action, dice, and play table components**

Create `src/components/features/play/CurrentPrompt.tsx`:

```tsx
import type { ActionSummary, RunPrompt } from "@/lib/game/types";
import { Panel } from "@/components/ui/Panel";
import { DiceResult } from "@/components/ui/DiceResult";

export function CurrentPrompt({
  prompt,
  recentAction,
}: {
  prompt: RunPrompt;
  recentAction: ActionSummary | null;
}) {
  return (
    <Panel className="space-y-3">
      <div>
        <p className="font-mono text-sm text-ink-muted">Current prompt</p>
        <h2 className="font-heading text-2xl">{prompt.title}</h2>
      </div>
      <p className="text-sm text-ink-muted">{prompt.body}</p>
      {recentAction ? (
        <div className="space-y-2 border-t border-ink-border pt-3">
          <p className="text-sm font-medium">{recentAction.title}</p>
          <p className="text-sm text-ink-muted">{recentAction.body}</p>
          {recentAction.diceRolls.map((roll) => (
            <DiceResult key={roll.id} roll={roll} />
          ))}
        </div>
      ) : null}
    </Panel>
  );
}
```

Create `src/components/features/play/ActionBar.tsx`:

```tsx
import { Button } from "@/components/ui/Button";
import type { LegalAction } from "@/lib/game/types";

export function ActionBar({
  actions,
  disabled,
  onAction,
}: {
  actions: LegalAction[];
  disabled: boolean;
  onAction: (action: LegalAction) => void;
}) {
  return (
    <div className="sticky bottom-3 z-10 flex flex-wrap gap-2 rounded-md border border-ink-border bg-field-surface/95 p-2 backdrop-blur">
      {actions.map((action) => (
        <Button key={`${action.type}-${action.label}`} disabled={disabled} onClick={() => onAction(action)}>
          {disabled ? "Saving..." : action.label}
        </Button>
      ))}
    </div>
  );
}
```

Create `src/components/ui/DiceResult.tsx`:

```tsx
import type { DiceRoll } from "@/lib/game/types";

export function DiceResult({ roll }: { roll: DiceRoll }) {
  return (
    <div className="rounded border border-ink-border bg-field-surfaceMuted px-3 py-2 font-mono text-sm">
      <span className="font-semibold">{roll.notation.toUpperCase()}</span>{" "}
      <span>{roll.values.join(" + ")} = {roll.total}</span>
    </div>
  );
}
```

Create `src/components/features/play/PlayTable.tsx`:

```tsx
"use client";

import { useState } from "react";
import { ActionBar } from "@/components/features/play/ActionBar";
import { CurrentPrompt } from "@/components/features/play/CurrentPrompt";
import type { ActionSummary, LegalAction, RunSnapshot } from "@/lib/game/types";

export function PlayTable({ initialSnapshot }: { initialSnapshot: RunSnapshot }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [recentAction, setRecentAction] = useState<ActionSummary | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitAction(action: LegalAction) {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/runs/${snapshot.run.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: action.type, payload: action.payload }),
      });
      const payload = (await response.json()) as
        | { ok: true; data: { snapshot: RunSnapshot; action: ActionSummary } }
        | { ok: false; error: { message: string } };

      if (!payload.ok) {
        setError(payload.error.message);
        return;
      }

      setSnapshot(payload.data.snapshot);
      setRecentAction(payload.data.action);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <CurrentPrompt prompt={snapshot.pendingPrompt} recentAction={recentAction} />
      <div className="rounded-md border border-ink-border bg-field-surface p-3">
        <p className="font-mono text-sm text-ink-muted">Tile</p>
        <p className="text-lg font-semibold">{snapshot.currentTile.coordinate}</p>
      </div>
      {error ? <p className="rounded-md border border-status-error p-3 text-sm text-status-error">{error}</p> : null}
      <ActionBar actions={snapshot.legalActions} disabled={isSaving} onAction={(action) => void submitAction(action)} />
    </div>
  );
}
```

- [ ] **Step 4: Update play route to load `RunSnapshot`**

Modify `src/app/play/[runId]/page.tsx` to import `getRunSnapshot` and `PlayTable`, then replace the temporary prompt panels with:

```tsx
return (
  <InteriorShell
    title={snapshot.run.title}
    context={`Day ${snapshot.run.currentDay} · ${snapshot.currentTile.coordinate}`}
  >
    <PlayTable initialSnapshot={snapshot} />
  </InteriorShell>
);
```

Keep the owner-safe not found and incomplete snapshot states from the current route.

- [ ] **Step 5: Run play route and component tests**

Run:

```bash
npm run test:unit -- tests/unit/app/play-run-page.test.tsx tests/unit/features/play/play-table.test.tsx
npm run typecheck
```

Expected: both commands exit 0.

- [ ] **Step 6: Commit Task 7**

Run:

```bash
git add src/app/play/[runId]/page.tsx src/components/features/play/PlayTable.tsx src/components/features/play/CurrentPrompt.tsx src/components/features/play/ActionBar.tsx src/components/ui/DiceResult.tsx tests/unit/app/play-run-page.test.tsx tests/unit/features/play/play-table.test.tsx
git commit -m "feat: render playable run prompt"
```

## Task 8: Character, Inventory, Map, Journal UI, And Runs Resume

**Files:**
- Create: `src/components/ui/StatBadge.tsx`
- Create: `src/components/features/character/CharacterPanel.tsx`
- Create: `src/components/features/inventory/InventoryPanel.tsx`
- Create: `src/components/features/map/HexMap.tsx`
- Create: `src/components/features/map/TileInspector.tsx`
- Create: `src/components/features/play/JournalPrompt.tsx`
- Modify: `src/components/features/play/PlayTable.tsx`
- Modify: `src/app/runs/page.tsx`
- Test: `tests/unit/features/play/play-table.test.tsx`
- Test: `tests/unit/app/runs-page.test.tsx`

- [ ] **Step 1: Extend play table tests for panels and journal**

Add to `tests/unit/features/play/play-table.test.tsx`:

```tsx
it("wraps long inventory names and submits a journal entry", async () => {
  const user = userEvent.setup();
  const fetchMock = vi.mocked(fetch);
  const journalSnapshot = {
    ...snapshot,
    pendingPrompt: { type: "journal_available", title: "Write the day down", body: "Add a note.", dayNumber: 1, tileId: "tile-1" },
    legalActions: [{ type: "journal", label: "Write Journal" }],
    inventory: [
      { key: "long-item", name: "Weathered Calibration Cylinder With A Very Long Field Name", category: "key", quantity: 1, metadata: {} },
    ],
  } satisfies RunSnapshot;
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      ok: true,
      data: { id: "journal-1", body: "Camp was quiet.", dayNumber: 1, tileId: "tile-1" },
    }),
  } as Response);

  render(<PlayTable initialSnapshot={journalSnapshot} />);

  expect(screen.getByText(/weathered calibration cylinder/i)).toBeInTheDocument();
  await user.type(screen.getByLabelText(/journal entry/i), "Camp was quiet.");
  await user.click(screen.getByRole("button", { name: /save journal/i }));

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/runs/run-1/journal",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
```

- [ ] **Step 2: Run UI tests and verify they fail**

Run:

```bash
npm run test:unit -- tests/unit/features/play/play-table.test.tsx tests/unit/app/runs-page.test.tsx
```

Expected: FAIL because journal and support panels are not present.

- [ ] **Step 3: Implement stat, character, inventory, map, and tile inspector components**

Create `src/components/ui/StatBadge.tsx`:

```tsx
export function StatBadge({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="min-w-0 rounded border border-ink-border bg-field-surface px-3 py-2">
      <p className="font-mono text-xs text-ink-muted">{label}</p>
      <p className="truncate text-lg font-semibold">{value}</p>
    </div>
  );
}
```

Create `src/components/features/character/CharacterPanel.tsx`:

```tsx
import { Panel } from "@/components/ui/Panel";
import { StatBadge } from "@/components/ui/StatBadge";
import type { RunStats } from "@/lib/game/types";

export function CharacterPanel({ stats }: { stats: RunStats }) {
  return (
    <Panel className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <StatBadge label="HP" value={stats.hp} />
      <StatBadge label="EP" value={stats.ep} />
      <StatBadge label="ATK" value={stats.baseAtk} />
      <StatBadge label="DEF" value={stats.baseDef} />
      <StatBadge label="Food Risk" value={stats.starvationCount} />
      <StatBadge label="Sleep Risk" value={stats.sleepDeprivationCount} />
      <StatBadge label="Bitliths" value={stats.bitliths} />
      <StatBadge label="Injury" value={stats.minorInjuryCount} />
    </Panel>
  );
}
```

Create `src/components/features/inventory/InventoryPanel.tsx`:

```tsx
import { Panel } from "@/components/ui/Panel";
import type { InventoryItem } from "@/lib/game/types";

export function InventoryPanel({ items }: { items: InventoryItem[] }) {
  return (
    <Panel className="space-y-3">
      <h2 className="font-heading text-xl">Inventory</h2>
      <div className="grid gap-2">
        {items.map((item) => (
          <div key={item.key} className="flex min-w-0 items-start justify-between gap-3 rounded border border-ink-border bg-field-background px-3 py-2">
            <p className="min-w-0 break-words text-sm font-medium">{item.name}</p>
            <p className="shrink-0 font-mono text-sm">x{item.quantity}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
```

Create `src/components/features/map/TileInspector.tsx`:

```tsx
import { Panel } from "@/components/ui/Panel";
import type { RunTile } from "@/lib/game/types";

export function TileInspector({ tile }: { tile: RunTile | null }) {
  if (!tile) {
    return null;
  }

  return (
    <Panel className="space-y-2">
      <h2 className="font-heading text-xl">{tile.coordinate}</h2>
      <p className="text-sm text-ink-muted">Terrain: {tile.terrain}</p>
      <p className="text-sm text-ink-muted">
        {tile.visited ? "Visited" : "Unvisited"} · {tile.icons.length ? tile.icons.join(", ") : "No icons"}
      </p>
    </Panel>
  );
}
```

Create `src/components/features/map/HexMap.tsx`:

```tsx
"use client";

import { useState } from "react";
import { TileInspector } from "@/components/features/map/TileInspector";
import type { RunTile } from "@/lib/game/types";

export function HexMap({
  tiles,
  currentTileId,
}: {
  tiles: RunTile[];
  currentTileId: string;
}) {
  const [selectedTile, setSelectedTile] = useState<RunTile | null>(null);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-9 gap-1" aria-label="Run map">
        {tiles.map((tile) => (
          <button
            key={tile.coordinate}
            type="button"
            aria-label={`Inspect tile ${tile.coordinate}`}
            onClick={() => setSelectedTile(tile)}
            className={[
              "min-h-11 rounded border border-ink-border px-1 py-2 font-mono text-xs",
              tile.id === currentTileId ? "bg-signal-primary text-field-surface" : "bg-field-surface",
              tile.visited ? "font-semibold" : "text-ink-muted",
            ].join(" ")}
          >
            {tile.coordinate}
          </button>
        ))}
      </div>
      <TileInspector tile={selectedTile} />
    </div>
  );
}
```

- [ ] **Step 4: Implement journal prompt and wire panels into `PlayTable`**

Create `src/components/features/play/JournalPrompt.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";

export function JournalPrompt({
  runId,
  dayNumber,
  tileId,
  onSaved,
}: {
  runId: string;
  dayNumber: number;
  tileId: string;
  onSaved: (body: string) => void;
}) {
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    setIsSaving(true);
    const response = await fetch(`/api/runs/${runId}/journal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayNumber, tileId, body }),
    });

    if (response.ok) {
      onSaved(body);
    }

    setIsSaving(false);
  }

  return (
    <Panel className="space-y-3">
      <label className="block text-sm font-medium" htmlFor="journal-entry">
        Journal entry
      </label>
      <textarea
        id="journal-entry"
        maxLength={1000}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        className="min-h-24 w-full rounded border border-ink-border bg-field-background p-3 text-sm"
      />
      <Button disabled={isSaving || body.trim().length === 0} onClick={() => void save()}>
        {isSaving ? "Saving..." : "Save Journal"}
      </Button>
    </Panel>
  );
}
```

Modify `PlayTable` imports:

```tsx
import { CharacterPanel } from "@/components/features/character/CharacterPanel";
import { InventoryPanel } from "@/components/features/inventory/InventoryPanel";
import { HexMap } from "@/components/features/map/HexMap";
import { JournalPrompt } from "@/components/features/play/JournalPrompt";
```

Render these sections between `CurrentPrompt` and `ActionBar`:

```tsx
<CharacterPanel stats={snapshot.stats} />
<InventoryPanel items={snapshot.inventory} />
<HexMap tiles={snapshot.visibleTiles} currentTileId={snapshot.currentTile.id} />
{snapshot.pendingPrompt.type === "journal_available" ? (
  <JournalPrompt
    runId={snapshot.run.id}
    dayNumber={snapshot.pendingPrompt.dayNumber}
    tileId={snapshot.pendingPrompt.tileId}
    onSaved={(body) => {
      setSnapshot({
        ...snapshot,
        latestJournalEntry: {
          id: "local-journal-entry",
          runId: snapshot.run.id,
          dayNumber:
            snapshot.pendingPrompt.type === "journal_available"
              ? snapshot.pendingPrompt.dayNumber
              : snapshot.run.currentDay,
          tileId: snapshot.currentTile.id,
          body,
          updatedAt: new Date().toISOString(),
        },
        pendingPrompt: {
          type: "day_complete",
          title: "Day recorded",
          body: "Your notes are saved. You can begin the next day.",
        },
        legalActions: [{ type: "next_day", label: "Next Day" }],
      });
    }}
  />
) : null}
{snapshot.latestJournalEntry ? (
  <p className="rounded-md border border-ink-border bg-field-surface p-3 text-sm">
    {snapshot.latestJournalEntry.body}
  </p>
) : null}
```

- [ ] **Step 5: Update runs page resume cards**

Modify the run card body in `src/app/runs/page.tsx`:

```tsx
<Panel key={run.id} className="space-y-3">
  <div className="flex items-start justify-between gap-3">
    <div>
      <h2 className="font-heading text-xl">{run.title}</h2>
      <p className="font-mono text-sm text-ink-muted">
        {run.status} · Day {run.current_day}
      </p>
    </div>
    {run.status === "active" ? (
      <Link
        href={`/play/${run.id}`}
        className="inline-flex min-h-11 items-center rounded-md border border-transparent bg-signal-primary px-4 py-3 text-sm font-medium text-field-surface"
      >
        Resume
      </Link>
    ) : null}
  </div>
  <p className="break-words text-sm text-ink-muted">
    {run.last_journal_entry ?? "No journal entry yet."}
  </p>
  <p className="font-mono text-xs text-ink-muted">
    Updated {new Date(run.updated_at).toLocaleDateString()}
  </p>
</Panel>
```

- [ ] **Step 6: Run UI and route tests**

Run:

```bash
npm run test:unit -- tests/unit/features/play/play-table.test.tsx tests/unit/app/runs-page.test.tsx
npm run typecheck
```

Expected: both commands exit 0.

- [ ] **Step 7: Commit Task 8**

Run:

```bash
git add src/components/ui/StatBadge.tsx src/components/features/character/CharacterPanel.tsx src/components/features/inventory/InventoryPanel.tsx src/components/features/map/HexMap.tsx src/components/features/map/TileInspector.tsx src/components/features/play/JournalPrompt.tsx src/components/features/play/PlayTable.tsx src/app/runs/page.tsx tests/unit/features/play/play-table.test.tsx tests/unit/app/runs-page.test.tsx
git commit -m "feat: build phase 1 play table panels"
```

## Task 9: First-Run E2E And Final Verification

**Files:**
- Create: `tests/e2e/first-run.spec.ts`
- Modify: `docs/product-roadmap.md` after verified completion of each covered Phase 1 task

- [ ] **Step 1: Write the first-run E2E test**

Create `tests/e2e/first-run.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("first run reaches camp, journal, refresh, and resume", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Start Run" }).click();

  await expect(page).toHaveURL(/\/play\//);
  await expect(page.getByRole("heading", { name: /ready for the next day/i })).toBeVisible();

  await page.getByRole("button", { name: /next day/i }).click();
  await expect(page.getByRole("heading", { name: /make camp/i })).toBeVisible();

  await page.getByRole("button", { name: /camp/i }).click();
  await expect(page.getByLabel(/journal entry/i)).toBeVisible();

  await page.getByLabel(/journal entry/i).fill("Camp was quiet.");
  await page.getByRole("button", { name: /save journal/i }).click();
  await expect(page.getByText(/camp was quiet/i)).toBeVisible();

  await page.reload();
  await expect(page.getByText(/camp was quiet/i)).toBeVisible();

  await page.goto("/runs");
  await page.getByRole("link", { name: /resume/i }).first().click();
  await expect(page).toHaveURL(/\/play\//);
  await expect(page.getByText(/camp was quiet/i)).toBeVisible();
});
```

- [ ] **Step 2: Run E2E and record the first failure**

Run:

```bash
npm run test:e2e -- tests/e2e/first-run.spec.ts
```

Expected: FAIL if hosted Supabase env is not configured for local E2E, or FAIL on the first missing UI/API integration. Capture the exact failure line before changing code.

- [ ] **Step 3: Fix the first E2E failure only**

Use the failure output to make one targeted change. Examples of valid targeted changes:

```ts
// If the journal save succeeds but visible resume context is missing, update PlayTable state:
setSnapshot({
  ...snapshot,
  latestJournalEntry: {
    id: payload.data.id,
    runId: snapshot.run.id,
    dayNumber: payload.data.dayNumber,
    tileId: payload.data.tileId,
    body: payload.data.body,
    updatedAt: payload.data.updatedAt,
  },
});
```

```tsx
// If the Resume affordance is a button but the test expects a link, make it a link:
<Link href={`/play/${run.id}`} aria-label={`Resume ${run.title}`}>
  Resume
</Link>
```

- [ ] **Step 4: Re-run the E2E test until it passes or an environment blocker is proven**

Run after each targeted fix:

```bash
npm run test:e2e -- tests/e2e/first-run.spec.ts
```

Expected: PASS with local Supabase configuration. If the only failure is missing Supabase credentials or remote auth in the local environment, record the exact missing env key and keep all unit/type checks green.

- [ ] **Step 5: Run full verification**

Run:

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:e2e -- tests/e2e/first-run.spec.ts
```

Expected: all commands exit 0 in a configured environment. If E2E is blocked by credentials, `lint`, `typecheck`, and `test:unit` must exit 0 and the final status must name the E2E blocker.

- [ ] **Step 6: Mark completed roadmap tasks**

After verification, update `docs/product-roadmap.md` by checking off only the Phase 1 tasks that the implementation actually satisfies. For this vertical slice, expect to mark `TASK-011`, `TASK-012`, `TASK-014`, `TASK-015`, `TASK-016`, `TASK-017`, `TASK-019`, `TASK-020`, `TASK-021`, `TASK-022`, `TASK-023`, `TASK-024`, `TASK-025`, and `TASK-026` when their listed verification passes. Leave `TASK-013` or `TASK-018` unchecked if movement validation or the interactive hex inspector is narrower than the task requires.

- [ ] **Step 7: Commit Task 9**

Run:

```bash
git add tests/e2e/first-run.spec.ts docs/product-roadmap.md
git add src tests
git commit -m "test: cover first run magic moment"
```

## Self-Review Checklist

- Spec coverage: Tasks 1-3 cover pure engine contracts, dice, map, survival, curated day, and representative combat. Tasks 4-6 cover snapshot loading, actions, journal, persistence, and resume context. Tasks 7-8 cover play table, panels, map inspection surface, journal UI, and run list resume. Task 9 covers E2E and roadmap updates.
- No broad Phase 1 rules expansion: full shops, villages, quest systems, dark mode, account upgrade, and complete rules lookup are outside this plan.
- Type consistency: the plan uses `RunSnapshot`, `RunPrompt`, `LegalAction`, `GameAction`, `DiceRoll`, `ActionSummary`, and `JournalEntry` consistently across engine, API, and UI tasks.
