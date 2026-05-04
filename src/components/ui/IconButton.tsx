import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { buttonVariants } from "@/components/ui/Button";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, label, type = "button", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "min-h-11 min-w-11 px-0",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
