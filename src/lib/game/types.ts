export const COORDINATE_COLUMNS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"] as const;
export const TERRAIN_TYPES = [
  "unknown",
  "forest",
  "mountains",
  "grasslands",
  "desert",
  "swamp",
  "impassable",
] as const;
export const ICON_TYPES = ["village", "enemy", "quest", "treasure", "impassable"] as const;

export type CoordinateColumn = (typeof COORDINATE_COLUMNS)[number];
export type CoordinateRow = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type CoordinateId =
  `${CoordinateColumn}${"01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12"}`;
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
