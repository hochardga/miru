"use client";

import { useState } from "react";
import Link from "next/link";
import { Compass, Settings2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Modal } from "@/components/ui/Modal";
import { Panel } from "@/components/ui/Panel";

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
            A calm field-kit shell for starting, resuming, and protecting a run
            before the deeper rules work begins.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button>Start Run</Button>
            <Link
              href="/rules"
              className={buttonVariants({ variant: "secondary" })}
            >
              Rules
            </Link>
            <Link
              href="/settings"
              className={buttonVariants({ variant: "secondary" })}
            >
              Settings
            </Link>
          </div>
        </Panel>

        <div className="flex items-center gap-3 text-sm text-ink-muted">
          <Settings2 className="h-4 w-4" />
          Protected routes and real session plumbing land in the next tasks.
        </div>
      </section>

      <Modal
        open={isModalOpen}
        title="Phase 0 slice"
        description="This screen should already feel intentional: parchment surfaces, quiet hierarchy, and one honest route into the protected shell."
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}
