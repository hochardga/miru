import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetRouteUser } = vi.hoisted(() => ({
  mockGetRouteUser: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  getRouteUser: mockGetRouteUser,
}));

const currentTileId = "11111111-1111-4111-8111-111111111111";
const explicitTileId = "22222222-2222-4222-8222-222222222222";

function createQueryResult<T>(result: T) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    upsert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => result),
    single: vi.fn(async () => result),
  };

  return builder;
}

function createSupabaseMock({
  runResult = {
    data: {
      id: "run-1",
      current_day: 3,
      current_tile_id: currentTileId,
      pending_prompt: {
        type: "journal_available",
        title: "Write the day down",
        body: "Add a short note before moving on.",
        dayNumber: 3,
        tileId: currentTileId,
      },
    },
    error: null,
  },
  tileResult = { data: { id: explicitTileId }, error: null },
  journalResult = {
    data: {
      id: "journal-1",
      run_id: "run-1",
      day_number: 3,
      tile_id: currentTileId,
      body: "The rain finally stopped.",
      updated_at: "2026-05-07T12:00:00.000Z",
    },
    error: null,
  },
  runUpdateResult = { data: null, error: null },
}: {
  runResult?: { data: unknown; error: unknown };
  tileResult?: { data: unknown; error: unknown };
  journalResult?: { data: unknown; error: unknown };
  runUpdateResult?: { data: unknown; error: unknown };
} = {}) {
  const runSelect = createQueryResult(runResult);
  const tileSelect = createQueryResult(tileResult);
  const journalUpsert = createQueryResult(journalResult);
  const runUpdate = createQueryResult(runUpdateResult);
  const runsFrom = vi.fn(() => (runsFrom.mock.calls.length === 1 ? runSelect : runUpdate));

  const supabase = {
    from: vi.fn((table: string) => {
      if (table === "runs") {
        return runsFrom();
      }

      if (table === "run_tiles") {
        return tileSelect;
      }

      if (table === "journal_entries") {
        return journalUpsert;
      }

      throw new Error(`Unexpected table ${table}`);
    }),
  };

  return { supabase, runSelect, tileSelect, journalUpsert, runUpdate };
}

async function postJournal(body: unknown = { dayNumber: 3, body: "The rain finally stopped." }) {
  const { POST } = await import("@/app/api/runs/[runId]/journal/route");

  return POST(
    new Request("http://localhost/api/runs/run-1/journal", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
    { params: Promise.resolve({ runId: "run-1" }) },
  );
}

describe("/api/runs/[runId]/journal", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("upserts a journal entry for the owner and advances the resume prompt", async () => {
    const { supabase, runSelect, journalUpsert, runUpdate } = createSupabaseMock();
    mockGetRouteUser.mockResolvedValue({ supabase, user: { id: "user-1" } });

    const response = await postJournal();

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        id: "journal-1",
        runId: "run-1",
        dayNumber: 3,
        tileId: currentTileId,
        body: "The rain finally stopped.",
        updatedAt: "2026-05-07T12:00:00.000Z",
      },
    });
    expect(runSelect.select).toHaveBeenCalledWith(
      "id,current_day,current_tile_id,pending_prompt",
    );
    expect(runSelect.eq).toHaveBeenCalledWith("id", "run-1");
    expect(runSelect.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(journalUpsert.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        run_id: "run-1",
        user_id: "user-1",
        day_number: 3,
        tile_id: currentTileId,
        body: "The rain finally stopped.",
      }),
      { onConflict: "run_id,day_number" },
    );
    expect(runUpdate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        last_journal_entry: "The rain finally stopped.",
        pending_prompt: {
          type: "day_complete",
          title: "Day recorded",
          body: "Your notes are saved. You can begin the next day.",
        },
      }),
    );
  });

  it("uses the current tile when tileId is omitted", async () => {
    const { supabase, tileSelect, journalUpsert } = createSupabaseMock();
    mockGetRouteUser.mockResolvedValue({ supabase, user: { id: "user-1" } });

    const response = await postJournal({ dayNumber: 3, body: "No landmark today." });

    expect(response.status).toBe(201);
    expect(tileSelect.maybeSingle).not.toHaveBeenCalled();
    expect(journalUpsert.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ tile_id: currentTileId }),
      expect.any(Object),
    );
  });

  it("verifies an explicit tile belongs to the same run and user", async () => {
    const { supabase, tileSelect, journalUpsert } = createSupabaseMock({
      journalResult: {
        data: {
          id: "journal-2",
          run_id: "run-1",
          day_number: 3,
          tile_id: explicitTileId,
          body: "The village gate was closed.",
          updated_at: "2026-05-07T12:00:00.000Z",
        },
        error: null,
      },
    });
    mockGetRouteUser.mockResolvedValue({ supabase, user: { id: "user-1" } });

    const response = await postJournal({
      dayNumber: 3,
      tileId: explicitTileId,
      body: "The village gate was closed.",
    });

    expect(response.status).toBe(201);
    expect(tileSelect.eq).toHaveBeenCalledWith("id", explicitTileId);
    expect(tileSelect.eq).toHaveBeenCalledWith("run_id", "run-1");
    expect(tileSelect.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(journalUpsert.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ tile_id: explicitTileId }),
      expect.any(Object),
    );
  });

  it("returns 400 with INVALID_JOURNAL_ENTRY when JSON is malformed", async () => {
    mockGetRouteUser.mockResolvedValue({
      supabase: createSupabaseMock().supabase,
      user: { id: "user-1" },
    });

    const response = await postJournal("{");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "INVALID_JOURNAL_ENTRY",
        message: "Invalid journal entry payload.",
      },
    });
  });

  it("returns 400 with INVALID_JOURNAL_ENTRY when the body is too long", async () => {
    const { supabase, journalUpsert } = createSupabaseMock();
    mockGetRouteUser.mockResolvedValue({ supabase, user: { id: "user-1" } });

    const response = await postJournal({ dayNumber: 3, body: "x".repeat(1001) });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "INVALID_JOURNAL_ENTRY",
        message: "Invalid journal entry payload.",
      },
    });
    expect(journalUpsert.upsert).not.toHaveBeenCalled();
  });

  it("returns 401 when no user session exists", async () => {
    mockGetRouteUser.mockResolvedValue({ supabase: {}, user: null });

    const response = await postJournal();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Start from the home screen to create or restore your Miru session.",
      },
    });
  });

  it("returns 404 when the run is not found for the owner", async () => {
    const { supabase, journalUpsert } = createSupabaseMock({
      runResult: { data: null, error: null },
    });
    mockGetRouteUser.mockResolvedValue({ supabase, user: { id: "user-1" } });

    const response = await postJournal();

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "RUN_NOT_FOUND",
        message: "That run could not be found for this session.",
      },
    });
    expect(journalUpsert.upsert).not.toHaveBeenCalled();
  });

  it("returns 404 when an explicit tile is outside the owner run", async () => {
    const { supabase, journalUpsert } = createSupabaseMock({
      tileResult: { data: null, error: null },
    });
    mockGetRouteUser.mockResolvedValue({ supabase, user: { id: "user-1" } });

    const response = await postJournal({
      dayNumber: 3,
      tileId: explicitTileId,
      body: "The wrong map square.",
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "RUN_TILE_NOT_FOUND",
        message: "That tile could not be found for this run.",
      },
    });
    expect(journalUpsert.upsert).not.toHaveBeenCalled();
  });
});
