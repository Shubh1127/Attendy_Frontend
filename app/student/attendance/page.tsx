"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock } from "lucide-react";
import { RoleGate } from "@/components/layout/RoleGate";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Stamp } from "@/components/ui/Stamp";
import { EmptyState } from "@/components/ui/EmptyState";
import { Notice } from "@/components/ui/Notice";
import { endpoints } from "@/lib/api/endpoints";
import { useSession } from "@/lib/hooks/useSession";
import type {
  AttendanceSummary,
  StudentAttendanceSession,
} from "@/lib/api/types";

import { cn } from "@/lib/utils/cn";

export default function StudentAttendancePage() {
  return (
    <RoleGate role="student">
      <StudentAttendance />
    </RoleGate>
  );
}

function StudentAttendance() {
  const { session } = useSession();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceSummary[]>([]);
  const [sessions, setSessions] = useState<StudentAttendanceSession[]>([]);

  useEffect(() => {
    if (!session) return;

    loadAttendance();
  }, [session]);

  const loadAttendance = async () => {
    setLoading(true);
    setError(null);

    const [summaryRes, sessionsRes] = await Promise.all([
      endpoints.getAttendanceSummary(session!.token),
      endpoints.getStudentAttendanceSessions(session!.token),
    ]);

    if (!summaryRes.ok) {
      setError(summaryRes.error.message);
      setLoading(false);
      return;
    }

    if (!sessionsRes.ok) {
      setError(sessionsRes.error.message);
      setLoading(false);
      return;
    }

    setAttendance(summaryRes.data.attendance);
    setSessions(sessionsRes.data.sessions);

    setLoading(false);
  };

  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="font-mono text-eyebrow uppercase text-muted">
          Your record
        </p>
        <h1 className="font-display text-display-md font-medium text-foreground">
          Attendance
        </h1>
      </motion.div>

      {error && (
        <Notice tone="error" title="Something went wrong" description={error} />
      )}

      {/* Per-subject summary rings */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-medium">By Subject</h2>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
        ) : attendance.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No Attendance Yet"
            description="Your attendance will appear after your teacher starts taking attendance."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {attendance.map((item, i) => {
              const percentage = Math.max(0, Math.min(100, item.percentage));
              const status =
                item.present > 0
                  ? "present"
                  : item.late > 0
                    ? "late"
                    : item.excused > 0
                      ? "excused"
                      : item.absent > 0
                        ? "absent"
                        : "not_marked";

              return (
                <motion.div
                  key={item.subject_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: 0.05 * i,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex items-center gap-5 rounded-xl border border-border bg-surface p-5"
                >
                  <span
                    className={cn(
                      "h-full w-1 self-stretch rounded-full shrink-0",
                      status === "present"
                        ? "bg-primary"
                        : status === "late"
                          ? "bg-accent"
                          : "bg-secondary",
                    )}
                    aria-hidden
                  />
                  <ProgressRing
                    value={percentage / 100}
                    size={72}
                    strokeWidth={6}
                    indicatorClassName={
                      status === "present"
                        ? "text-primary"
                        : status === "late"
                          ? "text-accent"
                          : "text-secondary"
                    }
                  />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="truncate font-medium text-foreground">
                      {item.subject_name}
                    </p>
                    <p className="font-mono text-xs text-primary">
                      {item.subject_code}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                      <span>{item.total} classes</span>
                      <span>
                        {item.present} present · {item.late} late ·{" "}
                        {item.absent} absent
                      </span>
                    </div>
                    <Stamp status={status} className="mt-1" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Session-level log */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-medium text-foreground">
          Session log
        </h2>

        <p className="text-sm text-muted -mt-2">
          Every session your teacher has closed, with how you were marked.
        </p>

        {loading ? (
          <div className="rounded-lg border border-border bg-surface px-5">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No sessions yet"
            description="Your completed attendance sessions will appear here."
          />
        ) : (
          <div className="rounded-lg border border-border bg-surface px-5">
            {sessions.map((session) => (
              <div
                key={session.session_id}
                className="ruled-row flex items-center justify-between gap-4 py-3.5"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {session.subject_name}
                  </p>

                  <p className="font-mono text-xs text-muted">
                    {session.subject_code} •{" "}
                    {new Date(session.opened_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <Stamp status={session.mark_status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
