import { describe, expect, it } from "vitest";
import {
  gameActionRequestSchema,
  journalRequestSchema,
  runsQuerySchema,
  startRunRequestSchema,
} from "@/lib/validation/schemas";

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

describe("gameActionRequestSchema", () => {
  it("accepts legal Phase 1 actions", () => {
    expect(gameActionRequestSchema.parse({ type: "next_day" })).toEqual({
      type: "next_day",
    });
    expect(
      gameActionRequestSchema.parse({
        type: "camp",
        payload: { foodChoice: "eat_meal_bar" },
      }),
    ).toEqual({
      type: "camp",
      payload: { foodChoice: "eat_meal_bar" },
    });
    expect(
      gameActionRequestSchema.parse({
        type: "camp",
        payload: { foodChoice: "skip_food" },
      }),
    ).toEqual({
      type: "camp",
      payload: { foodChoice: "skip_food" },
    });
    expect(
      gameActionRequestSchema.parse({
        type: "combat_action",
        payload: { move: "attack" },
      }),
    ).toEqual({
      type: "combat_action",
      payload: { move: "attack" },
    });
    expect(
      gameActionRequestSchema.parse({
        type: "combat_action",
        payload: { move: "escape" },
      }),
    ).toEqual({
      type: "combat_action",
      payload: { move: "escape" },
    });
  });

  it("rejects stale or unsupported actions", () => {
    expect(() => gameActionRequestSchema.parse({ type: "move", payload: {} })).toThrow();
  });

  it("rejects unknown top-level action fields", () => {
    expect(() =>
      gameActionRequestSchema.parse({
        type: "next_day",
        stale: true,
      }),
    ).toThrow();
  });

  it("rejects unknown payload fields for next_day", () => {
    expect(() =>
      gameActionRequestSchema.parse({
        type: "next_day",
        payload: { stale: true },
      }),
    ).toThrow();
  });

  it("rejects unknown payload fields for camp and combat actions", () => {
    expect(() =>
      gameActionRequestSchema.parse({
        type: "camp",
        payload: { foodChoice: "eat_meal_bar", stale: true },
      }),
    ).toThrow();

    expect(() =>
      gameActionRequestSchema.parse({
        type: "combat_action",
        payload: { move: "attack", stale: true },
      }),
    ).toThrow();
  });
});

describe("journalRequestSchema", () => {
  it("limits entries to 1000 characters", () => {
    expect(
      journalRequestSchema.parse({
        dayNumber: 1,
        body: "The field kit held together.",
      }),
    ).toMatchObject({ dayNumber: 1 });

    expect(() =>
      journalRequestSchema.parse({
        dayNumber: 1,
        body: "x".repeat(1001),
      }),
    ).toThrow();
  });

  it("trims entry bodies and rejects empty entries", () => {
    expect(
      journalRequestSchema.parse({
        dayNumber: 1,
        body: "  The page still smells like rain.  ",
      }),
    ).toMatchObject({
      body: "The page still smells like rain.",
    });

    expect(() =>
      journalRequestSchema.parse({
        dayNumber: 1,
        body: "   ",
      }),
    ).toThrow();
  });

  it("rejects invalid tile IDs", () => {
    expect(() =>
      journalRequestSchema.parse({
        dayNumber: 1,
        tileId: "tile-1",
        body: "The landmark is not where the map promised.",
      }),
    ).toThrow();
  });
});
