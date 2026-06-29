import { cn } from "@/lib/utils/cn";
import { initials } from "@/lib/utils/format";

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover bg-surface-muted", sizeClasses[size], className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-primary/12 font-display font-semibold text-primary",
        sizeClasses[size],
        className
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
