import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockListRuns, mockRequireUser } = vi.hoisted(() => ({
  mockListRuns: vi.fn(),
  mockRequireUser: vi.fn(),
}));

vi.mock("@/lib/runs/queries", () => ({
  listRuns: mockListRuns,
}));

vi.mock("@/lib/supabase/server", () => ({
  requireUser: mockRequireUser,
}));

import RunsPage from "@/app/runs/page";

describe("RunsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("only offers resume links for active runs", async () => {
    mockRequireUser.mockResolvedValue({
      supabase: {},
      user: { id: "user-1" },
    });
    mockListRuns.mockResolvedValue([
      {
        id: "run-1",
        title: "Open Circuit",
        status: "active",
        current_day: 4,
        updated_at: "2026-05-07T12:00:00.000Z",
        last_journal_entry: null,
      },
      {
        id: "run-2",
        title: "Victory Lap",
        status: "won",
        current_day: 12,
        updated_at: "2026-05-06T15:30:00.000Z",
        last_journal_entry: "Reached the beacon.",
      },
    ]);

    render(await RunsPage());

    expect(screen.getAllByRole("link", { name: /^resume$/i })).toHaveLength(1);
    expect(screen.getByRole("link", { name: /^resume$/i })).toHaveAttribute(
      "href",
      "/play/run-1",
    );
    expect(screen.getByText(/day 4/i)).toBeInTheDocument();
    expect(screen.getByText(/no journal entry yet/i)).toBeInTheDocument();
    expect(screen.getByText(/updated may 7, 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/status: won/i)).toBeInTheDocument();
    expect(screen.getByText(/reached the beacon/i)).toBeInTheDocument();
    expect(screen.getByText(/updated may 6, 2026/i)).toBeInTheDocument();
  });
});
