import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("preserves the 44px touch target for the primary action", () => {
    render(<Button>Start Run</Button>);

    expect(screen.getByRole("button", { name: /start run/i })).toHaveClass(
      "min-h-11",
    );
  });
});
