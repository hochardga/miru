import type { ReactNode } from "react";

interface InteriorShellProps {
  title: string;
  context: string;
  children: ReactNode;
}

export function InteriorShell({
  title,
  context,
  children,
}: InteriorShellProps) {
  return (
    <main className="min-h-screen bg-field-background text-ink-text">
      <section className="mx-auto flex w-full max-w-app flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <p className="font-mono text-sm text-ink-muted">{context}</p>
          <h1 className="font-heading text-3xl">{title}</h1>
        </header>
        <div className="grid gap-6">{children}</div>
      </section>
    </main>
  );
}
