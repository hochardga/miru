import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockBootstrapRun, mockListRuns, mockGetRouteUser } = vi.hoisted(() => ({
  mockBootstrapRun: vi.fn(),
  mockListRuns: vi.fn(),
  mockGetRouteUser: vi.fn(),
}));

vi.mock("@/lib/runs/bootstrap", () => ({
  bootstrapRun: mockBootstrapRun,
}));

vi.mock("@/lib/runs/queries", () => ({
  listRuns: mockListRuns,
}));

vi.mock("@/lib/supabase/server", () => ({
  getRouteUser: mockGetRouteUser,
}));

describe("/api/runs", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns 201 from POST when an authenticated user starts a run", async () => {
    const supabase = {};

    mockGetRouteUser.mockResolvedValue({
      supabase,
      user: { id: "user-1" },
    });
    mockBootstrapRun.mockResolvedValue({
      runId: "run-1",
      currentTileId: "tile-1",
    });

    const { POST } = await import("@/app/api/runs/route");
    const response = await POST(
      new Request("http://localhost/api/runs", {
        method: "POST",
        body: JSON.stringify({ title: "Field Notes" }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        runId: "run-1",
        currentTileId: "tile-1",
      },
    });
    expect(mockBootstrapRun).toHaveBeenCalledWith({
      supabase,
      userId: "user-1",
      input: { title: "Field Notes" },
    });
  });

  it("returns runs from GET when an authenticated user has a session", async () => {
    const supabase = {};

    mockGetRouteUser.mockResolvedValue({
      supabase,
      user: { id: "user-1" },
    });
    mockListRuns.mockResolvedValue([
      {
        id: "run-1",
        title: "Field Notes",
        status: "active",
        current_day: 1,
        updated_at: "2026-05-04T00:00:00.000Z",
        last_journal_entry: null,
      },
    ]);

    const { GET } = await import("@/app/api/runs/route");
    const response = await GET(
      new Request("http://localhost/api/runs?limit=10"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        runs: [
          {
            id: "run-1",
            title: "Field Notes",
            status: "active",
            current_day: 1,
            updated_at: "2026-05-04T00:00:00.000Z",
            last_journal_entry: null,
          },
        ],
      },
    });
    expect(mockListRuns).toHaveBeenCalledWith(supabase, "user-1", 10);
  });

  it("returns 401 from GET when no user session exists", async () => {
    mockGetRouteUser.mockResolvedValue({
      supabase: {},
      user: null,
    });

    const { GET } = await import("@/app/api/runs/route");
    const response = await GET(
      new Request("http://localhost/api/runs?limit=5"),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Start from the home screen to create or restore your Miru session.",
      },
    });
  });
});
