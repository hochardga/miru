import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type PanelProps = React.HTMLAttributes<HTMLDivElement>;

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-md border border-ink-border bg-field-surface p-4 shadow-soft",
          className,
        )}
        {...props}
      />
    );
  },
);

Panel.displayName = "Panel";
