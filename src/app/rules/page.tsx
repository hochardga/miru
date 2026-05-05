import { InteriorShell } from "@/components/features/shell/InteriorShell";
import { Panel } from "@/components/ui/Panel";
import { requireUser } from "@/lib/supabase/server";

export default async function RulesPage() {
  await requireUser();

  return (
    <InteriorShell title="Rules" context="Reference shell">
      <Panel>
        Rules search is intentionally shallow in Phase 0. The protected shell is
        real so later contextual rule help has a stable place to live.
      </Panel>
    </InteriorShell>
  );
}
