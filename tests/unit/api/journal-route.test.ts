import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetRouteUser } = vi.hoisted(() => ({
  mockGetRouteUser: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  getRouteUser: mockGetRouteUser,
}));

const runId = "33333333-3333-4333-8333-333333333333";
const currentTileId = "11111111-1111-4111-8111-111111111111";
const explicitTileId = "22222222-2222-4222-8222-222222222222";

function createSupabaseMock({
  rpcResult = {
    data: {
      id: "journal-1",
      run_id: runId,
      day_number: 3,
      tile_id: currentTileId,
      body: "The rain finally stopped.",
      updated_at: "2026-05-07T12:00:00.000Z",
    },
    error: null,
  },
}: {
  rpcResult?: { data: unknown; error: unknown };
} = {}) {
  return {
    rpc: vi.fn(async () => rpcResult),
  };
}

async function postJournal({
  body = { dayNumber: 3, body: "  The rain finally stopped.  " },
  routeRunId = runId,
}: {
  body?: unknown;
  routeRunId?: string;
} = {}) {
  const { POST } = await import("@/app/api/runs/[runId]/journal/route");

  return POST(
    new Request(`http://localhost/api/runs/${routeRunId}/journal`, {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
    { params: Promise.resolve({ runId: routeRunId }) },
  );
}

describe("/api/runs/[runId]/journal", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("persists a journal entry through the transactional RPC", async () => {
    const supabase = createSupabaseMock();
    mockGetRouteUser.mockResolvedValue({ supabase, user: { id: "user-1" } });

    const response = await postJournal();

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        id: "journal-1",
        runId,
        dayNumber: 3,
        tileId: currentTileId,
        body: "The rain finally stopped.",
        updatedAt: "2026-05-07T12:00:00.000Z",
      },
    });
    expect(supabase.rpc).toHaveBeenCalledWith("persist_journal_entry", {
      p_user_id: "user-1",
      p_run_id: runId,
      p_day_number: 3,
      p_tile_id: null,
      p_body: "The rain finally stopped.",
    });
  });

  it("passes an explicit tile id to the RPC for prompt-safe validation", async () => {
    const supabase = createSupabaseMock({
      rpcResult: {
        data: {
          id: "journal-2",
          run_id: runId,
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
      body: {
        dayNumber: 3,
        tileId: explicitTileId,
        body: "The village gate was closed.",
      },
    });

    expect(response.status).toBe(201);
    expect(supabase.rpc).toHaveBeenCalledWith(
      "persist_journal_entry",
      expect.objectContaining({ p_tile_id: explicitTileId }),
    );
  });

  it("returns 400 with INVALID_JOURNAL_ENTRY when JSON is malformed", async () => {
    const supabase = createSupabaseMock();
    mockGetRouteUser.mockResolvedValue({ supabase, user: { id: "user-1" } });

    const response = await postJournal({ body: "{" });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "INVALID_JOURNAL_ENTRY",
        message: "Invalid journal entry payload.",
      },
    });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("returns 400 with INVALID_JOURNAL_ENTRY when the body is too long", async () => {
    const supabase = createSupabaseMock();
    mockGetRouteUser.mockResolvedValue({ supabase, user: { id: "user-1" } });

    const response = await postJournal({
      body: { dayNumber: 3, body: "x".repeat(1001) },
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "INVALID_JOURNAL_ENTRY",
        message: "Invalid journal entry payload.",
      },
    });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("returns 401 when no user session exists", async () => {
    const supabase = createSupabaseMock();
    mockGetRouteUser.mockResolvedValue({ supabase, user: null });

    const response = await postJournal();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Start from the home screen to create or restore your Miru session.",
      },
    });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("returns 404 without calling the RPC when the run id is not a UUID", async () => {
    const supabase = createSupabaseMock();
    mockGetRouteUser.mockResolvedValue({ supabase, user: { id: "user-1" } });

    const response = await postJournal({ routeRunId: "run-1" });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "RUN_NOT_FOUND",
        message: "That run could not be found for this session.",
      },
    });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("maps RUN_NOT_FOUND from the RPC to an owner-safe 404", async () => {
    const supabase = createSupabaseMock({
      rpcResult: { data: null, error: new Error("RUN_NOT_FOUND") },
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
  });

  it("maps RUN_TILE_NOT_FOUND from the RPC to a 404", async () => {
    const supabase = createSupabaseMock({
      rpcResult: { data: null, error: new Error("RUN_TILE_NOT_FOUND") },
    });
    mockGetRouteUser.mockResolvedValue({ supabase, user: { id: "user-1" } });

    const response = await postJournal({
      body: { dayNumber: 3, tileId: explicitTileId, body: "Wrong square." },
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "RUN_TILE_NOT_FOUND",
        message: "That tile could not be found for this run.",
      },
    });
  });

  it.each([
    "non-journal prompt",
    "day mismatch",
    "tile mismatch",
    "stale prompt state",
  ])("maps INVALID_JOURNAL_STATE from the RPC for %s", async () => {
    const supabase = createSupabaseMock({
      rpcResult: { data: null, error: new Error("INVALID_JOURNAL_STATE") },
    });
    mockGetRouteUser.mockResolvedValue({ supabase, user: { id: "user-1" } });

    const response = await postJournal();

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "INVALID_JOURNAL_STATE",
        message: "That journal prompt is no longer active for this run.",
      },
    });
    expect(supabase.rpc).toHaveBeenCalledTimes(1);
  });
});
