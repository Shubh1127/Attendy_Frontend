import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Tone = "error" | "success" | "info";

const toneConfig: Record<Tone, { classes: string; Icon: typeof Info }> = {
  error: { 
    classes: "bg-red-50 dark:bg-red-950/50 border-red-600 text-red-700 dark:text-red-300", 
    Icon: AlertTriangle 
  },
  success: { classes: "bg-primary/10 text-primary border-primary/25", Icon: CheckCircle2 },
  info: { classes: "bg-accent/10 text-accent-foreground border-accent/30", Icon: Info },
};

type NoticeProps = {
  tone?: Tone;
  title: string;
  description?: string;
  className?: string;
  size?: "default" | "large" | "xl";   // Added "xl"
};

export function Notice({
  tone = "info",
  title,
  description,
  className,
  size = "default",
}: NoticeProps) {
  const { classes, Icon } = toneConfig[tone];

  const isLarge = size === "large";
  const isXL = size === "xl";

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-5 text-white rounded-3xl border px-8 py-8",
        classes,
        isLarge && "px-8 py-8",
        isXL && "px-10 py-10 border-2",
        className
      )}
    >
      <Icon 
        className={cn(
          "mt-1 shrink-0",
          isXL ? "h-9 w-9" : isLarge ? "h-7 w-7" : "h-5 w-5"
        )} 
        strokeWidth={isXL ? 2.25 : 2.5} 
      />

      <div>
        <p className={cn(
          "font-semibold leading-tight text-white",
          isXL && "text-3xl",
          isLarge && "text-2xl",
          !isXL && !isLarge && "text-lg"
        )}>
          {title}
        </p>

        {description && (
          <p className={cn(
            "mt-3 opacity-90 leading-relaxed text-white",
            isXL && "text-xl",
            isLarge && "text-lg",
            !isXL && !isLarge && "text-[15px]"
          )}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}