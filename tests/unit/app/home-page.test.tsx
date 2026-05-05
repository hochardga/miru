import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";

const { getSearchParam } = vi.hoisted(() => ({
  getSearchParam: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: getSearchParam,
  }),
}));

vi.mock("@/components/features/auth/AnonymousSessionGate", () => ({
  AnonymousSessionGate: () => (
    <div data-testid="anonymous-session-gate">
      <button type="button">Start Run</button>
      <button type="button">Rules</button>
      <button type="button">Settings</button>
      <button type="button">All Runs</button>
    </div>
  ),
}));

describe("HomePage", () => {
  beforeEach(() => {
    getSearchParam.mockImplementation(() => null);
  });

  it("renders the Miru field-kit landing shell", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /miru/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/guided solo play table/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start run/i })).toBeInTheDocument();
    expect(
      screen.getByTestId("anonymous-session-gate"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /rules/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /settings/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /all runs/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /start or restore a session, then move into a protected interior shell/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/real anonymous auth happens here\. rules depth still waits for phase 1\./i),
    ).toBeInTheDocument();
  });

  it("explains when the user was sent home because a guest session is required", () => {
    getSearchParam.mockImplementation((key: string) =>
      key === "reason" ? "session-required" : null,
    );

    render(<HomePage />);

    expect(
      screen.getByText(
        /we couldn't find an active guest session for that page\. start or restore a run here and we'll get you back inside\./i,
      ),
    ).toBeInTheDocument();
  });

  it("renders the updated phase 0 modal description", async () => {
    const user = userEvent.setup();

    render(<HomePage />);

    await user.click(
      screen.getByRole("button", { name: /open phase 0 notes/i }),
    );

    expect(
      screen.getByText(
        /home should already feel like a believable product surface, not a disconnected launch pad\./i,
      ),
    );
  });

  it("traps focus inside the phase 0 modal", async () => {
    const user = userEvent.setup();

    render(<HomePage />);

    await user.click(
      screen.getByRole("button", { name: /open phase 0 notes/i }),
    );

    const closeButton = screen.getByRole("button", { name: /close/i });
    expect(closeButton).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(closeButton).toHaveFocus();
  });

  it("wires the modal title and description with dialog accessibility attributes", async () => {
    const user = userEvent.setup();

    render(<HomePage />);

    await user.click(
      screen.getByRole("button", { name: /open phase 0 notes/i }),
    );

    const dialog = screen.getByRole("dialog", { name: /phase 0 slice/i });
    const title = screen.getByRole("heading", { name: /phase 0 slice/i });
    const description = screen.getByText(
      /home should already feel like a believable product surface, not a disconnected launch pad\./i,
    );

    expect(title.id).not.toBe("");
    expect(description.id).not.toBe("");
    expect(dialog).toHaveAttribute("aria-labelledby", title.id);
    expect(dialog).toHaveAttribute("aria-describedby", description.id);
  });

  it("closes the modal on escape and restores focus to the trigger", async () => {
    const user = userEvent.setup();

    render(<HomePage />);

    const trigger = screen.getByRole("button", {
      name: /open phase 0 notes/i,
    });

    await user.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
