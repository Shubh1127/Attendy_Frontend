import { cn } from "@/lib/utils/cn";

export function ProgressRing({
  value,
  size = 64,
  strokeWidth = 6,
  className,
  trackClassName = "text-border",
  indicatorClassName = "text-primary",
  label,
}: {
  /** 0..1 */
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  trackClassName?: string;
  indicatorClassName?: string;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, value)));

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} className={cn("fill-none", trackClassName)} stroke="currentColor" opacity={0.4} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={cn("fill-none transition-[stroke-dashoffset] duration-700 ease-out", indicatorClassName)}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute font-mono text-[13px] font-medium text-foreground">
        {label ?? `${Math.round(value * 100)}%`}
      </span>
    </div>
  );
}
