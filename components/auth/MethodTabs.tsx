"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface TabOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function MethodTabs({
  options,
  defaultValue,
  children,
}: {
  options: TabOption[];
  defaultValue: string;
  children: (active: string) => React.ReactNode;
}) {
  const [active, setActive] = useState(defaultValue);

  return (
    <div>
      <div role="tablist" aria-label="Sign-in method" className="flex border-b border-border">
        {options.map((opt) => {
          const Icon = opt.icon;
          const selected = active === opt.value;
          return (
            <button
              key={opt.value}
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(opt.value)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-1.5 pb-3 text-sm font-medium transition-colors",
                selected ? "text-foreground" : "text-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {opt.label}
              {selected && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
      <div className="pt-7">{children(active)}</div>
    </div>
  );
}
