import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlayTable } from "@/components/features/play/PlayTable";
import type { RunSnapshot } from "@/lib/game/types";

const baseSnapshot: RunSnapshot = {
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

function snapshot(overrides: Partial<RunSnapshot> = {}): RunSnapshot {
  return {
    ...baseSnapshot,
    ...overrides,
    run: { ...baseSnapshot.run, ...overrides.run },
    stats: { ...baseSnapshot.stats, ...overrides.stats },
    currentTile: { ...baseSnapshot.currentTile, ...overrides.currentTile },
  };
}

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status: init.status ?? 200,
    ...init,
  });
}

describe("PlayTable", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders current prompt and legal action", () => {
    render(<PlayTable initialSnapshot={baseSnapshot} />);

    expect(
      screen.getByRole("heading", { name: /camp before nightfall/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/choose how to spend the evening/i)).toBeInTheDocument();
    expect(screen.getByText(/day 2/i)).toBeInTheDocument();
    expect(screen.getByText(/b03/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /camp/i })).toBeInTheDocument();
  });

  it("disables non-journal actions while saving, posts to actions, and renders returned prompt and dice", async () => {
    const user = userEvent.setup();
    let resolveFetch: (response: Response) => void = () => {};
    const savedSnapshot = snapshot({
      pendingPrompt: {
        type: "journal_available",
        title: "Write the day down",
        body: "Record what happened before resting.",
        dayNumber: 2,
        tileId: baseSnapshot.currentTile.id,
      },
      legalActions: [{ type: "journal", label: "Write Journal" }],
      recentActions: [
        {
          id: "action-1",
          type: "camp",
          title: "Camp",
          body: "You recovered under cover.",
          dayNumber: 2,
          tileId: baseSnapshot.currentTile.id,
          diceRolls: [
            {
              id: "roll-1",
              notation: "1d6",
              purpose: "camp",
              values: [4],
              total: 4,
            },
          ],
          createdAt: "2026-05-07T12:01:00.000Z",
        },
      ],
    });

    fetchMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      }),
    );

    render(<PlayTable initialSnapshot={baseSnapshot} />);

    const campButton = screen.getByRole("button", { name: /camp/i });
    await user.click(campButton);

    expect(campButton).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/runs/${baseSnapshot.run.id}/actions`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          type: "camp",
          payload: { foodChoice: "eat_meal_bar" },
        }),
      }),
    );

    resolveFetch(
      jsonResponse({
        ok: true,
        data: {
          snapshot: savedSnapshot,
          summary: {
            type: "camp",
            title: "Camp",
            body: "You recovered under cover.",
            dayNumber: 2,
            tileId: baseSnapshot.currentTile.id,
            diceRolls: [
              {
                id: "roll-1",
                notation: "1d6",
                purpose: "camp",
                values: [4],
                total: 4,
              },
            ],
          },
          diceRolls: [
            {
              id: "roll-1",
              notation: "1d6",
              purpose: "camp",
              values: [4],
              total: 4,
            },
          ],
        },
      }),
    );

    expect(
      await screen.findByRole("heading", { name: /write the day down/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/you recovered under cover/i)).toBeInTheDocument();
    expect(screen.getByText(/1d6/i)).toBeInTheDocument();
    expect(screen.getByText(/total 4/i)).toBeInTheDocument();
  });

  it("displays API errors and re-enables legal actions", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          ok: false,
          error: { message: "That action is no longer valid for this run state." },
        },
        { status: 409 },
      ),
    );

    render(<PlayTable initialSnapshot={baseSnapshot} />);

    const campButton = screen.getByRole("button", { name: /camp/i });
    await user.click(campButton);

    expect(
      await screen.findByText(
        /that action is no longer valid for this run state/i,
      ),
    ).toBeInTheDocument();
    await waitFor(() => expect(campButton).toBeEnabled());
    expect(
      screen.getByRole("heading", { name: /camp before nightfall/i }),
    ).toBeInTheDocument();
  });

  it("posts journal prompts to the journal endpoint and shows the saved state without using actions", async () => {
    const user = userEvent.setup();
    const journalSnapshot = snapshot({
      pendingPrompt: {
        type: "journal_available",
        title: "Write the day down",
        body: "Record what happened before resting.",
        dayNumber: 2,
        tileId: baseSnapshot.currentTile.id,
      },
      legalActions: [{ type: "journal", label: "Write Journal" }],
    });

    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          ok: true,
          data: {
            id: "journal-1",
            runId: baseSnapshot.run.id,
            dayNumber: 2,
            tileId: baseSnapshot.currentTile.id,
            body: "Found a cold trail near the ridge.",
            updatedAt: "2026-05-07T12:02:00.000Z",
          },
        },
        { status: 201 },
      ),
    );

    render(<PlayTable initialSnapshot={journalSnapshot} />);

    await user.type(
      screen.getByLabelText(/journal entry/i),
      "Found a cold trail near the ridge.",
    );
    await user.click(screen.getByRole("button", { name: /save journal/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/runs/${baseSnapshot.run.id}/journal`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            dayNumber: 2,
            tileId: baseSnapshot.currentTile.id,
            body: "Found a cold trail near the ridge.",
          }),
        }),
      );
    });
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringContaining("/actions"),
      expect.anything(),
    );
    expect(
      await screen.findByRole("heading", { name: /journal saved/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/found a cold trail near the ridge/i)).toBeInTheDocument();
  });
});
