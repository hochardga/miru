"use client";

import { Suspense, useState } from "react";
import { Compass, Settings2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AnonymousSessionGate } from "@/components/features/auth/AnonymousSessionGate";
import { IconButton } from "@/components/ui/IconButton";
import { Modal } from "@/components/ui/Modal";
import { Panel } from "@/components/ui/Panel";

function SessionRequiredNotice() {
  const searchParams = useSearchParams();
  const requiresSession = searchParams.get("reason") === "session-required";

  if (!requiresSession) {
    return null;
  }

  return (
    <p className="max-w-xl text-sm text-ink-muted" role="status">
      We couldn&apos;t find an active guest session for that page. Start or
      restore a run here and we&apos;ll get you back inside.
    </p>
  );
}

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-field-background text-ink-text">
      <section className="mx-auto flex min-h-screen w-full max-w-app flex-col justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-3">
            <p className="font-mono text-sm text-ink-muted">
              Guided solo play table
            </p>
            <h1 className="font-heading text-3xl">Miru</h1>
          </div>
          <IconButton
            label="Open Phase 0 notes"
            onClick={() => setIsModalOpen(true)}
          >
            <Compass className="h-5 w-5" />
          </IconButton>
        </div>

        <Panel className="space-y-4">
          <p className="max-w-xl text-base text-ink-muted">
            Start or restore a session, then move into a protected interior shell
            with honest empty, loading, and retry states.
          </p>
          <Suspense fallback={null}>
            <SessionRequiredNotice />
          </Suspense>
          <AnonymousSessionGate />
        </Panel>

        <div className="flex items-center gap-3 text-sm text-ink-muted">
          <Settings2 className="h-4 w-4" />
          Real anonymous auth happens here. Rules depth still waits for Phase 1.
        </div>
      </section>

      <Modal
        open={isModalOpen}
        title="Phase 0 slice"
        description="Home should already feel like a believable product surface, not a disconnected launch pad."
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}
