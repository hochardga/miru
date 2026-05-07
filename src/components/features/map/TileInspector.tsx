import { CircleAlert, Footprints, MapPin } from "lucide-react";
import type { RunTile } from "@/lib/game/types";

type TileInspectorProps = {
  tile: RunTile;
  isCurrent: boolean;
  activeEnemyName?: string | null;
};

function formatTerrain(terrain: RunTile["terrain"]) {
  return terrain.charAt(0).toUpperCase() + terrain.slice(1);
}

export function TileInspector({
  tile,
  isCurrent,
  activeEnemyName,
}: TileInspectorProps) {
  const enemyName = tile.enemyState?.name ?? activeEnemyName;

  return (
    <aside className="grid min-w-0 gap-3 border-t border-ink-border pt-4">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase text-ink-muted">Tile</p>
          <h3 className="break-words font-heading text-2xl">{tile.coordinate}</h3>
        </div>
        {isCurrent ? (
          <span className="inline-flex min-h-8 items-center gap-2 rounded-md border border-signal-primary px-2 py-1 font-mono text-xs uppercase text-signal-primary">
            <MapPin aria-hidden="true" className="size-4" />
            Current
          </span>
        ) : null}
      </div>

      <dl className="grid gap-2 text-sm">
        <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3">
          <dt className="font-mono text-xs uppercase text-ink-muted">Terrain</dt>
          <dd className="min-w-0 break-words">{formatTerrain(tile.terrain)}</dd>
        </div>
        <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3">
          <dt className="font-mono text-xs uppercase text-ink-muted">Visited</dt>
          <dd className="min-w-0 break-words">
            {tile.visited ? "Visited" : "Not visited"}
          </dd>
        </div>
        <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3">
          <dt className="font-mono text-xs uppercase text-ink-muted">Icons</dt>
          <dd className="min-w-0 break-words">
            {tile.icons.length > 0 ? tile.icons.join(", ") : "None"}
          </dd>
        </div>
        <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3">
          <dt className="font-mono text-xs uppercase text-ink-muted">Events</dt>
          <dd className="min-w-0 break-words">
            {tile.eventHistory.length > 0 ? tile.eventHistory.join(", ") : "None"}
          </dd>
        </div>
      </dl>

      {enemyName ? (
        <p className="flex min-w-0 items-start gap-2 rounded-md border border-status-warning/40 bg-field-surfaceMuted px-3 py-2 text-sm">
          <CircleAlert
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-status-warning"
          />
          <span className="min-w-0 break-words">
            {tile.enemyState ? "Enemy" : "Active enemy"}: {enemyName}
          </span>
        </p>
      ) : null}

      {tile.notes ? (
        <p className="flex min-w-0 items-start gap-2 rounded-md border border-ink-border bg-field-surfaceMuted px-3 py-2 text-sm leading-6">
          <Footprints
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-signal-secondary"
          />
          <span className="min-w-0 break-words">{tile.notes}</span>
        </p>
      ) : null}
    </aside>
  );
}
