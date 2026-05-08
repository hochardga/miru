"use client";

import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { TileInspector } from "@/components/features/map/TileInspector";
import { Panel } from "@/components/ui/Panel";
import type { EnemyState, RunTile } from "@/lib/game/types";
import { cn } from "@/lib/utils/cn";

type HexMapProps = {
  currentTile: RunTile;
  visibleTiles: RunTile[];
  activeEnemy: EnemyState | null;
};

const TERRAIN_CLASSES: Record<RunTile["terrain"], string> = {
  unknown: "bg-field-surfaceMuted text-ink-muted",
  forest: "bg-status-success text-field-surface",
  mountains: "bg-status-info text-field-surface",
  grasslands: "bg-signal-primary text-field-surface",
  desert: "bg-signal-accent text-field-surface",
  swamp: "bg-signal-secondary text-field-surface",
  impassable: "bg-ink-muted text-field-surface",
};

function columnRank(tile: RunTile) {
  return tile.column.charCodeAt(0) - "A".charCodeAt(0);
}

function buildVisibleTiles(currentTile: RunTile, visibleTiles: RunTile[]) {
  const byCoordinate = new Map<string, RunTile>();

  for (const tile of visibleTiles) {
    byCoordinate.set(tile.coordinate, tile);
  }

  byCoordinate.set(currentTile.coordinate, currentTile);

  return Array.from(byCoordinate.values()).sort((left, right) => {
    if (left.row !== right.row) {
      return left.row - right.row;
    }

    return columnRank(left) - columnRank(right);
  });
}

export function HexMap({ currentTile, visibleTiles, activeEnemy }: HexMapProps) {
  const tiles = useMemo(
    () => buildVisibleTiles(currentTile, visibleTiles),
    [currentTile, visibleTiles],
  );
  const [selectedCoordinate, setSelectedCoordinate] = useState(
    currentTile.coordinate,
  );
  const selectedTile =
    tiles.find((tile) => tile.coordinate === selectedCoordinate) ?? currentTile;

  return (
    <Panel className="grid gap-4">
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <h2 className="font-heading text-2xl">Map</h2>
        <span className="shrink-0 font-mono text-xs uppercase text-ink-muted">
          {tiles.length} visible
        </span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(64px,1fr))] gap-2">
        {tiles.map((tile) => {
          const isCurrent = tile.coordinate === currentTile.coordinate;
          const isSelected = tile.coordinate === selectedTile.coordinate;

          return (
            <button
              key={tile.id}
              type="button"
              aria-label={`Inspect tile ${tile.coordinate}`}
              aria-pressed={isSelected}
              className={cn(
                "relative grid aspect-square min-h-16 min-w-0 place-items-center rounded-md border px-2 py-2 font-mono text-sm font-semibold transition-colors",
                TERRAIN_CLASSES[tile.terrain],
                isSelected
                  ? "border-ink-text ring-2 ring-status-info"
                  : "border-ink-border hover:border-ink-text",
              )}
              onClick={() => setSelectedCoordinate(tile.coordinate)}
            >
              <span className="break-words text-center leading-tight">
                {tile.coordinate}
              </span>
              {isCurrent ? (
                <MapPin
                  aria-hidden="true"
                  className="absolute right-1 top-1 size-4"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <TileInspector
        activeEnemyName={activeEnemy?.name}
        isCurrent={selectedTile.coordinate === currentTile.coordinate}
        tile={selectedTile}
      />
    </Panel>
  );
}
