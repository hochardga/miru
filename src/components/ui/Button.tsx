import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

export const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center rounded-md border px-4 py-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-signal-primary text-field-surface hover:bg-signal-primaryHover",
        secondary:
          "border-ink-border bg-field-surface text-ink-text hover:bg-field-surfaceMuted",
        ghost:
          "border-transparent bg-transparent text-ink-text hover:bg-field-surface",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant }), className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
