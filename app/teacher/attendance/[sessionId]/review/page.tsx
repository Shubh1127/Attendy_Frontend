"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, CheckCircle2, ScanFace, Mic } from "lucide-react";
import Link from "next/link";
import { RoleGate } from "@/components/layout/RoleGate";
import { Stamp } from "@/components/ui/Stamp";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { endpoints } from "@/lib/api/endpoints";
import { useSession } from "@/lib/hooks/useSession";
import type { AttendanceEntry, AttendanceSession, AttendanceStatus } from "@/lib/api/types";
import { formatConfidence } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export default function AttendanceReviewPage() {
  return (
    <RoleGate role="teacher">
      <ReviewPage />
    </RoleGate>
  );
}

const STATUS_OPTIONS: AttendanceStatus[] = ["present", "absent", "late", "excused"];

type EntryOverride = { id: string; status: AttendanceStatus };

function ReviewPage() {
  // const params = useParams<{ sessionId: number }>();
  const { session } = useSession();
  const router = useRouter();

  const [attendanceSession, setAttendanceSession] = useState<AttendanceSession | null>(null);
  const [overrides, setOverrides] = useState<Record<string, AttendanceStatus>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // useEffect(() => {
  //   if (!session || !params.sessionId) return;
  //   let cancelled = false;

  //   endpoints.getAttendanceSession(params.sessionId, session.token).then((res) => {
  //     if (cancelled) return;
  //     if (!res.ok) { setLoadError("Couldn't load the attendance session."); return; }
  //     setAttendanceSession(res.data);
  //     // Seed overrides from biometric results so teacher sees the initial state
  //     const initial: Record<string, AttendanceStatus> = {};
  //     res.data.entries.forEach((e) => { initial[e.id] = e.status; });
  //     setOverrides(initial);
  //   });

  //   return () => { cancelled = true; };
  // }, [session, params.sessionId]);

  const handleOverride = (entryId: string, status: AttendanceStatus) => {
    setOverrides((prev) => ({ ...prev, [entryId]: status }));
  };

  const handleConfirm = async () => {
    if (!session || !attendanceSession) return;
    setSubmitting(true);
    setSubmitError(null);

    // const entries: EntryOverride[] = attendanceSession.entries.map((e) => ({
    //   id: e.id,
    //   status: overrides[e.id] ?? e.status,
    // }));

    // const res = await endpoints.reviewAttendanceSession(attendanceSession.id, entries, session.token);
    // setSubmitting(false);

    // if (!res.ok) {
    //   setSubmitError("Couldn't submit the session. Please try again.");
    //   return;
    // }
    // setConfirmed(true);
  };

  // const presentCount = attendanceSession
  //   ? attendanceSession.entries.filter((e) => (overrides[e.id] ?? e.status) === "present").length
  //   : 0;

  if (confirmed) {
    // return <ConfirmedView sessionName={attendanceSession?.subjectName ?? "Session"} router={router} />;
    return <ConfirmedView sessionName={"Machine Learning"} router={router} />;
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
            <p className="font-mono text-eyebrow uppercase text-muted">Review & confirm</p>
            <h1 className="font-display text-display-md font-medium text-foreground">
              {/* {attendanceSession?.subjectName ?? "Loading session…"} */}
              <h1>Machine Learning</h1>
            </h1>
            {/* {attendanceSession && (
              <p className="text-sm text-muted mt-1">
                {attendanceSession.date} · Opened at {attendanceSession.openedAt} ·{" "}
                <span className="font-medium text-foreground">{presentCount} present</span> of{" "}
                {attendanceSession.entries.length}
              </p>
            )} */}
            <h2>5/7/2026 . Opened at 9:00 AM</h2>
            <br />
            <h2>3 present of 30</h2>
          </div>
          <Button
            leftIcon={<CheckCircle2 className="h-4 w-4" />}
            isLoading={submitting}
            disabled={!attendanceSession}
            onClick={handleConfirm}
          >
            Confirm & close
          </Button>
        </div>
      </motion.div>

      {loadError && <Notice tone="error" title="Load failed" description={loadError} />}
      {submitError && <Notice tone="error" title="Submission failed" description={submitError} />}

      <Notice
        tone="info"
        title="Biometric marks applied — review before closing"
        description="Face and voice recognition has pre-marked the register. Override any row by tapping a different status. Once you confirm, the session closes and marks are locked."
      />

      <div className="rounded-lg border border-border bg-surface">
        <div className="flex items-center gap-4 border-b border-border px-5 py-3">
          <p className="flex-1 text-xs font-medium uppercase tracking-[0.1em] text-muted">Student</p>
          <p className="w-32 text-right text-xs font-medium uppercase tracking-[0.1em] text-muted hidden sm:block">Biometric</p>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted">Mark</p>
        </div>

        {!attendanceSession ? (
          <div className="px-5">
            {[0, 1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)}
          </div>
        ) : (
          <div className="px-5">
            {/* {attendanceSession.entries.map((entry, i) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                currentStatus={overrides[entry.id] ?? entry.status}
                index={i}
                onOverride={(status) => handleOverride(entry.id, status)}
              />
            ))} */}
          </div>
        )}
      </div>

      {/* Sticky confirm bar on mobile */}
      {attendanceSession && (
        <div className="fixed inset-x-0 bottom-16 z-20 flex justify-center md:hidden">
          <div className="mx-5 w-full max-w-sm rounded-lg border border-border bg-surface shadow-lift px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-muted">
              {/* <span className="font-medium text-foreground">{presentCount}</span> of{" "}
              {attendanceSession.entries.length} present */}
              <span className="font-medium text-foreground">3</span> of 30 present
            </p>
            <Button
              size="sm"
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
              isLoading={submitting}
              onClick={handleConfirm}
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
      transition={{ duration: 0.25, delay: 0.02 * index, ease: [0.16, 1, 0.3, 1] }}
      className="ruled-row flex flex-wrap items-center gap-4 py-3.5"
    >
      {/* Student */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* <Avatar name={entry.studentName} size="sm" /> */}
        <div className="min-w-0">
          <p className={cn("text-sm font-medium truncate", isDirty ? "text-accent-foreground" : "text-foreground")}>
            {/* {entry.studentName} */}
        <h2>Shubham</h2>
          </p>
          {/* <p className="font-mono text-xs text-muted">{entry.rollNumber}</p> */}
          <p className="font-mono text-xs text-muted">231302075</p>
        </div>
      </div>

      {/* Biometric confidence */}
      <div className="hidden sm:flex w-32 flex-col items-end gap-1 text-right">
        {entry.method ? (
          <>
            <div className="flex items-center gap-1 text-xs text-muted">
              {entry.method === "face"
                ? <ScanFace className="h-3 w-3" />
                : <Mic className="h-3 w-3" />}
              <span className="capitalize">{entry.method}</span>
            </div>
            {/* {entry.confidence !== undefined && (
              // <p className="font-mono text-[11px] text-muted">{formatConfidence(entry.confidence)}</p>
            )} */}
            <p className="font-mono text-[11px] text-muted">Confidence: 0.85</p>
          </>
        ) : (
          <p className="text-xs text-muted">—</p>
        )}
      </div>

      {/* Override picker */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onOverride(s)}
            aria-label={`Mark ${entry.studentName} ${s}`}
            aria-pressed={currentStatus === s}
            className={cn(
              "transition-opacity",
              currentStatus === s ? "opacity-100" : "opacity-25 hover:opacity-70"
            )}
          >
            <Stamp status={s} />
          </button>
        ))} */}

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
        <h2 className="font-display text-display-md font-medium text-foreground">Register closed</h2>
        <p className="text-sm text-muted max-w-sm">
          The session for <span className="font-medium text-foreground">{sessionName}</span> has been
          confirmed and locked. Students can see their marks in their attendance view.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push("/teacher/attendance")}>
          Back to Sessions
        </Button>
        <Button onClick={() => router.push("/teacher/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
