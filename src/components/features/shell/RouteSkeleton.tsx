import { Panel } from "@/components/ui/Panel";

export function RouteSkeleton() {
  return (
    <main className="min-h-screen bg-field-background text-ink-text">
      <section className="mx-auto flex w-full max-w-app flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-field-surfaceMuted" />
          <div className="h-10 w-48 rounded bg-field-surfaceMuted" />
        </div>
        <Panel className="h-32 animate-pulse bg-field-surfaceMuted/60" />
        <Panel className="h-40 animate-pulse bg-field-surfaceMuted/60" />
      </section>
    </main>
  );
}
