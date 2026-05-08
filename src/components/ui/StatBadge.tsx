import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type StatBadgeProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

export function StatBadge({ label, value, className }: StatBadgeProps) {
  return (
    <div
      className={cn(
        "grid min-h-16 min-w-0 content-between gap-1 rounded-md border border-ink-border bg-field-surfaceMuted px-3 py-2",
        className,
      )}
    >
      <span className="break-words font-mono text-xs uppercase text-ink-muted">
        {label}
      </span>
      <span className="break-words text-2xl font-semibold leading-tight">
        {value}
      </span>
    </div>
  );
}
