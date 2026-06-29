"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/api/types";
import { useSession } from "@/lib/hooks/useSession";
import { AppShell } from "./AppShell";
import { Logo } from "./Logo";

export function RoleGate({ role, children }: { role: Role; children: React.ReactNode }) {
  const { status, requireRole } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "loading" && !requireRole(role)) {
      router.replace(`/${role}/login`);
    }
  }, [status, role, requireRole, router]);

  if (status === "loading" || !requireRole(role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Logo />
        <span className="h-5 w-5 rounded-full border-2 border-border border-t-primary animate-spin" aria-label="Loading" />
      </div>
    );
  }

  return <AppShell role={role}>{children}</AppShell>;
}
