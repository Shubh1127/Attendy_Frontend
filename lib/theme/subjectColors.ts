import type { SubjectColor } from "@/lib/api/types";

export const subjectColorMap: Record<SubjectColor, { bar: string; text: string; tint: string }> = {
  verdant: { bar: "bg-primary", text: "text-primary", tint: "bg-primary/10" },
  vermilion: { bar: "bg-secondary", text: "text-secondary", tint: "bg-secondary/10" },
  amber: { bar: "bg-accent", text: "text-accent-foreground", tint: "bg-accent/15" },
  indigo: { bar: "bg-[#5B5FE9]", text: "text-[#5B5FE9]", tint: "bg-[#5B5FE9]/10" },
  slate: { bar: "bg-muted", text: "text-muted", tint: "bg-surface-muted" },
};
