import { cn } from "@/lib/utils/cn";
import type { AttendanceStatus } from "@/lib/api/types";

const statusConfig: Record<AttendanceStatus, { label: string; classes: string }> = {
  present: { label: "Present", classes: "text-primary" },
  absent: { label: "Absent", classes: "text-secondary" },
  late: { label: "Late", classes: "text-accent-foreground bg-accent/15" },
  excused: { label: "Excused", classes: "text-muted" },
  pending: { label: "Pending", classes: "text-muted" },
};

export function Stamp({
  status,
  className,
}: {
  status: AttendanceStatus;
  className?: string;
}) {
  const config = statusConfig[status];
  return <span className={cn("stamp", config.classes, className)}>{config.label}</span>;
}
