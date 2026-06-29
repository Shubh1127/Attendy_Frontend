import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils/cn";

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, hint, error, leftIcon, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-describedby={cn(hintId, errorId) || undefined}
            aria-invalid={!!error}
            className={cn(
              "h-11 w-full rounded-md border border-border bg-surface px-3.5 text-sm text-foreground placeholder:text-muted",
              "transition-colors focus:border-primary",
              leftIcon && "pl-10",
              error && "border-secondary focus:border-secondary",
              className
            )}
            {...props}
          />
        </div>
        {hint && !error && (
          <p id={hintId} className="text-xs text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs text-secondary">
            {error}
          </p>
        )}
      </div>
    );
  }
);
TextField.displayName = "TextField";
