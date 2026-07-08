"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, Clock3, ScanFace, Zap } from "lucide-react";
import { RoleGate } from "@/components/layout/RoleGate";
import { StatTile } from "@/components/dashboard/StatTile";
import { Skeleton, SkeletonRow } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Notice } from "@/components/ui/Notice";
import { Button } from "@/components/ui/Button";
import { endpoints } from "@/lib/api/endpoints";
import { useSession } from "@/lib/hooks/useSession";
import type {
  AttendanceSessionSummary,
  AttendanceSummary,
  Subject,
  TeacherActiveAttendanceSession,
} from "@/lib/api/types";
import { formatPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const SESSION_DURATION_MS = 60 * 60 * 1000;

function formatRemainingTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

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
  const [activeSessions, setActiveSessions] = useState<
    TeacherActiveAttendanceSession[] | null
  >(null);
  const [pastSessions, setPastSessions] = useState<AttendanceSessionSummary[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    async function load() {
      const [subjectsRes, summaryRes, activeRes, sessionsRes] = await Promise.all([
        endpoints.getSubjects(session!.token),
        endpoints.getAttendanceSummary(session!.token),
        endpoints.getTeacherActiveAttendanceSessions(session!.token),
        endpoints.getAttendanceSessions(session!.token),
      ]);
      if (cancelled) return;
      if (!subjectsRes.ok) {
        setError("Couldn't load sessions data.");
        return;
      }
      setSubjects(subjectsRes.data.subjects);
      if (summaryRes.ok) setSummaries(summaryRes.data.attendance);
      if (activeRes.ok) setActiveSessions(activeRes.data.sessions);
      if (sessionsRes.ok) setPastSessions(sessionsRes.data.sessions);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [session]);

  const activeBySubjectId = useMemo(() => {
    const map = new Map<number, TeacherActiveAttendanceSession>();
    activeSessions?.forEach((row) => map.set(row.subject_id, row));
    return map;
  }, [activeSessions]);

  const handleStart = async (subjectId: number) => {
    if (!session) return;

    const active = activeBySubjectId.get(subjectId);
    if (active) {
      router.push(`/teacher/attendance/${active.session_id}/review`);
      return;
    }

    setOpeningId(String(subjectId));
    setError(null);
    const res = await endpoints.createAttendanceSession(session.token, subjectId);
    setOpeningId(null);
    if (res.ok) {
      router.push(`/teacher/attendance/${res.data.session.session_id}/review`);
    } else if (res.error.message.toLowerCase().includes("already open")) {
      const refresh = await endpoints.getTeacherActiveAttendanceSessions(session.token);
      if (refresh.ok) {
        setActiveSessions(refresh.data.sessions);
        const match = refresh.data.sessions.find((row) => row.subject_id === subjectId);
        if (match) {
          router.push(`/teacher/attendance/${match.session_id}/review`);
          return;
        }
      }
      setError("This subject already has an open session. Refresh and try again.");
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

      <section className="space-y-4">
        <h2 className="font-display text-xl font-medium text-foreground">Active sessions</h2>
        <p className="text-sm text-muted -mt-2">
          Resume an open roll call instead of starting a duplicate session for the same subject.
        </p>

        {activeSessions === null ? (
          <div className="rounded-lg border border-border bg-surface px-5">
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : activeSessions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface px-5 py-8 text-center">
            <p className="text-sm text-muted">No active sessions right now.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-primary/30 bg-primary/5 px-5">
            {activeSessions.map((sessionRow) => {
              const openedAt = Date.parse(sessionRow.opened_at);
              const remainingMs = Number.isNaN(openedAt)
                ? null
                : Math.max(0, openedAt + SESSION_DURATION_MS - now);

              return (
                <div
                  key={sessionRow.session_id}
                  className="ruled-row flex flex-wrap items-center justify-between gap-3 py-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <p className="text-sm font-medium text-foreground truncate">
                        {sessionRow.subject_name ?? "Unknown subject"}
                      </p>
                    </div>
                    <p className="font-mono text-xs text-muted mt-0.5">
                      {sessionRow.subject_code} · {sessionRow.section}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      Opened{" "}
                      {new Date(sessionRow.opened_at).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      · {sessionRow.checked_in_count} of {sessionRow.total_students} checked in
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {remainingMs !== null && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted">
                        <Clock3 className="h-3.5 w-3.5" />
                        {formatRemainingTime(remainingMs)} left
                      </span>
                    )}
                    <Button
                      size="sm"
                      leftIcon={<ScanFace className="h-3.5 w-3.5" />}
                      onClick={() =>
                        router.push(
                          `/teacher/attendance/${sessionRow.session_id}/review`,
                        )
                      }
                    >
                      Resume session
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

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

      <section className="space-y-4">
        <h2 className="font-display text-xl font-medium text-foreground">Start a new session</h2>

        {subjects === null ? (
          <div className="rounded-lg border border-border bg-surface px-5">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
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
              const active = activeBySubjectId.get(s.subject_id);

              return (
                <div
                  key={s.subject_id}
                  className={cn(
                    "ruled-row flex flex-wrap items-center justify-between gap-3 py-4",
                    active && "bg-primary/[0.03] -mx-5 px-5",
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                        {active && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                            Live
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-xs text-muted">
                        {s.subject_code} · {s.section}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={active ? "primary" : "outline"}
                    leftIcon={
                      active ? (
                        <ScanFace className="h-3.5 w-3.5" />
                      ) : (
                        <Zap className="h-3.5 w-3.5" />
                      )
                    }
                    isLoading={openingId === String(s.subject_id)}
                    onClick={() => handleStart(s.subject_id)}
                  >
                    {active ? "Resume session" : "Open session"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-medium text-foreground">Past sessions</h2>

        {pastSessions === null ? (
          <div className="rounded-lg border border-border bg-surface px-5">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : !pastSessions.length ? (
          <EmptyState
            icon={ScanFace}
            title="No closed sessions yet"
            description="Closed attendance sessions will appear here once you finish a roll call."
          />
        ) : (
          <div className="rounded-lg border border-border bg-surface px-5">
            {pastSessions.map((sessionRow) => (
              <Link
                key={sessionRow.session_id}
                href={`/teacher/attendance/${sessionRow.session_id}/review`}
                className="ruled-row flex items-center justify-between gap-4 py-4 group hover:bg-surface-muted -mx-5 px-5 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {sessionRow.subject_name ?? "Unknown subject"}
                  </p>
                  <p className="font-mono text-xs text-muted">
                    {new Date(sessionRow.closed_at ?? sessionRow.opened_at).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="hidden sm:inline">
                    Closed session #{sessionRow.session_id}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
