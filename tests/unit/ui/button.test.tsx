import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";

describe("Button", () => {
  it("preserves the 44px touch target for the primary action", () => {
    render(<Button>Start Run</Button>);

    expect(screen.getByRole("button", { name: /start run/i })).toHaveClass(
      "min-h-11",
    );
  });

  it("keeps an 8px gap between button content items", () => {
    render(
      <Button>
        <span aria-hidden="true">+</span>
        <span>Start Run</span>
      </Button>,
    );

    expect(screen.getByRole("button", { name: /start run/i })).toHaveClass(
      "gap-2",
    );
  });

  it("renders icon buttons at a fixed 44px square size", () => {
    render(
      <IconButton label="Open notes">
        <span aria-hidden="true">+</span>
      </IconButton>,
    );

    expect(screen.getByRole("button", { name: /open notes/i })).toHaveClass(
      "h-11",
      "w-11",
    );
  });
});
