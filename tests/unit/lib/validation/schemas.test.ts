import { describe, expect, it } from "vitest";
import { runsQuerySchema, startRunRequestSchema } from "@/lib/validation/schemas";

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

  it('defaults startingColumn to "E" when omitted', () => {
    expect(startRunRequestSchema.parse({})).toEqual({
      startingColumn: "E",
    });
  });

  it("trims titles and enforces title constraints", () => {
    expect(
      startRunRequestSchema.parse({
        title: "  Field Notes  ",
      }),
    ).toEqual({
      title: "Field Notes",
      startingColumn: "E",
    });

    expect(() =>
      startRunRequestSchema.parse({
        title: "   ",
      }),
    ).toThrowError();

    expect(() =>
      startRunRequestSchema.parse({
        title: "x".repeat(121),
      }),
    ).toThrowError();
  });
});

describe("runsQuerySchema", () => {
  it("defaults limit to 5 and coerces valid numeric input", () => {
    expect(runsQuerySchema.parse({})).toEqual({
      limit: 5,
    });

    expect(
      runsQuerySchema.parse({
        limit: "10",
      }),
    ).toEqual({
      limit: 10,
    });
  });

  it("rejects limits outside the supported range", () => {
    expect(() =>
      runsQuerySchema.parse({
        limit: "0",
      }),
    ).toThrowError();

    expect(() =>
      runsQuerySchema.parse({
        limit: "11",
      }),
    ).toThrowError();
  });

  it("rejects decimal and non-numeric limits", () => {
    expect(() =>
      runsQuerySchema.parse({
        limit: "1.5",
      }),
    ).toThrowError();

    expect(() =>
      runsQuerySchema.parse({
        limit: "banana",
      }),
    ).toThrowError();
  });
});
