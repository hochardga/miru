import Link from "next/link";
import { InteriorShell } from "@/components/features/shell/InteriorShell";
import { Panel } from "@/components/ui/Panel";
import { listRuns } from "@/lib/runs/queries";
import { requireUser } from "@/lib/supabase/server";

export default async function RunsPage() {
  const { supabase, user } = await requireUser();
  const runs = await listRuns(supabase, user.id, 10);

  return (
    <InteriorShell title="Runs" context="Saved expeditions">
      {runs.length === 0 ? (
        <Panel>No runs yet. Start a new run from home.</Panel>
      ) : (
        runs.map((run) => (
          <Panel key={run.id} className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-heading text-2xl">{run.title}</h2>
              <span className="font-mono text-sm text-ink-muted">
                Day {run.current_day}
              </span>
            </div>
            <p className="text-sm text-ink-muted">
              {run.last_journal_entry ?? "No journal entry yet."}
            </p>
            <Link
              className="font-medium text-signal-primary underline-offset-4 hover:underline"
              href={`/play/${run.id}`}
            >
              Resume run
            </Link>
          </Panel>
        ))
      )}
    </InteriorShell>
  );
}
