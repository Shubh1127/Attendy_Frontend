"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Mic, ScanFace, Users } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useRouter } from "next/dist/client/components/navigation";
import { useSession } from "@/lib/hooks/useSession";
import { useEffect } from "react";

const steps = [
  {
    n: "01",
    title: "Face the camera, or say a word",
    body: "A student looks into their device or speaks a short phrase — no card, no PIN, no roll call.",
    icon: ScanFace,
  },
  {
    n: "02",
    title: "The model checks who's present",
    body: "On-device capture, server-side recognition. A confidence score decides match or no match in under two seconds.",
    icon: Mic,
  },
  {
    n: "03",
    title: "The register stamps itself",
    body: "The entry lands on the teacher's ledger already marked. They confirm the session, not each name.",
    icon: GraduationCap,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { session ,status} = useSession();
   useEffect(() => {
      if (status === "authenticated" && session?.user.role === "teacher") {
        router.replace("/teacher/dashboard");
      }
      if (status === "authenticated" && session?.user.role === "student") {
        router.replace("/student/dashboard");
      }
    }, [status, session, router]);
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      <section className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-5 pb-20 pt-10 text-center sm:px-8 sm:pt-16">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-mono text-eyebrow uppercase text-muted"
        >
          Roll call, reimagined
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="max-w-3xl text-balance font-display text-display-xl font-medium text-foreground"
        >
          Attendance, <span className="italic text-primary">recognized</span> instantly.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-xl text-balance text-base text-muted sm:text-lg"
        >
          Snap Class marks a classroom present with a glance or a word. No
          handheld scanners, no sign-in sheets that quietly get passed down
          the row.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <RoleCard
            href="/student/login"
            icon={GraduationCap}
            title="I'm a student"
            body="Sign in with your face or voice and check today's classes."
          />
          <RoleCard
            href="/teacher/login"
            icon={Users}
            title="I'm a teacher"
            body="Open a session, watch the register fill itself, confirm it."
          />
        </motion.div>

        <ScanShowcase />
      </section>

      <section className="border-t border-border bg-surface-muted/40 py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="font-display text-display-md font-medium text-foreground">
            How a name gets marked present
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.n} className="flex flex-col gap-3 border-t-2 border-foreground/90 pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted">{step.n}</span>
                  <step.icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-lg font-medium text-foreground">{step.title}</h3>
                <p className="text-sm text-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-10 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>© {new Date().getFullYear()} Snap Class</span>
        <span>Built for real classrooms, not demos.</span>
      </footer>
    </div>
  );
}

function RoleCard({
  href,
  icon: Icon,
  title,
  body,
}: {
  href: string;
  icon: typeof GraduationCap;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-start gap-3 rounded-lg border border-border bg-surface p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-lift"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className="font-display text-xl font-medium text-foreground">{title}</span>
      <span className="text-sm text-muted">{body}</span>
      <span className="mt-1 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Continue <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

function ScanShowcase() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.25 }}
      className="relative mt-4 flex h-44 w-44 items-center justify-center rounded-full border border-border bg-surface-muted sm:h-52 sm:w-52"
      aria-hidden
    >
      <span className="absolute inset-0 rounded-full border-2 border-primary animate-scan-pulse" />
      <span className="absolute inset-0 rounded-full border-2 border-primary animate-scan-pulse [animation-delay:1.1s]" />
      <span className="stamp border-2 bg-background px-3.5 py-1 text-xs text-primary">Present</span>
    </motion.div>
  );
}
