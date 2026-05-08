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

  it("keeps inverse direction pairs reversible on odd and even rows", () => {
    const evenSouthwest = moveCoordinate({ column: "E", row: 2 }, "SW");
    expect(evenSouthwest).toEqual({ column: "D", row: 3 });
    expect(evenSouthwest && moveCoordinate(evenSouthwest, "NE")).toEqual({
      column: "E",
      row: 2,
    });

    const evenSoutheast = moveCoordinate({ column: "E", row: 2 }, "SE");
    expect(evenSoutheast).toEqual({ column: "E", row: 3 });
    expect(evenSoutheast && moveCoordinate(evenSoutheast, "NW")).toEqual({
      column: "E",
      row: 2,
    });

    const east = moveCoordinate({ column: "E", row: 2 }, "E");
    expect(east).toEqual({ column: "F", row: 2 });
    expect(east && moveCoordinate(east, "W")).toEqual({ column: "E", row: 2 });
  });

  it("builds a stable 108 tile visible grid", () => {
    const tiles = getVisibleMapTiles([]);

    expect(tiles).toHaveLength(108);
    expect(tiles[0]?.coordinate).toBe("A01");
    expect(tiles[107]?.coordinate).toBe("I12");
  });
});
