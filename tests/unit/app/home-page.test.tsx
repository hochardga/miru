import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import HomePage from "@/app/page";

describe("HomePage", () => {
  it("renders the Miru field-kit landing shell", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /miru/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/guided solo play table/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /start run/i }),
    ).toHaveClass("min-h-11");
    expect(screen.getByRole("link", { name: /rules/i })).toHaveAttribute(
      "href",
      "/rules",
    );
    expect(screen.getByRole("link", { name: /settings/i })).toHaveAttribute(
      "href",
      "/settings",
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
    const description = screen.getByText(/this screen should already feel intentional/i);

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
