"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock3,
  ScanFace,
  CheckCircle,
  BarChart,
  CalendarClock,
} from "lucide-react";
import { RoleGate } from "@/components/layout/RoleGate";
import { StatTile } from "@/components/dashboard/StatTile";
import { Skeleton } from "@/components/ui/Skeleton";
import { FaceCapture } from "@/components/auth/FaceCapture";
import { Stamp } from "@/components/ui/Stamp";
// import { Skeleton, SkeletonRow } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Notice } from "@/components/ui/Notice";
import { Button } from "@/components/ui/Button";
import { endpoints } from "@/lib/api/endpoints";
import { useSession } from "@/lib/hooks/useSession";
import type {
  ActiveAttendanceSession,
  AttendanceSummary,
  OverallAttendance,
  StudentAttendanceSession,
  Subject,
  SubjectAttendance,
} from "@/lib/api/types";
// import { formatPercent } from "@/lib/utils/format";

export default function StudentDashboardPage() {
  return (
    <RoleGate role="student">
      <StudentDashboard />
    </RoleGate>
  );
}

function StudentDashboard() {
  const { session } = useSession();

  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [loading, setLoading] = useState(true);

  const [activeSessions, setActiveSessions] = useState<
    ActiveAttendanceSession[]
  >([]);

  const [activeLoading, setActiveLoading] = useState(true);

  const [activeError, setActiveError] = useState("");

  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null,
  );

  const [faceImage, setFaceImage] = useState<Blob | null>(null);

  const [checkInLoading, setCheckInLoading] = useState(false);

  const [checkInMessage, setCheckInMessage] = useState("");

  const [checkInError, setCheckInError] = useState("");

  const [now, setNow] = useState(Date.now());

  const [overallAttendance, setOverallAttendance] =
    useState<OverallAttendance | null>(null);
  const [overallError, setOverallError] = useState("");
  const [needsAttention, setNeedsAttention] = useState<SubjectAttendance[]>([]);
  const [subjectsAttendance, setSubjectsAttendance] = useState<
    SubjectAttendance[]
  >([]);

  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [errorAttendance, setErrorAttendance] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceSummary[]>([]);
  const [sessions, setSessions] = useState<StudentAttendanceSession[]>([]);

  useEffect(() => {
    if (!session) return;

    loadAttendance();
  }, [session]);

  const loadAttendance = async () => {
    setLoadingAttendance(true);
    setErrorAttendance(null);

    const [summaryRes, sessionsRes] = await Promise.all([
      endpoints.getAttendanceSummary(session!.token),
      endpoints.getStudentAttendanceSessions(session!.token),
    ]);

    if (!summaryRes.ok) {
      setErrorAttendance(summaryRes.error.message);
      setLoadingAttendance(false);
      return;
    }

    if (!sessionsRes.ok) {
      setErrorAttendance(sessionsRes.error.message);
      setLoadingAttendance(false);
      return;
    }

    setAttendance(summaryRes.data.attendance);
    setSessions(sessionsRes.data.sessions);

    setLoadingAttendance(false);
  };

  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!session) return;

    loadSubjects();
    loadActiveAttendance();
  }, [session]);

  const shouldPollActiveAttendance = useMemo(() => {
    if (activeSessions.length === 0) return true;
    return !activeSessions.every((sessionRow) => sessionRow.marked);
  }, [activeSessions]);

  useEffect(() => {
    if (!session || !shouldPollActiveAttendance) return;

    const timer = window.setInterval(() => {
      void loadActiveAttendance();
    }, 10_000);

    return () => window.clearInterval(timer);
  }, [session, shouldPollActiveAttendance]);

  const loadSubjects = async () => {
    setLoading(true);

    setError("");

    const response = await endpoints.getSubjects(session!.token);

    if (!response.ok) {
      setError(response.error.message);

      setLoading(false);

      return;
    }

    setSubjects(response.data.subjects);

    setLoading(false);
  };

  useEffect(() => {
    if (!session) return;
    void loadOverallAttendance();
  }, [session]);

  const loadOverallAttendance = async () => {
    if (!session) return;

    const response = await endpoints.getStudentOverallAttendance(session.token);
    if (!response.ok) {
  setOverallError(response.error.message);
  return;
}

    setOverallAttendance(response.data.overall);
    setSubjectsAttendance(response.data.subjects);
    setNeedsAttention(response.data.needs_attention);
  };
  const loadActiveAttendance = async () => {
    if (!session) return;

    setActiveLoading(true);

    setActiveError("");

    const response = await endpoints.getActiveAttendance(session.token);

    if (!response.ok) {
      setActiveError(response.error.message);
      setActiveLoading(false);
      return;
    }

    setActiveSessions(response.data.sessions);
    setActiveLoading(false);
  };

  const handleCheckIn = async () => {
    if (!session || !selectedSessionId || !faceImage) return;

    setCheckInLoading(true);
    setCheckInError("");
    setCheckInMessage("");

    const response = await endpoints.checkInAttendance(
      session.token,
      selectedSessionId,
      faceImage,
    );

    setCheckInLoading(false);

    if (!response.ok) {
      setCheckInError(response.error.message);
      return;
    }

    setCheckInMessage(response.data.message);
    setSelectedSessionId(null);
    setFaceImage(null);
    void loadActiveAttendance();
  };

  const formatRemaining = (openedAt: string) => {
    const endTime = new Date(openedAt).getTime() + 60 * 60 * 1000;
    const remainingMs = Math.max(0, endTime - now);
    const minutes = Math.floor(remainingMs / 60000)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor((remainingMs % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };
  //   return () => {
  //     cancelled = true;
  //   };
  // }, [session]);

  // const overallRate =
  //   summaries && summaries.length
  //     ? summaries.reduce((sum, s) => sum + s.rate, 0) / summaries.length
  //     : undefined;
  // const totalPresent = summaries?.reduce((sum, s) => sum + s.present, 0);
  // const lowestSubject = summaries
  //   ? [...summaries].sort((a, b) => a.rate - b.rate)[0]
  //   : undefined;

  return (
    <div className="space-y-10">
      {/* ---------------- Header ---------------- */}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2"
      >
        <p className="font-mono text-eyebrow uppercase text-muted">
          Student Dashboard
        </p>

        <h1 className="font-display text-display-md font-medium text-foreground">
          Welcome, {session?.user.name}
        </h1>

        <p className="text-muted">
          Manage your subjects and track your attendance.
        </p>
      </motion.div>

      {/* ---------------- Error ---------------- */}

      {error && (
        <Notice
          tone="error"
          title="Unable to load dashboard"
          description={error}
        />
      )}

      {/* ---------------- Stats ---------------- */}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 sm:grid-cols-3"
      >
        {loading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : (
          <>
            <StatTile
              label="Overall Attendance"
              value={
                overallAttendance?.attendance_percentage.toString() ?? "0%"
              }
              icon={BarChart}
            />

            <StatTile
              label="Total Sessions"
              value={overallAttendance?.total_sessions.toString() ?? "0"}
              icon={Clock3}
            />

            <StatTile
              label="Attended Sessions"
              value={overallAttendance?.attended_sessions.toString() ?? "0"}
              icon={CheckCircle}
            />
          </>
        )}
      </motion.div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-medium text-foreground">
            Attendance in progress
          </h2>
          {shouldPollActiveAttendance && (
            <p className="text-sm text-muted">
              Live sessions refresh every 10 seconds.
            </p>
          )}
        </div>

        {activeError && (
          <Notice
            tone="error"
            title="Unable to load live attendance"
            description={activeError}
          />
        )}

        {activeLoading ? (
          <div className="rounded-xl border border-border bg-surface p-6">
            <Skeleton className="h-24 w-full" />
          </div>
        ) : activeSessions.length === 0 ? (
          <Notice
            tone="info"
            title="No active attendance right now"
            description="When a teacher starts attendance for one of your subjects, it will appear here for 1 hour. The first 10 minutes count as present, and later check-ins are marked late."
          />
        ) : (
          <div className="grid gap-4">
            {activeSessions.map((sessionRow) => (
              <div
                key={sessionRow.session_id}
                className="rounded-xl border border-border bg-surface p-6 space-y-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.15em] text-primary">
                      {sessionRow.subject_code ?? "Attendance"}
                    </p>
                    <h3 className="font-display text-2xl font-medium text-foreground mt-1">
                      {sessionRow.subject_name ?? "Attendance session"}
                    </h3>
                    <p className="text-sm text-muted mt-1">
                      Section {sessionRow.section ?? "—"}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatRemaining(sessionRow.opened_at)} remaining
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant={
                      selectedSessionId === sessionRow.session_id
                        ? "outline"
                        : "primary"
                    }
                    leftIcon={<ScanFace className="h-4 w-4" />}
                    onClick={() => {
                      setSelectedSessionId(sessionRow.session_id);
                      setCheckInMessage("");
                      setCheckInError("");
                    }}
                    disabled={sessionRow.marked}
                  >
                    {sessionRow.marked
                      ? "Attendance marked"
                      : "Scan face to mark attendance"}
                  </Button>

                  {sessionRow.marked && (
                    <Notice
                      tone="success"
                      title="Marked"
                      description={`You were marked ${sessionRow.mark_status ?? "present"} for this session.`}
                    />
                  )}
                </div>

                {selectedSessionId === sessionRow.session_id &&
                  !sessionRow.marked && (
                    <div className="space-y-4">
                      <FaceCapture
                        title="Scan your face"
                        description={`Verify your identity for ${sessionRow.subject_name ?? "this class"}.`}
                        ctaLabel="Capture face"
                        onCapture={(blob) => setFaceImage(blob)}
                        onContinue={handleCheckIn}
                        onRetake={() => setFaceImage(null)}
                      />

                      {checkInLoading && (
                        <Notice
                          tone="info"
                          title="Marking attendance"
                          description="Please wait while we verify your face and update the register."
                        />
                      )}

                      {checkInMessage && (
                        <Notice
                          tone="success"
                          title="Attendance marked"
                          description={checkInMessage}
                        />
                      )}

                      {checkInError && (
                        <Notice
                          tone="error"
                          title="Check-in failed"
                          description={checkInError}
                        />
                      )}
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-medium text-foreground">
            Your subjects
          </h2>
          <Link
            href="/student/subjects"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {subjects === null ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : subjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No subjects yet"
            description="Join a subject with the code your teacher shares to start showing up on the register."
            actionLabel="Join a subject"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {subjects.slice(0, 4).map((subject, i) => (
              <motion.div
                key={subject.subject_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.05 * i,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <SubjectTile subject={subject} href={`/student/subjects`} />
              </motion.div>
            ))}
          </div>
        )}
      </section> */}

      {/* ---------------- Subjects ---------------- */}

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-medium">Your Subjects</h2>

          <Link
            href="/student/subjects"
            className="text-primary text-sm font-medium hover:underline"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : subjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Subjects Joined"
            description="Ask your teacher for a subject code and join your first class."
            actionLabel="Join Subject"
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.subject_id}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.05,
                }}
              >
                <Link href={`/student/subjects/${subject.subject_id}`}>
                  <div className="rounded-xl border border-border bg-surface p-6 transition hover:border-primary hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-xl">{subject.name}</h3>

                        <p className="mt-1 text-sm text-muted">
                          {subject.subject_code}
                        </p>
                      </div>

                      <BookOpen className="text-primary" size={28} />
                    </div>

                    <div className="mt-6 flex items-center justify-between text-sm">
                      <span className="text-muted">Section</span>

                      <span className="font-medium">{subject.section}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ---------------- Coming Soon ---------------- */}

      {/* Session-level log */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-medium text-foreground">
         Recent Attendance Sessions
        </h2>

        {/* <p className="text-sm text-muted -mt-2">
          Every session your teacher has closed, with how you were marked.
        </p> */}

        {loadingAttendance ? (
          <div className="rounded-lg border border-border bg-surface px-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="ruled-row flex items-center justify-between gap-4 py-3.5"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>

                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No sessions yet"
            description="Your completed attendance sessions will appear here."
          />
        ) : (
          <div className="rounded-lg border border-border bg-surface px-5">
            {sessions.map((session) => {

              return (
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
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
