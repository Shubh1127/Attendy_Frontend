"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, ScanFace, Zap } from "lucide-react";
import { RoleGate } from "@/components/layout/RoleGate";
import { StatTile } from "@/components/dashboard/StatTile";
import { Skeleton, SkeletonRow } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Notice } from "@/components/ui/Notice";
import { Button } from "@/components/ui/Button";
import { endpoints } from "@/lib/api/endpoints";
import { useSession } from "@/lib/hooks/useSession";
import type { AttendanceSummary, Subject } from "@/lib/api/types";
import { formatPercent } from "@/lib/utils/format";
import { subjectColorMap } from "@/lib/theme/subjectColors";
import { cn } from "@/lib/utils/cn";

export default function TeacherAttendancePage() {
  return (
    <RoleGate role="teacher">
      <TeacherAttendance />
    </RoleGate>
  );
}

function TeacherAttendance() {
  const { session } = useSession();
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [summaries, setSummaries] = useState<AttendanceSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    async function load() {
      const [subjectsRes, summaryRes] = await Promise.all([
        endpoints.listSubjects(session!.token),
        endpoints.getAttendanceSummary(session!.token),
      ]);
      if (cancelled) return;
      if (!subjectsRes.ok) { setError("Couldn't load sessions data."); return; }
      setSubjects(subjectsRes.data);
      if (summaryRes.ok) setSummaries(summaryRes.data);
    }

    load();
    return () => { cancelled = true; };
  }, [session]);

  const handleStart = async (subjectId: string) => {
    if (!session) return;
    setOpeningId(subjectId);
    const res = await endpoints.openAttendanceSession(subjectId, session.token);
    setOpeningId(null);
    if (res.ok) {
      router.push(`/teacher/attendance/${res.data.id}/review`);
    } else {
      setError("Couldn't open a session. Try again.");
    }
  };

  const totalSessions = summaries?.reduce((s, r) => s + r.totalSessions, 0);
  const avgRate =
    summaries && summaries.length
      ? summaries.reduce((s, r) => s + r.rate, 0) / summaries.length
      : undefined;

  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="font-mono text-eyebrow uppercase text-muted">Roll call</p>
        <h1 className="font-display text-display-md font-medium text-foreground">Sessions</h1>
      </motion.div>

      {error && <Notice tone="error" title="Something went wrong" description={error} />}

      <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
        {summaries ? (
          <>
            <StatTile label="Sessions taken" value={`${totalSessions ?? 0}`} icon={ScanFace} />
            <StatTile
              label="Avg. attendance"
              value={avgRate !== undefined ? formatPercent(avgRate) : "—"}
              trend={avgRate !== undefined ? (avgRate >= 0.85 ? "up" : "down") : "flat"}
            />
            <StatTile label="Subjects running" value={`${subjects?.length ?? 0}`} />
          </>
        ) : (
          <>
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </>
        )}
      </div>

      {/* Start a new session */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-medium text-foreground">Start a new session</h2>

        {subjects === null ? (
          <div className="rounded-lg border border-border bg-surface px-5">
            <SkeletonRow /><SkeletonRow /><SkeletonRow />
          </div>
        ) : subjects.length === 0 ? (
          <EmptyState
            icon={ScanFace}
            title="No subjects to run"
            description="Create subjects under the Subjects tab first, then come back here to open sessions."
          />
        ) : (
          <div className="rounded-lg border border-border bg-surface px-5">
            {subjects.map((s) => {
              const palette = subjectColorMap[s.color];
              const summary = summaries?.find((r) => r.subjectId === s.id);
              return (
                <div key={s.id} className="ruled-row flex flex-wrap items-center justify-between gap-3 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={cn("h-8 w-1 rounded-full shrink-0", palette.bar)} aria-hidden />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                      <p className="font-mono text-xs text-muted">
                        {s.code} · {summary ? `${formatPercent(summary.rate)} overall` : s.schedule}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    leftIcon={<Zap className="h-3.5 w-3.5" />}
                    isLoading={openingId === s.id}
                    onClick={() => handleStart(s.id)}
                  >
                    Open session
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Historical sessions list (simulated from summaries) */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-medium text-foreground">Past sessions</h2>

        {summaries === null ? (
          <div className="rounded-lg border border-border bg-surface px-5">
            <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
          </div>
        ) : !summaries.length ? null : (
          <div className="rounded-lg border border-border bg-surface px-5">
            {/* Simulated session rows — real API would return a sessions list */}
            {summaries.flatMap((s, si) =>
              [
                { date: "21 Jun 2026", present: Math.round(s.present * 0.35), total: Math.round(s.totalSessions * 0.35) },
                { date: "19 Jun 2026", present: Math.round(s.present * 0.32), total: Math.round(s.totalSessions * 0.32) },
              ].map((row, ri) => (
                <Link
                  key={`${s.subjectId}-${ri}`}
                  href={`/teacher/attendance/sess_today/review`}
                  className="ruled-row flex items-center justify-between gap-4 py-4 group hover:bg-surface-muted -mx-5 px-5 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.subjectName}</p>
                    <p className="font-mono text-xs text-muted">{row.date}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="hidden sm:inline">{row.present} present of {s.totalSessions} students</span>
                    <ChevronRight className="h-4 w-4 text-muted group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
