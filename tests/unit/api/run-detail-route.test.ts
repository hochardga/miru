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
    mockGetRouteUser.mockResolvedValue({
      supabase: {},
      user: { id: "user-1" },
    });
    mockGetRunSnapshot.mockResolvedValue({
      run: {
        id: "run-1",
        title: "Field Notes",
        status: "active",
        rulesVersion: "miru1v2e",
        currentDay: 1,
        updatedAt: "now",
      },
    });

    const { GET } = await import("@/app/api/runs/[runId]/route");
    const response = await GET(new Request("http://localhost/api/runs/run-1"), {
      params: Promise.resolve({ runId: "run-1" }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        run: {
          id: "run-1",
          title: "Field Notes",
          status: "active",
          rulesVersion: "miru1v2e",
          currentDay: 1,
          updatedAt: "now",
        },
      },
    });
  });

  it("returns an owner-safe 404 when no snapshot is found", async () => {
    mockGetRouteUser.mockResolvedValue({
      supabase: {},
      user: { id: "user-1" },
    });
    mockGetRunSnapshot.mockResolvedValue(null);

    const { GET } = await import("@/app/api/runs/[runId]/route");
    const response = await GET(new Request("http://localhost/api/runs/run-2"), {
      params: Promise.resolve({ runId: "run-2" }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "RUN_NOT_FOUND",
        message: "That run could not be found for this session.",
      },
    });
  });
});
