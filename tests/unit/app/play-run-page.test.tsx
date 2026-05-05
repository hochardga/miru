import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetRunShell, mockRequireUser } = vi.hoisted(() => ({
  mockGetRunShell: vi.fn(),
  mockRequireUser: vi.fn(),
}));

vi.mock("@/lib/runs/queries", () => ({
  getRunShell: mockGetRunShell,
}));

vi.mock("@/lib/supabase/server", () => ({
  requireUser: mockRequireUser,
}));

import PlayRunPage from "@/app/play/[runId]/page";

describe("PlayRunPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a distinct incomplete-shell state when the run exists but shell data is missing", async () => {
    const incompleteShellError = new Error(
      "The run is missing shell data needed for the play route.",
    );

    incompleteShellError.name = "RunShellIncompleteError";

    mockRequireUser.mockResolvedValue({
      supabase: {},
      user: { id: "user-1" },
    });
    mockGetRunShell.mockRejectedValue(incompleteShellError);

    render(
      await PlayRunPage({
        params: Promise.resolve({ runId: "run-1" }),
      }),
    );

    expect(
      screen.getByText(/run shell incomplete/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /this run exists, but its saved shell is incomplete for this session\./i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/that run could not be found for this session\./i),
    ).not.toBeInTheDocument();
  });

  it("keeps the current prompt panel on the placeholder copy only", async () => {
    mockRequireUser.mockResolvedValue({
      supabase: {},
      user: { id: "user-1" },
    });
    mockGetRunShell.mockResolvedValue({
      title: "Field Notes",
      current_day: 2,
      tile: {
        column_letter: "B",
        row_number: 3,
      },
      hp: 10,
      ep: 8,
      mealBars: 4,
      pending_prompt: {
        prompt: "Hidden prompt text",
      },
    });

    render(
      await PlayRunPage({
        params: Promise.resolve({ runId: "run-1" }),
      }),
    );

    expect(
      screen.getByRole("heading", { name: /current prompt/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /phase 0 holds this space open with a calm placeholder until the engine work arrives\./i,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/hidden prompt text/i)).not.toBeInTheDocument();
  });
});
