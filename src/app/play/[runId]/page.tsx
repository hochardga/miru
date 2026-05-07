import { InteriorShell } from "@/components/features/shell/InteriorShell";
import { PlayTable } from "@/components/features/play/PlayTable";
import { Panel } from "@/components/ui/Panel";
import { getRunSnapshot } from "@/lib/runs/snapshot";
import { requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const INCOMPLETE_RUN_COPY =
  "This run exists, but its saved snapshot is incomplete for this session. Return to your runs list or start a new run from home.";

function isRunSnapshotIncompleteError(error: unknown) {
  return error instanceof Error && error.name === "RunSnapshotIncompleteError";
}

export default async function PlayRunPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  const { supabase, user } = await requireUser();
  let snapshot;

  try {
    snapshot = await getRunSnapshot(supabase, user.id, runId);
  } catch (error) {
    if (isRunSnapshotIncompleteError(error)) {
      return (
        <InteriorShell title="Play" context="Run snapshot incomplete">
          <Panel>{INCOMPLETE_RUN_COPY}</Panel>
        </InteriorShell>
      );
    }

    throw error;
  }

  if (!snapshot) {
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
      title={snapshot.run.title}
      context={`Day ${snapshot.run.currentDay} · ${snapshot.currentTile.coordinate}`}
    >
      <PlayTable initialSnapshot={snapshot} />
    </InteriorShell>
  );
}
