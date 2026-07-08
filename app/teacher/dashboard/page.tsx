"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, ScanFace, Users, Zap } from "lucide-react";
import { RoleGate } from "@/components/layout/RoleGate";
import { StatTile } from "@/components/dashboard/StatTile";
import { SubjectTile } from "@/components/dashboard/SubjectTile";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Notice } from "@/components/ui/Notice";
import { Button } from "@/components/ui/Button";
import { endpoints } from "@/lib/api/endpoints";
import { useSession } from "@/lib/hooks/useSession";
import type { Subject, TeacherActiveAttendanceSession } from "@/lib/api/types";
import { formatPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export default function TeacherDashboardPage() {
  return (
    <RoleGate role="teacher">
      <TeacherDashboard />
    </RoleGate>
  );
}

function TeacherDashboard() {
  const { session } = useSession();
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [activeSessions, setActiveSessions] = useState<
    TeacherActiveAttendanceSession[] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<number | null>(null);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    Promise.all([
      endpoints.getSubjects(session.token),
      endpoints.getTeacherActiveAttendanceSessions(session.token),
    ]).then(([subjectsRes, activeRes]) => {
      if (cancelled) return;
      if (!subjectsRes.ok) {
        setError("Couldn't load your subjects. Try refreshing the page.");
        return;
      }
      setSubjects(subjectsRes.data.subjects);
      if (activeRes.ok) setActiveSessions(activeRes.data.sessions);
    });

    return () => {
      cancelled = true;
    };
  }, [session]);

  const activeBySubjectId = useMemo(() => {
    const map = new Map<number, TeacherActiveAttendanceSession>();
    activeSessions?.forEach((row) => map.set(row.subject_id, row));
    return map;
  }, [activeSessions]);

  const avgRate =
    subjects && subjects.length
      ? subjects.reduce((sum, s) => sum + (s.attendance_rate ?? 0), 0) / subjects.length
      : undefined;

  const handleStartSession = async (subjectId: number) => {
    if (!session) return;

    const active = activeBySubjectId.get(subjectId);
    if (active) {
      router.push(`/teacher/attendance/${active.session_id}/review`);
      return;
    }

    setOpeningId(subjectId);
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
      setError("This subject already has an open session. Go to Sessions to resume it.");
    } else {
      setError("Couldn't open a new session. Try again.");
    }
  };

  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-1"
      >
        <h1 className="font-display text-display-md font-medium text-foreground">
          Good to see you, {session?.user.name.split(" ").slice(-1)[0]}.
        </h1>
      </motion.div>

      {error && <Notice tone="error" title="Something went wrong" description={error} />}

      {activeSessions && activeSessions.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl font-medium text-foreground">Active sessions</h2>
            <Link
              href="/teacher/attendance"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all sessions
            </Link>
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/5 px-5">
            {activeSessions.map((sessionRow) => (
              <div
                key={sessionRow.session_id}
                className="ruled-row flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <p className="text-sm font-medium text-foreground">
                      {sessionRow.subject_name ?? "Unknown subject"}
                    </p>
                  </div>
                  <p className="font-mono text-xs text-muted mt-0.5">
                    {sessionRow.subject_code} · {sessionRow.section} ·{" "}
                    {sessionRow.checked_in_count} of {sessionRow.total_students} checked in
                  </p>
                </div>
                <Button
                  size="sm"
                  leftIcon={<ScanFace className="h-3.5 w-3.5" />}
                  onClick={() =>
                    router.push(`/teacher/attendance/${sessionRow.session_id}/review`)
                  }
                >
                  Resume session
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3"
      >
        {subjects ? (
          <>
            <StatTile label="Subjects taught" value={`${subjects.length}`} icon={BookOpen} />
            <StatTile
              label="Students enrolled"
              value={`${subjects.reduce((sum, s) => sum + (s.student_count ?? 0), 0)}`}
              icon={Users}
            />
            <StatTile
              label="Average attendance"
              value={avgRate !== undefined ? formatPercent(avgRate) : "—"}
              icon={ScanFace}
              trend={avgRate !== undefined && avgRate >= 0.85 ? "up" : "down"}
            />
          </>
        ) : (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        )}
      </motion.div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-medium text-foreground">Start today&apos;s roll call</h2>
          <Link href="/teacher/subjects" className="text-sm font-medium text-primary hover:underline">
            Manage subjects
          </Link>
        </div>

        {subjects === null ? (
          <div className="rounded-lg border border-border bg-surface px-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="ruled-row flex items-center justify-between gap-4 py-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-9 w-28 rounded-md" />
              </div>
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No subjects yet"
            description="Create your first subject to start opening face and voice attendance sessions."
            actionLabel="Create a subject"
          />
        ) : (
          <div className="rounded-lg border border-border bg-surface px-5">
            {subjects.map((subject) => {
              const active = activeBySubjectId.get(subject.subject_id);

              return (
                <div
                  key={subject.subject_id}
                  className={cn(
                    "ruled-row flex flex-wrap items-center justify-between gap-3 py-4",
                    active && "bg-primary/[0.03] -mx-5 px-5",
                  )}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{subject.name}</p>
                      {active && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                          Live
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-muted">
                      {subject.subject_code} · {subject.section}
                    </p>
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
                    isLoading={openingId === subject.subject_id}
                    onClick={() => handleStartSession(subject.subject_id)}
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
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-medium text-foreground">Your subjects</h2>
        </div>

        {subjects === null ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {subjects.map((subject, i) => (
              <motion.div
                key={subject?.subject_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
              >
                <SubjectTile subject={subject} href={`/teacher/subjects/${subject.subject_id}`} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
