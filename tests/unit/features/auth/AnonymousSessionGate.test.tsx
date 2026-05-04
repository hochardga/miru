import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnonymousSessionGate } from "@/components/features/auth/AnonymousSessionGate";

const { fetchMock, getSession, push, signInAnonymously } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  getSession: vi.fn(),
  push: vi.fn(),
  signInAnonymously: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createBrowserSupabaseClient: () => ({
    auth: {
      getSession,
      signInAnonymously,
    },
  }),
}));

describe("AnonymousSessionGate", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    getSession.mockReset();
    push.mockReset();
    signInAnonymously.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates a session before starting a run", async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    signInAnonymously.mockResolvedValue({
      data: { session: { user: { id: "user-1" } } },
      error: null,
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        data: { runId: "run-1", currentTileId: "tile-1" },
      }),
    });

    const user = userEvent.setup();

    render(<AnonymousSessionGate />);
    await user.click(screen.getByRole("button", { name: /start run/i }));

    await waitFor(() => {
      expect(signInAnonymously).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/runs",
        expect.objectContaining({
          body: JSON.stringify({}),
          method: "POST",
        }),
      );
      expect(push).toHaveBeenCalledWith("/play/run-1");
    });
  });

  it("restores the latest run when a session already exists", async () => {
    getSession.mockResolvedValue({
      data: { session: { user: { id: "user-1" } } },
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          runs: [
            {
              id: "run-9",
              title: "Field Notes",
              status: "active",
              current_day: 1,
              updated_at: "2026-05-04T00:00:00.000Z",
              last_journal_entry: null,
            },
          ],
        },
      }),
    });

    const user = userEvent.setup();

    render(<AnonymousSessionGate />);

    const continueButton = await screen.findByRole("button", {
      name: /continue latest run/i,
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/runs?limit=1");

    await user.click(continueButton);

    expect(push).toHaveBeenCalledWith("/play/run-9");
  });

  it("pushes the runs route after creating a session when no latest run exists", async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    signInAnonymously.mockResolvedValue({
      data: { session: { user: { id: "user-1" } } },
      error: null,
    });

    const user = userEvent.setup();

    render(<AnonymousSessionGate />);
    await user.click(screen.getByRole("button", { name: /all runs/i }));

    await waitFor(() => {
      expect(signInAnonymously).toHaveBeenCalled();
      expect(push).toHaveBeenCalledWith("/runs");
    });
  });

  it("shows a friendly error when anonymous auth fails", async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    signInAnonymously.mockResolvedValue({
      data: { session: null },
      error: new Error("auth unavailable"),
    });

    const user = userEvent.setup();

    render(<AnonymousSessionGate />);

    const rulesButton = screen.getByRole("button", { name: /rules/i });
    await user.click(rulesButton);

    expect(
      await screen.findByText(
        /anonymous auth failed\. try again to prepare your table and save progress\./i,
      ),
    ).toBeInTheDocument();
    expect(rulesButton).toBeEnabled();
  });
});
