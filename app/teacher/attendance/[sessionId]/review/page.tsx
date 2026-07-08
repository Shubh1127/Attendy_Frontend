"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  CheckCircle2,
  Clock3,
  Mic,
  RefreshCw,
  ScanFace,
} from "lucide-react";
import Link from "next/link";
import { RoleGate } from "@/components/layout/RoleGate";
import { Stamp } from "@/components/ui/Stamp";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { endpoints } from "@/lib/api/endpoints";
import { useSession } from "@/lib/hooks/useSession";
import type {
  AttendanceEntry,
  AttendanceEntryUpdate,
  AttendanceSession3,
  AttendanceStatus,
} from "@/lib/api/types";
import { formatConfidence } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const STATUS_OPTIONS: AttendanceStatus[] = [
  "present",
  "absent",
  "late",
  "excused",
];
const SESSION_DURATION_MS = 60 * 60 * 1000;

function formatRemainingTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function AttendanceReviewPage() {
  return (
    <RoleGate role="teacher">
      <ReviewPage />
    </RoleGate>
  );
}

function ReviewPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = Number(params.sessionId);
  const { session } = useSession();
  const router = useRouter();

  const [attendanceSession, setAttendanceSession] =
    useState<AttendanceSession3 | null>(null);
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [overrides, setOverrides] = useState<Record<number, AttendanceStatus>>(
    {},
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [now, setNow] = useState(Date.now());
  const autoCloseTriggeredRef = useRef(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remainingMs = useMemo(() => {
    if (!attendanceSession) return null;

    const openedAt = Date.parse(attendanceSession.opened_at);
    if (Number.isNaN(openedAt)) return null;

    return Math.max(0, openedAt + SESSION_DURATION_MS - now);
  }, [attendanceSession, now]);

  const checkedInCount = useMemo(
    () =>
      entries.filter((entry) => {
        const currentStatus = overrides[entry.student_id] ?? entry.status;
        return (
          currentStatus === "present" ||
          currentStatus === "late" ||
          currentStatus === "excused"
        );
      }).length,
    [entries, overrides],
  );

  const loadSession = async (silent = false) => {
    if (!session || Number.isNaN(sessionId)) return;

    if (silent) {
      setSyncing(true);
    } else {
      setLoading(true);
    }

    const res = await endpoints.getAttendanceSession(sessionId, session.token);

    if (silent) {
      setSyncing(false);
    } else {
      setLoading(false);
    }

    if (!res.ok) {
      if (!silent) {
        setLoadError("Couldn't load the attendance session.");
      }
      return;
    }

    setLoadError(null);
    setAttendanceSession(res.data.session);
    setEntries(res.data.entries);

    if (res.data.session.status === "closed") {
      setConfirmed(true);
    }
  };

  const closeSession = async () => {
    if (!session || !attendanceSession || Number.isNaN(sessionId)) return;

    setSubmitting(true);
    setSubmitError(null);

    const payload: AttendanceEntryUpdate[] = entries.map((entry) => {
  const status = overrides[entry.student_id] ?? entry.status;

  return {
    studentId: entry.student_id,
    status: status === "not_marked" ? "absent" : status,
  };
});

    const res = await endpoints.updateAttendanceSession(
      sessionId,
      payload,
      session.token,
    );
    setSubmitting(false);

    if (!res.ok) {
      setSubmitError("Couldn't submit the session. Please try again.");
      autoCloseTriggeredRef.current = false;
      return;
    }

    setAttendanceSession((prev) =>
      prev
        ? {
            ...prev,
            status: "closed",
            closed_at: res.data.session.closed_at ?? new Date().toISOString(),
          }
        : prev,
    );
    setConfirmed(true);
  };

  useEffect(() => {
    if (!session || Number.isNaN(sessionId)) {
      if (Number.isNaN(sessionId)) {
        setLoadError("Invalid session ID.");
      }
      setLoading(false);
      return;
    }

    let cancelled = false;

    const run = async (silent = false) => {
      if (cancelled) return;
      await loadSession(silent);
    };

    void run(false);

    const interval = window.setInterval(() => {
      if (!cancelled && !confirmed) {
        void run(true);
      }
    }, 10_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [session, sessionId, confirmed]);

  useEffect(() => {
    if (!attendanceSession || confirmed || loading) return;

    if (remainingMs === null || remainingMs > 0) {
      autoCloseTriggeredRef.current = false;
      return;
    }

    if (autoCloseTriggeredRef.current) return;

    autoCloseTriggeredRef.current = true;
    void closeSession();
  }, [attendanceSession, confirmed, loading, remainingMs]);

  const handleOverride = (studentId: number, status: AttendanceStatus) => {
    setOverrides((prev) => ({ ...prev, [studentId]: status }));
  };

  if (confirmed) {
    return (
      <ConfirmedView
        sessionName={attendanceSession?.subjects?.name ?? "Attendance session"}
        router={router}
      />
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-4"
      >
        <Link
          href="/teacher/attendance"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Sessions
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-eyebrow uppercase text-muted">
              Review & confirm
            </p>
            <h1 className="font-display text-display-md font-medium text-foreground">
              {attendanceSession?.subjects?.name ?? "Loading session…"}
            </h1>
            {attendanceSession && (
              <p className="mt-1 text-sm text-muted">
                {new Date(attendanceSession.opened_at).toLocaleDateString(
                  "en-GB",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  },
                )}{" "}
                · Opened at{" "}
                {new Date(attendanceSession.opened_at).toLocaleTimeString(
                  "en-GB",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}{" "}
                ·{" "}
                <span className="font-medium text-foreground">
                  {checkedInCount} checked in
                </span>{" "}
                of {entries.length}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5">
                <Clock3 className="h-3.5 w-3.5" />
                {remainingMs === null
                  ? "--:--"
                  : formatRemainingTime(remainingMs)}{" "}
                remaining
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5">
                {syncing ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ScanFace className="h-3.5 w-3.5" />
                )}
                {syncing ? "Syncing attendance" : "Auto refresh every 10s"}
              </span>
            </div>
          </div>
            <Button
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
              isLoading={submitting}
              onClick={closeSession}
            >
              Confirm & Close
            </Button>
        
        </div>
      </motion.div>

      {loading && (
        <Notice
          tone="info"
          title="Loading attendance session"
          description="Fetching the latest student marks."
        />
      )}
      {loadError && (
        <Notice tone="error" title="Load failed" description={loadError} />
      )}
      {submitError && (
        <Notice
          tone="error"
          title="Submission failed"
          description={submitError}
        />
      )}

      <Notice
        tone="info"
        title="Biometric marks applied"
        description="Face and voice recognition pre-marks the register. Every 10 seconds the latest attendance logs are reloaded so you can watch the session update in real time. The first 10 minutes count as present, later marks count as late, and the session auto-closes after 1 hour."
      />

      <div className="rounded-lg border border-border bg-surface">
        <div className="flex items-center gap-4 border-b border-border px-5 py-3">
          <p className="flex-1 text-xs font-medium uppercase tracking-[0.1em] text-muted">
            Student
          </p>
          <p className="w-32 text-right text-xs font-medium uppercase tracking-[0.1em] text-muted hidden sm:block">
            Biometric
          </p>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted">
            Mark
          </p>
        </div>

        {!attendanceSession || loading ? (
          <div className="px-5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : (
          <div className="px-5">
            {entries.map((entry, i) => (
              <EntryRow
                key={entry.student_id}
                entry={entry}
                currentStatus={overrides[entry.student_id] ?? entry.status}
                index={i}
                onOverride={(status) =>
                  handleOverride(entry.student_id, status)
                }
              />
            ))}
          </div>
        )}
      </div>

      {attendanceSession && attendanceSession.status !== "closed" && (
        <div className="fixed inset-x-0 bottom-16 z-20 flex justify-center md:hidden">
          <div className="mx-5 w-full max-w-sm rounded-lg border border-border bg-surface shadow-lift px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-muted">
              <span className="font-medium text-foreground">
                {checkedInCount}
              </span>{" "}
              of {entries.length} checked in
            </p>
            <Button
              size="sm"
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
              isLoading={submitting}
              onClick={closeSession}
            >
              Confirm
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function EntryRow({
  entry,
  currentStatus,
  index,
  onOverride,
}: {
  entry: AttendanceEntry;
  currentStatus: AttendanceStatus;
  index: number;
  onOverride: (status: AttendanceStatus) => void;
}) {
  const isDirty = currentStatus !== entry.status;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.25,
        delay: 0.02 * index,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="ruled-row flex flex-wrap items-center gap-4 py-3.5"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar name={entry.student.name} size="sm" />
        <div className="min-w-0">
          <p
            className={cn(
              "text-sm font-medium truncate",
              isDirty ? "text-accent-foreground" : "text-foreground",
            )}
          >
            {entry.student.name}
          </p>
          <p className="font-mono text-xs text-muted">
            {entry.student.enrollment_number}
          </p>
        </div>
      </div>

      <div className="hidden sm:flex w-32 flex-col items-end gap-1 text-right">
        {entry.method ? (
          <>
            <div className="flex items-center gap-1 text-xs text-muted">
              {entry.method === "face" ? (
                <ScanFace className="h-3 w-3" />
              ) : (
                <Mic className="h-3 w-3" />
              )}
              <span className="capitalize">{entry.method}</span>
            </div>
            {entry.confidence !== null && (
              <p className="font-mono text-[11px] text-muted">
                {formatConfidence(entry.confidence)}
              </p>
            )}
          </>
        ) : (
          <p className="text-xs text-muted">—</p>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => onOverride(status)}
            aria-label={`Mark ${entry.student.name} ${status}`}
            aria-pressed={currentStatus === status}
            className={cn(
              "transition-opacity",
              currentStatus === status
                ? "opacity-100"
                : "opacity-30 hover:opacity-70",
            )}
          >
            <Stamp status={status} />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function ConfirmedView({
  sessionName,
  router,
}: {
  sessionName: string;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <Stamp status="present" className="text-2xl px-6 py-2" />
      </motion.div>
      <div className="space-y-2">
        <h2 className="font-display text-display-md font-medium text-foreground">
          Register closed
        </h2>
        <p className="text-sm text-muted max-w-sm">
          The session for{" "}
          <span className="font-medium text-foreground">{sessionName}</span> has
          been confirmed and locked. Students can see their marks in their
          attendance view.
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/teacher/attendance")}
        >
          Back to Sessions
        </Button>
        <Button onClick={() => router.push("/teacher/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
