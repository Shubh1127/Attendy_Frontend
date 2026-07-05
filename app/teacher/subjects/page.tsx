"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus } from "lucide-react";
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

export default function TeacherSubjectsPage() {
  return (
    <RoleGate role="teacher">
      <TeacherSubjects />
    </RoleGate>
  );
}

function TeacherSubjects() {
  const { session } = useSession();
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Create-subject panel state
  type PanelType = "subject" | "timetable" | null;

  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [name, setName] = useState("");
  const [timetableFile, setTimetableFile] = useState<File | null>(null);
  const [uploadingTimetable, setUploadingTimetable] = useState(false);
  const timetableInputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [schedule, setSchedule] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdSubject, setCreatedSubject] = useState<Subject | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    endpoints.getSubjects(session.token).then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        setLoadError("Couldn't load subjects. Please try again.");
        return;
      }
      setSubjects(res.data.subjects);
    });
    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (activePanel !== null) {
      setName("");
      setCode("");
      setSchedule("");
      setCreateError(null);
      setCreatedSubject(null);
      setTimeout(() => nameRef.current?.focus(), 80);
    }
  }, [activePanel]);

  const validate = () => {
    if (!name.trim()) return "Subject name is required.";
    if (!code.trim()) return "Subject code is required.";
    return null;
  };

  const handleCreate = async () => {
    if (!session) return;
    const err = validate();
    if (err) {
      setCreateError(err);
      return;
    }
    setCreating(true);
    setCreateError(null);
    const res = await endpoints.createSubject(session.token, {
      subject_code: code.trim(),
      name: name.trim(),
      section: schedule.trim(),
    });
    setCreating(false);
    if (!res.ok) {
      setCreateError("Couldn't create the subject. Try again shortly.");
      return;
    }
    setCreatedSubject(res.data.subject);
    setSubjects((prev) =>
      prev ? [res.data.subject, ...prev] : [res.data.subject],
    );
  };

  const handleUploadTimetable = async () => {
    if (!timetableFile || !session) return;

    const formData = new FormData();
    formData.append("file", timetableFile);

    setUploadingTimetable(true);

    await endpoints.uploadTimetable(formData, session.token);

    setUploadingTimetable(false);
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
          <p className="font-mono text-eyebrow uppercase text-muted">Faculty</p>
          <h1 className="font-display text-display-md font-medium text-foreground">
            Your subjects
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={activePanel === "subject" ? "outline" : "primary"}
            onClick={() =>
              setActivePanel(activePanel === "subject" ? null : "subject")
            }
            leftIcon={<Plus className="h-4 w-4" />}
          >
            New Subject
          </Button>

          <Button
            size="sm"
            variant={activePanel === "timetable" ? "outline" : "secondary"}
            onClick={() =>
              setActivePanel(activePanel === "timetable" ? null : "timetable")
            }
          >
            Upload Timetable
          </Button>

        </div>
      </motion.div>

      <AnimatePresence>
        {activePanel === "subject" && (
          <motion.div
            key="create-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border border-border bg-surface p-6 space-y-5">
              <div>
                <p className="font-display text-lg font-medium text-foreground">
                  Create a new subject
                </p>
                <p className="text-sm text-muted mt-1">
                  Students join using the subject code. Pick something short and
                  memorable.
                </p>
              </div>

              {createdSubject ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-4"
                >
                  <Notice
                    tone="success"
                    title={`"${createdSubject.name}" created!`}
                    description={`Share the code ${createdSubject.subject_code} with your students so they can join.`}
                  />
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActivePanel(null);
                      }}
                    >
                      Done
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCreatedSubject(null)}
                    >
                      Create another
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <TextField
                      ref={nameRef}
                      label="Subject name"
                      placeholder="e.g. Machine Learning"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setCreateError(null);
                      }}
                    />
                  </div>
                  <TextField
                    label="Code"
                    placeholder="e.g. CSDS-401"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setCreateError(null);
                    }}
                    className="font-mono uppercase tracking-wider"
                  />
                  <div className="sm:col-span-2">
                    <TextField
                      label="Schedule (optional)"
                      placeholder="Mon · Wed · Fri — 9:10 AM"
                      value={schedule}
                      onChange={(e) => setSchedule(e.target.value)}
                      hint="A human-readable description of when classes run."
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <Button onClick={handleCreate} isLoading={creating}>
                      Create subject
                    </Button>
                  </div>
                  {createError && (
                    <div className="sm:col-span-3">
                      <Notice tone="error" title={createError} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {activePanel === "timetable" && (
        <div className="rounded-lg border border-border bg-surface p-6 space-y-5">
          <div>
            <h3 className="font-display text-lg">Upload Teacher Timetable</h3>

            <p className="text-sm text-muted">
              Upload a PDF timetable. The AI will extract schedule information.
            </p>
          </div>

          <input
            ref={timetableInputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => setTimetableFile(e.target.files?.[0] ?? null)}
          />

          {timetableFile && (
            <p className="text-sm">
              Selected:
              <span className="font-medium"> {timetableFile.name}</span>
            </p>
          )}

          <Button
            isLoading={uploadingTimetable}
            onClick={handleUploadTimetable}
          >
            Upload PDF
          </Button>
        </div>
      )}

      {loadError && (
        <Notice tone="error" title="Load failed" description={loadError} />
      )}

      {subjects === null ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No subjects yet"
          description="Create your first subject and share the code with your students to get them enrolled."
          actionLabel="Create a subject"
          onAction={() => setActivePanel("subject")}
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
              <SubjectTile
                subject={subject}
                href={`/teacher/subjects/${subject.subject_id}`}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
