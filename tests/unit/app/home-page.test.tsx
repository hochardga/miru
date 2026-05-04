import { render, screen } from "@testing-library/react";
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
  });
});
