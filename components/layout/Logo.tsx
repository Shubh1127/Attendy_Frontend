import { cn } from "@/lib/utils/cn";

export function Logo({ className, markOnly }: { className?: string; markOnly?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0" aria-hidden>
        <circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
        <path
          d="M16 6 L23 11 L23 21 L16 26 L9 21 L9 11 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <circle cx="16" cy="16" r="4.5" fill="currentColor" />
      </svg>
      {!markOnly && (
        <span className="font-display text-lg font-semibold tracking-tight">
          Snap<span className="text-primary">Class</span>
        </span>
      )}
    </span>
  );
}
