import { InteriorShell } from "@/components/features/shell/InteriorShell";
import { Panel } from "@/components/ui/Panel";
import { getRunShell } from "@/lib/runs/queries";
import { requireUser } from "@/lib/supabase/server";

const PLAY_PLACEHOLDER_COPY =
  "Phase 0 holds this space open with a calm placeholder until the engine work arrives.";

function formatTileLabel(
  columnLetter: string | null | undefined,
  row: number | string,
) {
  const column = columnLetter ?? "?";
  const rowLabel =
    typeof row === "number" ? String(row).padStart(2, "0") : row;

  return `${column}${rowLabel}`;
}

export default async function PlayRunPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  const { supabase, user } = await requireUser();
  const run = await getRunShell(supabase, user.id, runId);

  if (!run) {
    return (
      <InteriorShell title="Play" context="Run unavailable">
        <Panel>
          That run could not be found for this session. Start from home or
          return to your saved runs list.
        </Panel>
      </InteriorShell>
    );
  }

  return (
    <InteriorShell
      title={run.title}
      context={`Day ${run.current_day} · ${formatTileLabel(
        run.tile?.column_letter,
        run.tile?.row_number ?? "?",
      )}`}
    >
      <Panel className="space-y-2">
        <h2 className="font-heading text-2xl">Current prompt</h2>
        <p className="text-sm text-ink-muted">{PLAY_PLACEHOLDER_COPY}</p>
      </Panel>

      <Panel className="grid gap-3 sm:grid-cols-3">
        <div>
          <p className="font-mono text-sm text-ink-muted">HP</p>
          <p className="text-xl font-semibold">{run.hp}</p>
        </div>
        <div>
          <p className="font-mono text-sm text-ink-muted">EP</p>
          <p className="text-xl font-semibold">{run.ep}</p>
        </div>
        <div>
          <p className="font-mono text-sm text-ink-muted">Meal Bars</p>
          <p className="text-xl font-semibold">{run.mealBars}</p>
        </div>
      </Panel>

      <Panel>
        <p className="text-sm text-ink-muted">
          Map, action resolution, and journal flow arrive in Phase 1. This
          shell proves the protected route, session, and data contract now.
        </p>
      </Panel>
    </InteriorShell>
  );
}
