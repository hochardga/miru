import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InteriorShell } from "@/components/features/shell/InteriorShell";

describe("InteriorShell", () => {
  it("renders a consistent heading and route context", () => {
    render(
      <InteriorShell title="Runs" context="Saved expeditions">
        <div>content</div>
      </InteriorShell>,
    );

    expect(screen.getByRole("heading", { name: /runs/i })).toBeInTheDocument();
    expect(screen.getByText(/saved expeditions/i)).toBeInTheDocument();
    expect(screen.getByText(/content/i)).toBeInTheDocument();
  });
});
