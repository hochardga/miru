import { InteriorShell } from "@/components/features/shell/InteriorShell";
import { Panel } from "@/components/ui/Panel";
import { requireUser } from "@/lib/supabase/server";

export default async function SettingsPage() {
  await requireUser();

  return (
    <InteriorShell title="Settings" context="Session and preferences">
      <Panel>
        Guest session details, reduced-motion preferences, and future account
        upgrade controls land here.
      </Panel>
    </InteriorShell>
  );
}
