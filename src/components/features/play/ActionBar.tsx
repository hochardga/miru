import { LoaderCircle, Save, Sword } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { LegalAction, RunPrompt } from "@/lib/game/types";

type ActionBarProps = {
  legalActions: LegalAction[];
  prompt: RunPrompt;
  disabled: boolean;
  journalBody: string;
  onAction: (action: LegalAction) => void;
  onJournalBodyChange: (body: string) => void;
  onJournalSubmit: () => void;
};

export function ActionBar({
  legalActions,
  prompt,
  disabled,
  journalBody,
  onAction,
  onJournalBodyChange,
  onJournalSubmit,
}: ActionBarProps) {
  if (prompt.type === "journal_available") {
    return (
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          onJournalSubmit();
        }}
      >
        <label className="grid gap-2 text-sm font-medium" htmlFor="journal-entry">
          Journal Entry
          <textarea
            id="journal-entry"
            className="min-h-28 resize-y rounded-md border border-ink-border bg-field-surface px-3 py-2 text-base leading-6 outline-none transition-colors focus:border-signal-primary"
            disabled={disabled}
            maxLength={1000}
            onChange={(event) => onJournalBodyChange(event.target.value)}
            value={journalBody}
          />
        </label>
        <Button
          className="w-full sm:w-fit sm:min-w-40"
          disabled={disabled || journalBody.trim().length === 0}
          type="submit"
        >
          {disabled ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="size-4" />
          )}
          Save Journal
        </Button>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {legalActions
        .filter((action) => action.type !== "journal")
        .map((action) => (
          <Button
            key={`${action.type}-${action.label}`}
            className="w-full sm:w-fit sm:min-w-36"
            disabled={disabled}
            onClick={() => onAction(action)}
          >
            {disabled ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Sword aria-hidden="true" className="size-4" />
            )}
            {action.label}
          </Button>
        ))}
    </div>
  );
}
