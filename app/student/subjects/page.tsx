"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Check, Hash } from "lucide-react";
import { RoleGate } from "@/components/layout/RoleGate";
import { SubjectTile } from "@/components/dashboard/SubjectTile";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Notice } from "@/components/ui/Notice";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { endpoints } from "@/lib/api/endpoints";
import { useSession } from "@/lib/hooks/useSession";
import type { Subject } from "@/lib/api/types";

export default function StudentSubjectsPage() {
  return (
    <RoleGate role="student">
      <StudentSubjects />
    </RoleGate>
  );
}

function StudentSubjects() {
  const { session } = useSession();
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  type JoinedSubject = {
    subject_id: number;
    subject_code: string;
    name: string;
    section: string;
    teacher_id: number;
  };

  // Join-subject panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinedSubject, setJoinedSubject] = useState<JoinedSubject | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadSubjects = async () => {
    if (!session) return;

    const res = await endpoints.getSubjects(session.token);
    if (!res.ok) {
      setLoadError("Couldn't load your subjects. Please try again.");
      return;
    }

    setSubjects(res.data.subjects);
  };

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    endpoints.getSubjects(session.token).then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        setLoadError("Couldn't load your subjects. Please try again.");
        return;
      }
      setSubjects(res.data.subjects);
    });
    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (panelOpen) {
      setCode("");
      setJoinError(null);
      setJoinedSubject(null);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [panelOpen]);

  const handleJoin = async () => {
    if (!session || !code.trim()) return;
    setJoining(true);
    setJoinError(null);
    const res = await endpoints.joinSubject(session.token, { code: code.trim() });
    setJoining(false);
    if (!res.ok) {
      setJoinError(
        "No subject matched that code. Double-check with your teacher.",
      );
      return;
    }
    setJoinedSubject(res.data.subject);
    await loadSubjects();
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-end justify-between gap-4"
      >
        <div>
          <p className="font-mono text-eyebrow uppercase text-muted">
            Enrolled
          </p>
          <h1 className="font-display text-display-md font-medium text-foreground">
            Your subjects
          </h1>
        </div>
        <Button
          size="sm"
          variant={panelOpen ? "outline" : "primary"}
          onClick={() => setPanelOpen((v) => !v)}
          leftIcon={panelOpen ? undefined : <Hash className="h-3.5 w-3.5" />}
        >
          {panelOpen ? "Cancel" : "Join a subject"}
        </Button>
      </motion.div>

      <AnimatePresence>
        {panelOpen && (
          <motion.div
            key="join-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
              <div>
                <p className="font-display text-lg font-medium text-foreground">
                  Enter your subject code
                </p>
                <p className="text-sm text-muted mt-1">
                  Your teacher shares a unique code (like{" "}
                  <span className="font-mono">CSDS-401</span>) for each subject.
                </p>
              </div>

              {joinedSubject ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Notice
                    tone="success"
                    title="Subject Joined"
                    description={`${joinedSubject.name} has been added successfully.`}
                  />
                  <Button
                    onClick={() => {
                      setPanelOpen(false);
                      setJoinedSubject(null);
                    }}
                  >
                    Continue
                  </Button>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <TextField
                    ref={inputRef}
                    label="Subject code"
                    placeholder="e.g. CSDS-401"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setJoinError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleJoin();
                    }}
                    error={joinError ?? undefined}
                    leftIcon={<Hash className="h-4 w-4" />}
                    className="font-mono uppercase tracking-widest sm:w-56"
                  />
                  <Button
                    onClick={handleJoin}
                    isLoading={joining}
                    disabled={!code.trim()}
                    leftIcon={<Check className="h-4 w-4" />}
                    className="shrink-0"
                  >
                    Join
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loadError && (
        <Notice tone="error" title="Load failed" description={loadError} />
      )}

      {subjects === null ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Subjects Yet"
          description="Use the subject code shared by your teacher to join your first class."
          actionLabel="Join Subject"
          onAction={() => setPanelOpen(true)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {subjects.map((subject, i) => (
            <motion.div
              key={subject.subject_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: 0.04 * i,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <SubjectTile subject={subject} href={`/student/subjects/${subject.subject_id}`} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
