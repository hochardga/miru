import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { MIRU1V2E_MANIFEST } from "@/data/miru1v2e/manifest";
import type {
  ActionSummary,
  CoordinateColumn,
  EnemyState,
  IconType,
  RunPrompt,
  RunStatus,
  TerrainType,
} from "@/lib/game/types";

type TableName =
  | "runs"
  | "run_tiles"
  | "run_inventory"
  | "tech_skills"
  | "journal_entries"
  | "action_log";
type StoreRow = E2EStore[TableName][number] & Record<string, unknown>;

type RunRow = {
  id: string;
  user_id: string;
  title: string;
  rules_version: "miru1v2e";
  status: RunStatus;
  current_day: number;
  current_tile_id: string | null;
  hp: number;
  ep: number;
  base_atk: number;
  base_def: number;
  bitliths: number;
  starvation_count: number;
  sleep_deprivation_count: number;
  minor_injury_count: number;
  active_enemy: EnemyState | null;
  active_effects: unknown[];
  pending_prompt: RunPrompt | null;
  last_journal_entry: string | null;
  created_at: string;
  updated_at: string;
};

type RunTileRow = {
  id: string;
  run_id: string;
  user_id: string;
  row_number: number;
  column_letter: CoordinateColumn;
  terrain: TerrainType;
  visited: boolean;
  icons: IconType[];
  event_history: string[];
  repeatability_state: Record<string, unknown>;
  enemy_state: EnemyState | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type InventoryRow = {
  id: string;
  run_id: string;
  user_id: string;
  item_key: string;
  item_name: string;
  category: "food" | "key" | "reward" | "equipment" | "misc";
  quantity: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

type TechSkillRow = {
  id: string;
  run_id: string;
  user_id: string;
  skill_key: string;
  skill_name: string;
  unlocked: boolean;
  training_level: number;
  created_at: string;
  updated_at: string;
};

type JournalEntryRow = {
  id: string;
  run_id: string;
  user_id: string;
  day_number: number;
  tile_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
};

type ActionLogRow = {
  id: string;
  run_id: string;
  user_id: string;
  action_type: ActionSummary["type"];
  day_number: number;
  tile_id: string | null;
  input: Record<string, unknown>;
  result: Record<string, unknown>;
  dice_rolls: ActionSummary["diceRolls"];
  created_at: string;
};

type E2EStore = {
  runs: RunRow[];
  run_tiles: RunTileRow[];
  run_inventory: InventoryRow[];
  tech_skills: TechSkillRow[];
  journal_entries: JournalEntryRow[];
  action_log: ActionLogRow[];
  sequence: number;
};

type RpcResponse = {
  data: unknown;
  error: Error | null;
};

export function getE2EStorePath() {
  if (process.env.NEXT_PUBLIC_MIRU_DEMO_BACKEND === "true") {
    return join(tmpdir(), "miru-demo-store.json");
  }

  return join(process.cwd(), ".next", "e2e-test-store.json");
}

function emptyStore(): E2EStore {
  return {
    runs: [],
    run_tiles: [],
    run_inventory: [],
    tech_skills: [],
    journal_entries: [],
    action_log: [],
    sequence: 0,
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function loadStore(): E2EStore {
  const storePath = getE2EStorePath();

  if (!existsSync(storePath)) {
    return emptyStore();
  }

  try {
    return { ...emptyStore(), ...JSON.parse(readFileSync(storePath, "utf8")) };
  } catch {
    return emptyStore();
  }
}

function saveStore(store: E2EStore) {
  const storePath = getE2EStorePath();

  mkdirSync(dirname(storePath), { recursive: true });
  writeFileSync(storePath, JSON.stringify(store), "utf8");
}

function nextTimestamp(store: E2EStore) {
  store.sequence += 1;

  return new Date(Date.UTC(2026, 4, 7, 12, 0, 0) + store.sequence * 1000)
    .toISOString();
}

function compareValues(a: unknown, b: unknown) {
  if (a === b) {
    return 0;
  }

  if (a === null || a === undefined) {
    return -1;
  }

  if (b === null || b === undefined) {
    return 1;
  }

  return a > b ? 1 : -1;
}

function rpcError(message: string): RpcResponse {
  return {
    data: null,
    error: new Error(message),
  };
}

function findLatestActiveRun(store: E2EStore, userId: string) {
  return store.runs
    .filter((run) => run.user_id === userId && run.status === "active")
    .sort((a, b) => compareValues(b.updated_at, a.updated_at))[0];
}

function upsertStartingInventory(store: E2EStore, run: RunRow, timestamp: string) {
  const startingItem = MIRU1V2E_MANIFEST.startingInventory[0];
  const existingItem = store.run_inventory.find(
    (item) => item.run_id === run.id && item.item_key === startingItem.key,
  );

  if (existingItem) {
    existingItem.user_id = run.user_id;
    existingItem.item_name = startingItem.name;
    existingItem.category = startingItem.category;
    existingItem.quantity = Math.max(existingItem.quantity, startingItem.quantity);
    existingItem.updated_at = timestamp;
    return;
  }

  store.run_inventory.push({
    id: randomUUID(),
    run_id: run.id,
    user_id: run.user_id,
    item_key: startingItem.key,
    item_name: startingItem.name,
    category: startingItem.category,
    quantity: startingItem.quantity,
    metadata: {},
    created_at: timestamp,
    updated_at: timestamp,
  });
}

function bootstrapRun(params: Record<string, unknown>): RpcResponse {
  const userId = String(params.p_user_id);
  const store = loadStore();
  const activeRun = findLatestActiveRun(store, userId);

  if (activeRun?.current_tile_id) {
    return {
      data: {
        run_id: activeRun.id,
        current_tile_id: activeRun.current_tile_id,
      },
      error: null,
    };
  }

  const createdAt = nextTimestamp(store);
  const title = String(params.p_title ?? "").trim() || "Miru Run";
  const run =
    activeRun ??
    ({
      id: randomUUID(),
      user_id: userId,
      title,
      rules_version: "miru1v2e",
      status: "active",
      current_day: 1,
      current_tile_id: null,
      hp: MIRU1V2E_MANIFEST.startingStats.hp,
      ep: MIRU1V2E_MANIFEST.startingStats.ep,
      base_atk: MIRU1V2E_MANIFEST.startingStats.baseAtk,
      base_def: MIRU1V2E_MANIFEST.startingStats.baseDef,
      bitliths: MIRU1V2E_MANIFEST.startingStats.bitliths,
      starvation_count: MIRU1V2E_MANIFEST.startingStats.starvationCount,
      sleep_deprivation_count:
        MIRU1V2E_MANIFEST.startingStats.sleepDeprivationCount,
      minor_injury_count: MIRU1V2E_MANIFEST.startingStats.minorInjuryCount,
      active_enemy: null,
      active_effects: [],
      pending_prompt: null,
      last_journal_entry: null,
      created_at: createdAt,
      updated_at: createdAt,
    } satisfies RunRow);

  if (!activeRun) {
    store.runs.push(run);
  }

  const startingColumn = String(params.p_starting_column ?? "E") as CoordinateColumn;
  const existingTile = store.run_tiles
    .filter((tile) => tile.run_id === run.id && tile.row_number === 1)
    .sort((a, b) => compareValues(b.updated_at, a.updated_at))[0];
  const tile =
    existingTile ??
    ({
      id: randomUUID(),
      run_id: run.id,
      user_id: userId,
      row_number: 1,
      column_letter: startingColumn,
      terrain: "unknown",
      visited: true,
      icons: [],
      event_history: [],
      repeatability_state: {},
      enemy_state: null,
      notes: null,
      created_at: createdAt,
      updated_at: createdAt,
    } satisfies RunTileRow);

  if (!existingTile) {
    store.run_tiles.push(tile);
  }

  const updatedAt = nextTimestamp(store);
  tile.visited = true;
  tile.updated_at = updatedAt;
  run.current_tile_id = tile.id;
  run.updated_at = updatedAt;

  upsertStartingInventory(store, run, updatedAt);

  if (
    !store.action_log.some(
      (action) => action.run_id === run.id && action.action_type === "start_run",
    )
  ) {
    store.action_log.push({
      id: randomUUID(),
      run_id: run.id,
      user_id: userId,
      action_type: "start_run",
      day_number: 1,
      tile_id: tile.id,
      input: {
        title: params.p_title ?? null,
        startingColumn,
      },
      result: {
        title: "Run started",
        body: "Your field table is ready.",
      },
      dice_rolls: [],
      created_at: nextTimestamp(store),
    });
  }

  saveStore(store);

  return {
    data: {
      run_id: run.id,
      current_tile_id: tile.id,
    },
    error: null,
  };
}

function persistRunActionResult(params: Record<string, unknown>): RpcResponse {
  const store = loadStore();
  const userId = String(params.p_user_id);
  const runId = String(params.p_run_id);
  const run = store.runs.find(
    (candidate) => candidate.id === runId && candidate.user_id === userId,
  );

  if (!run) {
    return rpcError("RUN_NOT_FOUND");
  }

  if (run.updated_at !== params.p_expected_updated_at) {
    return rpcError("STALE_RUN_ACTION");
  }

  const tileId = String(params.p_current_tile_id);
  const tile = store.run_tiles.find(
    (candidate) =>
      candidate.id === tileId &&
      candidate.run_id === runId &&
      candidate.user_id === userId,
  );

  if (!tile) {
    return rpcError("RUN_TILE_NOT_FOUND");
  }

  const updatedAt = nextTimestamp(store);
  run.current_tile_id = tileId;
  run.current_day = Number(params.p_current_day);
  run.hp = Number(params.p_hp);
  run.ep = Number(params.p_ep);
  run.base_atk = Number(params.p_base_atk);
  run.base_def = Number(params.p_base_def);
  run.bitliths = Number(params.p_bitliths);
  run.starvation_count = Number(params.p_starvation_count);
  run.sleep_deprivation_count = Number(params.p_sleep_deprivation_count);
  run.minor_injury_count = Number(params.p_minor_injury_count);
  run.active_enemy = (params.p_active_enemy as EnemyState | null) ?? null;
  run.pending_prompt = (params.p_pending_prompt as RunPrompt | null) ?? null;
  run.updated_at = updatedAt;

  tile.terrain = params.p_terrain as TerrainType;
  tile.visited = Boolean(params.p_visited);
  tile.event_history = (params.p_event_history as string[] | null) ?? [];
  tile.repeatability_state =
    (params.p_repeatability_state as Record<string, unknown> | null) ?? {};
  tile.enemy_state = (params.p_enemy_state as EnemyState | null) ?? null;
  tile.notes = (params.p_notes as string | null) ?? null;
  tile.updated_at = updatedAt;

  const inventoryPayload =
    (params.p_inventory as Array<{
      item_key: string;
      item_name: string;
      category: InventoryRow["category"];
      quantity: number;
      metadata: Record<string, unknown>;
    }> | null) ?? [];

  for (const item of inventoryPayload) {
    const existingItem = store.run_inventory.find(
      (candidate) => candidate.run_id === runId && candidate.item_key === item.item_key,
    );

    if (existingItem) {
      existingItem.user_id = userId;
      existingItem.item_name = item.item_name;
      existingItem.category = item.category;
      existingItem.quantity = item.quantity;
      existingItem.metadata = item.metadata ?? {};
      existingItem.updated_at = updatedAt;
      continue;
    }

    store.run_inventory.push({
      id: randomUUID(),
      run_id: runId,
      user_id: userId,
      item_key: item.item_key,
      item_name: item.item_name,
      category: item.category,
      quantity: item.quantity,
      metadata: item.metadata ?? {},
      created_at: updatedAt,
      updated_at: updatedAt,
    });
  }

  const actionId = randomUUID();
  const actionCreatedAt = nextTimestamp(store);

  store.action_log.push({
    id: actionId,
    run_id: runId,
    user_id: userId,
    action_type: params.p_action_type as ActionSummary["type"],
    day_number: Number(params.p_day_number),
    tile_id: (params.p_tile_id as string | null) ?? null,
    input: (params.p_action_input as Record<string, unknown> | null) ?? {},
    result: (params.p_action_result as Record<string, unknown> | null) ?? {},
    dice_rolls: params.p_dice_rolls as ActionSummary["diceRolls"],
    created_at: actionCreatedAt,
  });

  saveStore(store);

  return {
    data: {
      id: actionId,
      created_at: actionCreatedAt,
    },
    error: null,
  };
}

function persistJournalEntry(params: Record<string, unknown>): RpcResponse {
  const store = loadStore();
  const userId = String(params.p_user_id);
  const runId = String(params.p_run_id);
  const run = store.runs.find(
    (candidate) => candidate.id === runId && candidate.user_id === userId,
  );

  if (!run) {
    return rpcError("RUN_NOT_FOUND");
  }

  const prompt = run.pending_prompt;

  if (prompt?.type !== "journal_available") {
    return rpcError("INVALID_JOURNAL_STATE");
  }

  const dayNumber = Number(params.p_day_number);

  if (prompt.dayNumber !== dayNumber) {
    return rpcError("INVALID_JOURNAL_STATE");
  }

  const tileId = String(params.p_tile_id ?? prompt.tileId);

  if (tileId !== prompt.tileId) {
    return rpcError("INVALID_JOURNAL_STATE");
  }

  const tile = store.run_tiles.find(
    (candidate) =>
      candidate.id === tileId &&
      candidate.run_id === runId &&
      candidate.user_id === userId,
  );

  if (!tile) {
    return rpcError("RUN_TILE_NOT_FOUND");
  }

  const body = String(params.p_body);
  const updatedAt = nextTimestamp(store);
  let journal = store.journal_entries.find(
    (candidate) => candidate.run_id === runId && candidate.day_number === dayNumber,
  );

  if (journal) {
    journal.user_id = userId;
    journal.tile_id = tileId;
    journal.body = body;
    journal.updated_at = updatedAt;
  } else {
    journal = {
      id: randomUUID(),
      run_id: runId,
      user_id: userId,
      day_number: dayNumber,
      tile_id: tileId,
      body,
      created_at: updatedAt,
      updated_at: updatedAt,
    };
    store.journal_entries.push(journal);
  }

  run.last_journal_entry = body;
  run.pending_prompt = {
    type: "day_complete",
    title: "Day recorded",
    body: "Your notes are saved. You can begin the next day.",
  };
  run.updated_at = updatedAt;

  saveStore(store);

  return {
    data: {
      id: journal.id,
      run_id: journal.run_id,
      day_number: journal.day_number,
      tile_id: journal.tile_id,
      body: journal.body,
      updated_at: journal.updated_at,
    },
    error: null,
  };
}

class E2EQueryBuilder {
  private filters: Array<{ column: string; value: unknown }> = [];
  private orders: Array<{ column: string; ascending: boolean }> = [];
  private limitCount: number | null = null;
  private selectedColumns: string[] | null = null;

  constructor(private readonly table: TableName) {}

  select(columns = "*") {
    const trimmedColumns = columns.trim();

    this.selectedColumns =
      trimmedColumns === "*"
        ? null
        : trimmedColumns.split(",").map((column) => column.trim());

    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: options?.ascending ?? true });
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  async maybeSingle() {
    const rows = this.executeRows();

    return {
      data: rows[0] ?? null,
      error: null,
    };
  }

  then<TResult1 = { data: StoreRow[]; error: null }, TResult2 = never>(
    onFulfilled?:
      | ((value: { data: StoreRow[]; error: null }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onRejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return Promise.resolve({
      data: this.executeRows(),
      error: null,
    }).then(onFulfilled, onRejected);
  }

  private executeRows() {
    const store = loadStore();
    let rows = [...(store[this.table] as StoreRow[])];

    for (const filter of this.filters) {
      rows = rows.filter((row) => row[filter.column] === filter.value);
    }

    if (this.orders.length > 0) {
      rows.sort((a, b) => {
        for (const order of this.orders) {
          const comparison = compareValues(a[order.column], b[order.column]);

          if (comparison !== 0) {
            return order.ascending ? comparison : -comparison;
          }
        }

        return 0;
      });
    }

    if (this.limitCount !== null) {
      rows = rows.slice(0, this.limitCount);
    }

    const projectedRows = this.selectedColumns
      ? rows.map((row) =>
          Object.fromEntries(
            this.selectedColumns!.map((column) => [column, row[column]]),
          ) as StoreRow,
        )
      : rows;

    return clone(projectedRows);
  }
}

export function createE2ETestSupabaseClient() {
  return {
    from(table: TableName) {
      return new E2EQueryBuilder(table);
    },
    async rpc(name: string, params: Record<string, unknown>) {
      if (name === "bootstrap_run") {
        return bootstrapRun(params);
      }

      if (name === "persist_run_action_result") {
        return persistRunActionResult(params);
      }

      if (name === "persist_journal_entry") {
        return persistJournalEntry(params);
      }

      return rpcError(`Unsupported E2E RPC: ${name}`);
    },
  };
}
