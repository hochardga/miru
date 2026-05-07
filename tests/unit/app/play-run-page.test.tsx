import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RunSnapshot } from "@/lib/game/types";

const { mockGetRunSnapshot, mockRequireUser } = vi.hoisted(() => ({
  mockGetRunSnapshot: vi.fn(),
  mockRequireUser: vi.fn(),
}));

vi.mock("@/lib/runs/snapshot", () => ({
  getRunSnapshot: mockGetRunSnapshot,
}));

vi.mock("@/lib/supabase/server", () => ({
  requireUser: mockRequireUser,
}));

import PlayRunPage from "@/app/play/[runId]/page";

const snapshot: RunSnapshot = {
  run: {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Field Notes",
    status: "active",
    rulesVersion: "miru1v2e",
    currentDay: 2,
    updatedAt: "2026-05-07T12:00:00.000Z",
  },
  stats: {
    hp: 10,
    ep: 8,
    baseAtk: 2,
    baseDef: 1,
    bitliths: 4,
    starvationCount: 0,
    sleepDeprivationCount: 0,
    minorInjuryCount: 0,
  },
  currentTile: {
    id: "22222222-2222-4222-8222-222222222222",
    coordinate: "B03",
    row: 3,
    column: "B",
    terrain: "forest",
    visited: true,
    icons: ["village"],
    eventHistory: [],
    repeatabilityState: {},
    enemyState: null,
    notes: null,
  },
  visibleTiles: [],
  inventory: [],
  techSkills: [],
  activeEnemy: null,
  pendingPrompt: {
    type: "camp_required",
    title: "Camp before nightfall",
    body: "Choose how to spend the evening.",
    choices: [{ key: "eat_meal_bar", label: "Eat Meal Bar" }],
  },
  legalActions: [
    {
      type: "camp",
      label: "Camp",
      payload: { foodChoice: "eat_meal_bar" },
    },
  ],
  recentActions: [],
  latestJournalEntry: null,
};

describe("PlayRunPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the real play prompt from the run snapshot", async () => {
    mockRequireUser.mockResolvedValue({
      supabase: {},
      user: { id: "user-1" },
    });
    mockGetRunSnapshot.mockResolvedValue(snapshot);

    render(
      await PlayRunPage({
        params: Promise.resolve({ runId: snapshot.run.id }),
      }),
    );

    expect(mockGetRunSnapshot).toHaveBeenCalledWith(
      {},
      "user-1",
      snapshot.run.id,
    );
    expect(screen.getAllByText(/day 2/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/b03/i).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", { name: /camp before nightfall/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /camp/i })).toBeInTheDocument();
  });

  it("preserves the missing run state", async () => {
    mockRequireUser.mockResolvedValue({
      supabase: {},
      user: { id: "user-1" },
    });
    mockGetRunSnapshot.mockResolvedValue(null);

    render(
      await PlayRunPage({
        params: Promise.resolve({ runId: "missing-run" }),
      }),
    );

    expect(screen.getByText(/run unavailable/i)).toBeInTheDocument();
    expect(
      screen.getByText(/that run could not be found for this session/i),
    ).toBeInTheDocument();
  });

  it("preserves the incomplete snapshot state", async () => {
    const incompleteSnapshotError = new Error(
      "Current tile could not be loaded.",
    );

    incompleteSnapshotError.name = "RunSnapshotIncompleteError";

    mockRequireUser.mockResolvedValue({
      supabase: {},
      user: { id: "user-1" },
    });
    mockGetRunSnapshot.mockRejectedValue(incompleteSnapshotError);

    render(
      await PlayRunPage({
        params: Promise.resolve({ runId: "run-1" }),
      }),
    );

    expect(screen.getByText(/run snapshot incomplete/i)).toBeInTheDocument();
    expect(
      screen.getByText(/this run exists, but its saved snapshot is incomplete/i),
    ).toBeInTheDocument();
  });
});
