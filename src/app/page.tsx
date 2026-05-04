import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-field-background text-ink-text">
      <section className="mx-auto flex min-h-screen w-full max-w-app flex-col justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-3">
          <p className="font-mono text-sm text-ink-muted">
            Guided solo play table
          </p>
          <h1 className="font-heading text-3xl">Miru</h1>
          <p className="max-w-xl text-base text-ink-muted">
            A calm field-kit shell for starting, resuming, and protecting a run
            before the Phase 1 rules engine arrives.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="min-h-11 rounded-md bg-signal-primary px-4 py-3 font-medium text-field-surface"
          >
            Start Run
          </button>
          <Link
            href="/rules"
            className="min-h-11 rounded-md border border-ink-border bg-field-surface px-4 py-3 text-center text-sm font-medium text-ink-text"
          >
            Rules
          </Link>
          <Link
            href="/settings"
            className="min-h-11 rounded-md border border-ink-border bg-field-surface px-4 py-3 text-center text-sm font-medium text-ink-text"
          >
            Settings
          </Link>
        </div>
      </section>
    </main>
  );
}
