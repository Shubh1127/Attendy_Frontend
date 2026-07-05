"use client";

import { useEffect, useState } from "react";
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
import type { Subject } from "@/lib/api/types";
import { formatPercent } from "@/lib/utils/format";

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
  const [error, setError] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<number | null>(null);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    endpoints.getSubjects(session.token).then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        setError("Couldn't load your subjects. Try refreshing the page.");
        return;
      }
      setSubjects(res.data.subjects);
      console.log("Subjects loaded:", res.data.subjects);
    });

    return () => {
      cancelled = true;
    };
  }, [session]);

  const totalStudents = subjects?.reduce((sum, s) => sum + s.student_count, 0);
  const avgRate =
    subjects && subjects.length
      ? subjects.reduce((sum, s) => sum + (s.attendance_rate ?? 0), 0) / subjects.length
      : undefined;

  const handleStartSession = async (subjectId: number) => {
    if (!session) return;
    console.log("Starting session for subject:", subjectId);
    setOpeningId(subjectId);
    const res = await endpoints.getAttendanceSessions( subjectId,session.token);
    setOpeningId(null);
    if (res.ok) {
      console.log("Attendance sessions retrieved:", res.data.sessions);
      // router.push(`/teacher/attendance/${res.data.sessions[0]?.session_id}/review`);
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
        {/* <p className="font-mono text-eyebrow uppercase text-muted">
          {session?.user?.department ?? "Faculty"}
        </p> */}
        <h1 className="font-display text-display-md font-medium text-foreground">
          Good to see you, {session?.user.name.split(" ").slice(-1)[0]}.
        </h1>
      </motion.div>

      {error && <Notice tone="error" title="Something went wrong" description={error} />}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3"
      >
        {subjects ? (
          <>
            <StatTile label="Subjects taught" value={`${subjects.length}`} icon={BookOpen} />
            <StatTile label="Students enrolled" value={`${totalStudents ?? 0}`} icon={Users} />
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
          <h2 className="font-display text-xl font-medium text-foreground">Start today's roll call</h2>
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
            {subjects.map((subject) => (
              <div key={subject.subject_id} className="ruled-row flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{subject.name}</p>
                  <p className="font-mono text-xs text-muted">{subject.subject_code} · {subject.section}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Zap className="h-3.5 w-3.5" />}
                  isLoading={openingId === subject.subject_id}
                  onClick={() => handleStartSession(subject.subject_id)}
                >
                  Open session
                </Button>
              </div>
            ))}
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
