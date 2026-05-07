import {
  COORDINATE_COLUMNS,
  type CoordinateColumn,
  type CoordinateId,
  type CoordinateRow,
  type RunTile,
} from "@/lib/game/types";

export type Coordinate = { column: CoordinateColumn; row: CoordinateRow };
export type MoveDirection = "W" | "NW" | "NE" | "E" | "SE" | "SW";

const ROWS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export function coordinateToId(coordinate: Coordinate): CoordinateId {
  return `${coordinate.column}${String(coordinate.row).padStart(2, "0")}` as CoordinateId;
}

export function parseCoordinate(value: string): Coordinate | null {
  const column = value.slice(0, 1) as CoordinateColumn;
  const row = Number(value.slice(1));

  if (!COORDINATE_COLUMNS.includes(column) || !ROWS.includes(row as CoordinateRow)) {
    return null;
  }

  return { column, row: row as CoordinateRow };
}

function columnOffset(column: CoordinateColumn) {
  return COORDINATE_COLUMNS.indexOf(column);
}

function coordinateFromOffset(columnIndex: number, row: number): Coordinate | null {
  const column = COORDINATE_COLUMNS[columnIndex];

  if (!column || !ROWS.includes(row as CoordinateRow)) {
    return null;
  }

  return { column, row: row as CoordinateRow };
}

export function moveCoordinate(coordinate: Coordinate, direction: MoveDirection): Coordinate | null {
  const currentColumn = columnOffset(coordinate.column);
  const isEvenRow = coordinate.row % 2 === 0;
  const offsets: Record<MoveDirection, [number, number]> = {
    W: [-1, 0],
    E: [1, 0],
    NW: [isEvenRow ? -1 : 0, -1],
    NE: [isEvenRow ? 0 : 1, -1],
    SW: [isEvenRow ? -1 : 0, 1],
    SE: [isEvenRow ? 0 : 1, 1],
  };
  const [columnDelta, rowDelta] = offsets[direction];

  return coordinateFromOffset(currentColumn + columnDelta, coordinate.row + rowDelta);
}

export function getVisibleMapTiles(existingTiles: RunTile[]): RunTile[] {
  const byCoordinate = new Map(existingTiles.map((tile) => [tile.coordinate, tile]));

  return ROWS.flatMap((row) =>
    COORDINATE_COLUMNS.map((column) => {
      const coordinate = coordinateToId({ column, row });

      return (
        byCoordinate.get(coordinate) ?? {
          id: coordinate,
          coordinate,
          row,
          column,
          terrain: "unknown",
          visited: false,
          icons: [],
          eventHistory: [],
          repeatabilityState: {},
          enemyState: null,
          notes: null,
        }
      );
    }),
  );
}
