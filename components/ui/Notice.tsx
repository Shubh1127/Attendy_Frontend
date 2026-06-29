import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Tone = "error" | "success" | "info";

const toneConfig: Record<Tone, { classes: string; Icon: typeof Info }> = {
  error: { classes: "bg-secondary/10 text-secondary border-secondary/25", Icon: AlertTriangle },
  success: { classes: "bg-primary/10 text-primary border-primary/25", Icon: CheckCircle2 },
  info: { classes: "bg-accent/10 text-accent-foreground border-accent/30", Icon: Info },
};

export function Notice({
  tone = "info",
  title,
  description,
  className,
}: {
  tone?: Tone;
  title: string;
  description?: string;
  className?: string;
}) {
  const { classes, Icon } = toneConfig[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-md border px-4 py-3 text-sm", classes, className)}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
      <div>
        <p className="font-medium">{title}</p>
        {description && <p className="mt-0.5 text-[13px] opacity-90">{description}</p>}
      </div>
    </div>
  );
}
