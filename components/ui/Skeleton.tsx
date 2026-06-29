import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-muted", className)}
      role="status"
      aria-label="Loading"
    />
  );
}

export function SkeletonRow() {
  return (
    <div className="ruled-row flex items-center gap-4 py-4">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-1/5" />
      </div>
      <Skeleton className="h-6 w-20 rounded-stamp" />
    </div>
  );
}
