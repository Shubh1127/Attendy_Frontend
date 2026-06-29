import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function StatTile({
  label,
  value,
  delta,
  trend,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  icon?: LucideIcon;
}) {
  const TrendIcon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;
  const trendColor =
    trend === "up" ? "text-primary" : trend === "down" ? "text-secondary" : "text-muted";

  return (
    <div className="flex flex-col gap-2 border-t-2 border-foreground/90 pt-3">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.1em] text-muted">
        <span>{label}</span>
        {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-3xl font-medium text-foreground">{value}</span>
        {delta && (
          <span className={cn("flex items-center gap-0.5 font-mono text-xs", trendColor)}>
            <TrendIcon className="h-3 w-3" />
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}
