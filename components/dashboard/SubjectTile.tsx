import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import type { Subject } from "@/lib/api/types";

interface SubjectTileProps {
  subject: Subject;
  href: string;
}

export function SubjectTile({
  subject,
  href,
}: SubjectTileProps) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-border bg-surface p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-lg"
    >
      <div className="flex items-start justify-between">

        <div className="space-y-1">

          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            {subject.subject_code}
          </p>

          <h3 className="font-display text-xl font-semibold text-foreground">
            {subject.name}
          </h3>

        </div>

        <BookOpen
          className="text-primary"
          size={26}
        />

      </div>

      <div className="mt-6 flex items-center justify-between">

        <div>

          <p className="text-xs text-muted">
            Section
          </p>

          <p className="font-medium">
            {subject.section}
          </p>

        </div>

        <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">

          Open

          <ArrowUpRight
            className="h-4 w-4"
          />

        </span>

      </div>

    </Link>
  );
}