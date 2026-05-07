import { describe, expect, it } from "vitest";
import {
  coordinateToId,
  getVisibleMapTiles,
  moveCoordinate,
  parseCoordinate,
} from "@/lib/game/map";

describe("map helpers", () => {
  it("formats and parses coordinates across the 12x9 grid", () => {
    expect(coordinateToId({ column: "A", row: 1 })).toBe("A01");
    expect(parseCoordinate("I12")).toEqual({ column: "I", row: 12 });
    expect(parseCoordinate("J01")).toBeNull();
  });

  it("moves through the six Miru directions and rejects invalid edges", () => {
    expect(moveCoordinate({ column: "E", row: 1 }, "E")).toEqual({
      column: "F",
      row: 1,
    });
    expect(moveCoordinate({ column: "E", row: 1 }, "NW")).toBeNull();
    expect(moveCoordinate({ column: "E", row: 2 }, "SW")).toEqual({
      column: "D",
      row: 3,
    });
  });

  it("builds a stable 108 tile visible grid", () => {
    const tiles = getVisibleMapTiles([]);

    expect(tiles).toHaveLength(108);
    expect(tiles[0]?.coordinate).toBe("A01");
    expect(tiles[107]?.coordinate).toBe("I12");
  });
});
