"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ChevronLeft, Copy, Users, Zap } from "lucide-react";
import { RoleGate } from "@/components/layout/RoleGate";
import { StatTile } from "@/components/dashboard/StatTile";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Skeleton, SkeletonRow } from "@/components/ui/Skeleton";
import { Notice } from "@/components/ui/Notice";
import { Button } from "@/components/ui/Button";
import { Stamp } from "@/components/ui/Stamp";
import { Avatar } from "@/components/ui/Avatar";
import { endpoints } from "@/lib/api/endpoints";
import { useSession } from "@/lib/hooks/useSession";
import { mockSubjects } from "@/lib/api/mocks";
import type { AttendanceSession, AttendanceSummary, Subject } from "@/lib/api/types";
import { formatPercent } from "@/lib/utils/format";
import { subjectColorMap } from "@/lib/theme/subjectColors";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export default function TeacherSubjectDetailPage() {
  return (
    <RoleGate role="teacher">
      <SubjectDetail />
    </RoleGate>
  );
}

function SubjectDetail() {
  const params = useParams<{ id: string }>();
  const { session } = useSession();
  const router = useRouter();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [summaries, setSummaries] = useState<AttendanceSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [uploadingStudents, setUploadingStudents] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const studentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!session || !params.id) return;
    let cancelled = false;

    async function load() {
      // In mock mode the id comes from mockSubjects; real API would be GET /subjects/:id
      const subjectsRes = await endpoints.listSubjects(session!.token);
      const summaryRes = await endpoints.getAttendanceSummary(session!.token);
      if (cancelled) return;
      if (!subjectsRes.ok) { setError("Couldn't load subject details."); return; }
      const found = subjectsRes.data.find((s) => s.id === params.id) ?? null;
      setSubject(found);
      if (summaryRes.ok) setSummaries(summaryRes.data);
    }

    load();
    return () => { cancelled = true; };
  }, [session, params.id]);

  const handleCopyCode = () => {
    if (!subject) return;
    navigator.clipboard.writeText(subject.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleStartSession = async () => {
    if (!session || !subject) return;
    setOpening(true);
    const res = await endpoints.openAttendanceSession(subject.id, session.token);
    setOpening(false);
    if (res.ok) {
      router.push(`/teacher/attendance/${res.data.id}/review`);
    } else {
      setError("Couldn't open a session. Please try again.");
    }
  };

  const handleUploadStudents = async () => {
    if (!session || !subject || !studentFile) return;

    const subjectId = Number(params.id);
    if (Number.isNaN(subjectId)) {
      setError("Invalid subject ID.");
      return;
    }

    setUploadingStudents(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append("file", studentFile);

    const res = await endpoints.uploadStudentData(session.token, subjectId, formData);

    setUploadingStudents(false);

    if (!res.ok) {
      setError(res.error.message || "Couldn't upload students. Please try again.");
      return;
    }

    setUploadMessage(
      `Added ${res.data.students_added} student${res.data.students_added === 1 ? "" : "s"} and enrolled ${res.data.students_enrolled} of them in this subject.`,
    );
    setStudentFile(null);
    if (studentInputRef.current) {
      studentInputRef.current.value = "";
    }
  };

  const subjectSummary = summaries?.find((s) => s.subjectId === params.id);
  const palette = subject ? subjectColorMap[subject.color] : null;

  if (!subject && !error) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
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
          href="/teacher/subjects"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Subjects
        </Link>

        {subject ? (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <span
                className={cn("mt-1 h-12 w-1.5 shrink-0 rounded-full", palette?.bar)}
                aria-hidden
              />
              <div>
                <p className={cn("font-mono text-eyebrow uppercase", palette?.text)}>{subject.code}</p>
                <h1 className="font-display text-display-md font-medium text-foreground">{subject.name}</h1>
                <p className="text-sm text-muted mt-1">{subject.schedule ?? "Schedule not set"}</p>
              </div>
            </div>
            <Button
              leftIcon={<Zap className="h-4 w-4" />}
              isLoading={opening}
              onClick={handleStartSession}
            >
              Start roll call
            </Button>
          </div>
        ) : (
          error && <Notice tone="error" title="Failed to load subject" description={error} />
        )}
      </motion.div>

      {error && subject && <Notice tone="error" title={error} />}

      {subject && (
        <>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            <StatTile
              label="Students enrolled"
              value={`${subject.studentCount}`}
              icon={Users}
            />
            <StatTile
              label="Total sessions"
              value={`${subjectSummary?.totalSessions ?? "—"}`}
            />
            <StatTile
              label="Attendance rate"
              value={subject.attendanceRate !== undefined ? formatPercent(subject.attendanceRate) : "—"}
              trend={subject.attendanceRate !== undefined
                ? subject.attendanceRate >= 0.85 ? "up" : "down"
                : "flat"}
            />
            <StatTile
              label="Absences"
              value={`${subjectSummary?.absent ?? "—"}`}
              trend="down"
            />
          </div>

          {/* Enrollment share card */}
          <div className="rounded-lg border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <p className="font-display text-base font-medium text-foreground">Share with students</p>
                <p className="text-sm text-muted mt-0.5">
                  Students enter this code in Snap Class to join and register their biometrics.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 px-6 py-5">
              <div className="flex items-center gap-3">
                <span className={cn(
                  "rounded-md px-5 py-3 font-mono text-2xl font-semibold tracking-widest",
                  palette?.tint, palette?.text
                )}>
                  {subject.code}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                onClick={handleCopyCode}
              >
                {copied ? "Copied!" : "Copy code"}
              </Button>
              <p className="text-xs text-muted">
                {subject.studentCount} student{subject.studentCount !== 1 ? "s" : ""} enrolled so far
              </p>
            </div>
          </div>

          {/* Attendance breakdown */}
          {subjectSummary && (
            <div className="rounded-lg border border-border bg-surface p-6">
              <p className="font-display text-base font-medium text-foreground mb-5">Attendance breakdown</p>
              <div className="flex flex-wrap items-center gap-8">
                <ProgressRing value={subjectSummary.rate} size={96} strokeWidth={8} />
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <BreakdownRow label="Present" value={subjectSummary.present} tone="present" />
                  <BreakdownRow label="Absent" value={subjectSummary.absent} tone="absent" />
                  <BreakdownRow label="Late" value={subjectSummary.late} tone="late" />
                  <BreakdownRow label="Excused" value={subjectSummary.excused} tone="excused" />
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
            <div>
              <p className="font-display text-base font-medium text-foreground">Upload students</p>
              <p className="text-sm text-muted mt-0.5">
                Upload the class roster PDF for this subject. The backend will extract each student name and enrollment number, create missing records, and link the students to this subject.
              </p>
            </div>

            <input
              ref={studentInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => setStudentFile(e.target.files?.[0] ?? null)}
            />

            {studentFile && (
              <p className="text-sm text-muted">
                Selected: <span className="font-medium text-foreground">{studentFile.name}</span>
              </p>
            )}

            {uploadMessage && <Notice tone="success" title={uploadMessage} />}

            <Button
              isLoading={uploadingStudents}
              onClick={handleUploadStudents}
              disabled={!studentFile}
            >
              Upload student PDF
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "present" | "absent" | "late" | "excused";
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <Stamp status={tone} />
      <span className="font-mono text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
