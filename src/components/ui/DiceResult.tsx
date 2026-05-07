import { Dice5 } from "lucide-react";
import type { DiceRoll } from "@/lib/game/types";
import { cn } from "@/lib/utils/cn";

type DiceResultProps = {
  rolls: DiceRoll[];
  className?: string;
};

export function DiceResult({ rolls, className }: DiceResultProps) {
  if (rolls.length === 0) {
    return null;
  }

  return (
    <div className={cn("grid gap-2", className)}>
      {rolls.map((roll) => (
        <div
          key={roll.id}
          className="flex min-h-12 items-center justify-between gap-3 rounded-md border border-ink-border bg-field-surfaceMuted px-3 py-2"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Dice5 aria-hidden="true" className="size-4 shrink-0 text-signal-primary" />
            <span className="font-mono text-xs uppercase text-ink-muted">
              {roll.notation}
            </span>
            <span className="truncate text-sm capitalize text-ink-muted">
              {roll.purpose}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="font-mono text-sm text-ink-muted">
              {roll.values.join(" + ")}
            </span>
            <span className="min-w-16 text-right text-lg font-semibold">
              Total {roll.total}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
