import Link from "next/link";
import { Play } from "lucide-react";
import { InteriorShell } from "@/components/features/shell/InteriorShell";
import { Panel } from "@/components/ui/Panel";
import { listRuns } from "@/lib/runs/queries";
import { requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const JOURNAL_EXCERPT_LENGTH = 163;

function formatRunStatus(status: string) {
  return status
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatUpdatedDate(value: string | null | undefined) {
  if (!value) {
    return "Updated unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Updated unknown";
  }

  return `Updated ${new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)}`;
}

function journalExcerpt(body: string | null) {
  if (!body) {
    return "No journal entry yet.";
  }

  if (body.length <= JOURNAL_EXCERPT_LENGTH) {
    return body;
  }

  return `${body.slice(0, JOURNAL_EXCERPT_LENGTH - 3).trimEnd()}...`;
}

export default async function RunsPage() {
  const { supabase, user } = await requireUser();
  const runs = await listRuns(supabase, user.id, 10);

  return (
    <InteriorShell title="Runs" context="Saved expeditions">
      {runs.length === 0 ? (
        <Panel>No runs yet. Start a new run from home.</Panel>
      ) : (
        runs.map((run) => (
          <Panel key={run.id} className="grid gap-4">
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="break-words font-heading text-2xl">{run.title}</h2>
                <div className="mt-2 flex min-w-0 flex-wrap gap-2 font-mono text-xs uppercase text-ink-muted">
                  <span>Day {run.current_day}</span>
                  <span>Status: {formatRunStatus(run.status)}</span>
                  <span>{formatUpdatedDate(run.updated_at)}</span>
                </div>
              </div>
              {run.status === "active" ? (
                <Link
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-transparent bg-signal-primary px-4 py-3 text-sm font-medium text-field-surface transition-colors duration-150 hover:bg-signal-primaryHover"
                  href={`/play/${run.id}`}
                >
                  <Play aria-hidden="true" className="size-4" />
                  Resume
                </Link>
              ) : null}
            </div>
            <p className="break-words text-sm leading-6 text-ink-muted">
              {journalExcerpt(run.last_journal_entry)}
            </p>
          </Panel>
        ))
      )}
    </InteriorShell>
  );
}
