import { describe, expect, it } from "vitest";
import { startRunRequestSchema } from "@/lib/validation/schemas";

describe("startRunRequestSchema", () => {
  it("accepts a valid starting column and rejects an invalid one", () => {
    expect(
      startRunRequestSchema.parse({ title: "Field Notes", startingColumn: "E" }),
    ).toEqual({
      title: "Field Notes",
      startingColumn: "E",
    });

    expect(() => startRunRequestSchema.parse({ startingColumn: "Z" })).toThrowError();
  });
});
