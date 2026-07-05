"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock } from "lucide-react";
import { RoleGate } from "@/components/layout/RoleGate";
// import { ProgressRing } from "@/components/ui/ProgressRing";
// import { Stamp } from "@/components/ui/Stamp";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Notice } from "@/components/ui/Notice";
import { endpoints } from "@/lib/api/endpoints";
import { useSession } from "@/lib/hooks/useSession";
import type { AttendanceSummary, Subject } from "@/lib/api/types";
// import { formatPercent } from "@/lib/utils/format";
// import { subjectColorMap } from "@/lib/theme/subjectColors";
// import { cn } from "@/lib/utils/cn";

export default function StudentAttendancePage() {
  return (
    <RoleGate role="student">
      <StudentAttendance />
    </RoleGate>
  );
}

function StudentAttendance() {
  const { session } = useSession();
  const [attendance, setAttendance] = useState<AttendanceSummary[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    loadAttendance();
  }, [session]);

  const loadAttendance = async () => {
    setLoading(true);

    setError(null);

    const response = await endpoints.getAttendanceSummary(session!.token);

    if (!response.ok) {
      setError(response.error.message);

      setLoading(false);

      return;
    }

    setAttendance(response.data.attendance);

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
        <h2 className="font-display text-xl font-medium">Attendance Summary</h2>

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
          <div className="grid gap-5 sm:grid-cols-2">
            {attendance.map((item) => (
              <div
                key={item.subject_id}
                className="rounded-xl border border-border bg-surface p-6"
              >
                <h3 className="font-display text-lg">{item.subject_name}</h3>

                <p className="font-mono text-sm text-primary">
                  {item.subject_code}
                </p>

                <div className="mt-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Classes</span>

                    <span>{item.total}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Present</span>

                    <span>{item.present}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Late</span>

                    <span>{item.late}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Absent</span>

                    <span>{item.absent}</span>
                  </div>

                  <div className="mt-4 border-t pt-4 flex justify-between font-semibold">
                    <span>Attendance</span>

                    <span>{item.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
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

        <i>Coming Soon</i>
      </section>
    </div>
  );
}
