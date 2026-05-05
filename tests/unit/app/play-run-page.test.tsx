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
