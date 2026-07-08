"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarClock, CheckCircle2, Clock3, ScanFace } from "lucide-react";
import Link from "next/link";
import { RoleGate } from "@/components/layout/RoleGate";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Notice } from "@/components/ui/Notice";
import { StatTile } from "@/components/dashboard/StatTile";
import { Button } from "@/components/ui/Button";
import { endpoints } from "@/lib/api/endpoints";
import { useSession } from "@/lib/hooks/useSession";
import type { AttendanceSummary, StudentSubjectAttendanceSession, getSubject } from "@/lib/api/types";
import { formatPercent } from "@/lib/utils/format";

export default function StudentSubjectDetailPage() {
  return (
    <RoleGate role="student">
      <StudentSubjectDetail />
    </RoleGate>
  );
}

function StudentSubjectDetail() {
  const params = useParams<{ id: string }>();
  const subjectId = Number(params.id);
  const { session } = useSession();

  const [subject, setSubject] = useState<getSubject | null>(null);
  const [attendance, setAttendance] = useState<AttendanceSummary[]>([]);
  const [sessions, setSessions] = useState<StudentSubjectAttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session || Number.isNaN(subjectId)) return;

    const token = session.token;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const [subjectRes, attendanceRes, sessionsRes] = await Promise.all([
        endpoints.getSubject(token, subjectId),
        endpoints.getAttendanceSummary(token),
        endpoints.getStudentSubjectAttendanceSessions(token, subjectId),
      ]);

      if (cancelled) return;

      if (!subjectRes.ok) {
        setError(subjectRes.error.message || "Couldn't load subject details.");
        setLoading(false);
        return;
      }

      setSubject(subjectRes.data);

      if (attendanceRes.ok) {
        setAttendance(attendanceRes.data.attendance.filter((item) => item.subject_id === subjectId));
      }

      if (sessionsRes.ok) {
        setSessions(sessionsRes.data.sessions);
      } else {
        setError(sessionsRes.error.message || "Couldn't load attendance sessions.");
      }

      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [session, subjectId]);

  const summary = attendance[0];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-4"
      >
        <Link
          href="/student/subjects"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Subjects
        </Link>

        {subject ? (
          <div className="space-y-2">
            <p className="font-mono text-eyebrow uppercase text-primary">{subject.subject_code}</p>
            <h1 className="font-display text-display-md font-medium text-foreground">{subject.name}</h1>
            <p className="text-sm text-muted">Section {subject.section}</p>
          </div>
        ) : (
          <>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-12 w-72" />
            <Skeleton className="h-5 w-28" />
          </>
        )}
      </motion.div>

      {error && <Notice tone="error" title="Unable to load subject" description={error} />}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : (
          <>
            <StatTile label="Total classes" value={`${summary?.total ?? 0}`} icon={CalendarClock} />
            <StatTile label="Present" value={`${summary?.present ?? 0}`} icon={CheckCircle2} />
            <StatTile label="Late" value={`${summary?.late ?? 0}`} icon={Clock3} />
            <StatTile
              label="Attendance"
              value={summary ? formatPercent((summary.percentage ?? 0) / 100) : "—"}
              icon={ScanFace}
            />
          </>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-medium text-foreground">Closed sessions</h2>
            <p className="text-sm text-muted">Sessions in the last 10-minute window for this subject.</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 rounded-xl border border-border bg-surface p-5">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No closed sessions yet"
            description="When your teacher closes an attendance session for this subject, it will appear here."
          />
        ) : (
          <div className="space-y-3">
            {sessions.map((sessionRow) => (
              <div key={sessionRow.session_id} className="rounded-xl border border-border bg-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {new Date(sessionRow.opened_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted">
                      Opened at {new Date(sessionRow.opened_at).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {sessionRow.closed_at
                        ? ` · Closed at ${new Date(sessionRow.closed_at).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {sessionRow.marked ? `Marked ${sessionRow.mark_status}` : "Not marked"}
                    </p>
                    <p className="text-xs text-muted">Session #{sessionRow.session_id}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {session && !loading && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-base font-medium text-foreground">Need to check in?</p>
              <p className="text-sm text-muted">
                If your teacher has started attendance, it will also appear on your dashboard while the session is open.
              </p>
            </div>
            <Button onClick={() => (window.location.href = "/student/dashboard")}>Go to dashboard</Button>
          </div>
        </div>
      )}
    </div>
  );
}
