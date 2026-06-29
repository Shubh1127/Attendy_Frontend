"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
BookOpen,
GraduationCap,
User
} from "lucide-react";
import { RoleGate } from "@/components/layout/RoleGate";
import { StatTile } from "@/components/dashboard/StatTile";
import { Skeleton } from "@/components/ui/Skeleton";

import { SubjectTile } from "@/components/dashboard/SubjectTile";
// import { Stamp } from "@/components/ui/Stamp";
// import { Skeleton, SkeletonRow } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Notice } from "@/components/ui/Notice";
import { Button } from "@/components/ui/Button";
import { endpoints } from "@/lib/api/endpoints";
import { useSession } from "@/lib/hooks/useSession";
import type { Subject } from "@/lib/api/types";
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

  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {

    if (!session) return;

    loadSubjects();

  }, [session]);

  const loadSubjects = async () => {

    setLoading(true);

    setError("");

    const response =
      await endpoints.getSubjects(
        session!.token
      );

    if (!response.ok) {

      setError(response.error.message);

      setLoading(false);

      return;

    }

    setSubjects(
      response.data.subjects
    );

    setLoading(false);

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
            label="Subjects Joined"
            value={subjects.length.toString()}
            icon={BookOpen}
          />

          <StatTile
            label="Profile"
            value="Verified"
            icon={User}
          />

          <StatTile
            label="Role"
            value="Student"
            icon={GraduationCap}
          />

        </>
      )}

    </motion.div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-medium text-foreground">Your subjects</h2>
          <Link href="/student/subjects" className="text-sm font-medium text-primary hover:underline">
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
                key={subject.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
              >
                <SubjectTile subject={subject} href={`/student/subjects`} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

            {/* ---------------- Subjects ---------------- */}

      <section className="space-y-5">

        <div className="flex items-center justify-between">

          <h2 className="font-display text-2xl font-medium">
            Your Subjects
          </h2>

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
                  y: 10
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  delay: index * 0.05
                }}
              >

                <Link href={`/student/subjects/${subject.subject_id}`}>

                  <div className="rounded-xl border border-border bg-surface p-6 transition hover:border-primary hover:shadow-lg">

                    <div className="flex items-center justify-between">

                      <div>

                        <h3 className="font-display text-xl">

                          {subject.name}

                        </h3>

                        <p className="mt-1 text-sm text-muted">

                          {subject.subject_code}

                        </p>

                      </div>

                      <BookOpen
                        className="text-primary"
                        size={28}
                      />

                    </div>

                    <div className="mt-6 flex items-center justify-between text-sm">

                      <span className="text-muted">

                        Section

                      </span>

                      <span className="font-medium">

                        {subject.section}

                      </span>

                    </div>

                  </div>

                </Link>

              </motion.div>

            ))}

          </div>

        )}

      </section>

      {/* ---------------- Coming Soon ---------------- */}

      <section className="space-y-4">

        <h2 className="font-display text-2xl font-medium">

          Attendance

        </h2>

        <Notice
          tone="info"
          title="Coming Soon"
          description="Attendance reports and analytics will appear here after your teacher starts attendance sessions."
        />

      </section>

    </div>
  );
}
