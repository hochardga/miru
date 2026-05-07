import type { RunPrompt } from "@/lib/game/types";

type CurrentPromptProps = {
  prompt: RunPrompt;
  latestJournalBody?: string | null;
};

export function CurrentPrompt({ prompt, latestJournalBody }: CurrentPromptProps) {
  return (
    <section className="grid gap-3" aria-labelledby="current-prompt-title">
      <div className="grid gap-2">
        <p className="font-mono text-xs uppercase text-ink-muted">Current Prompt</p>
        <h2 id="current-prompt-title" className="font-heading text-2xl">
          {prompt.title}
        </h2>
        <p className="text-sm leading-6 text-ink-muted">{prompt.body}</p>
      </div>

      {latestJournalBody ? (
        <p className="border-l border-ink-border px-3 py-2 text-sm leading-6">
          {latestJournalBody}
        </p>
      ) : null}
    </section>
  );
}
