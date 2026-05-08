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

  it("returns 400 when the action payload is invalid", async () => {
    mockGetRouteUser.mockResolvedValue({ supabase: {}, user: { id: "user-1" } });

    const { POST } = await import("@/app/api/runs/[runId]/actions/route");
    const response = await POST(
      new Request("http://localhost/api/runs/run-1/actions", {
        method: "POST",
        body: JSON.stringify({ type: "camp" }),
      }),
      { params: Promise.resolve({ runId: "run-1" }) },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "BAD_REQUEST",
        message: "Invalid run action payload.",
      },
    });
    expect(mockApplyRunAction).not.toHaveBeenCalled();
  });

  it("returns 401 when no user session exists", async () => {
    mockGetRouteUser.mockResolvedValue({ supabase: {}, user: null });

    const { POST } = await import("@/app/api/runs/[runId]/actions/route");
    const response = await POST(
      new Request("http://localhost/api/runs/run-1/actions", {
        method: "POST",
        body: JSON.stringify({ type: "next_day" }),
      }),
      { params: Promise.resolve({ runId: "run-1" }) },
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Start from the home screen to create or restore your Miru session.",
      },
    });
    expect(mockApplyRunAction).not.toHaveBeenCalled();
  });

  it("returns 404 when the run is not found for the owner", async () => {
    mockGetRouteUser.mockResolvedValue({ supabase: {}, user: { id: "user-1" } });
    mockApplyRunAction.mockResolvedValue(null);

    const { POST } = await import("@/app/api/runs/[runId]/actions/route");
    const response = await POST(
      new Request("http://localhost/api/runs/run-1/actions", {
        method: "POST",
        body: JSON.stringify({ type: "next_day" }),
      }),
      { params: Promise.resolve({ runId: "run-1" }) },
    );

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
