"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, LayoutGrid, LogOut, ScanFace, Share2 } from "lucide-react";
import type { Role } from "@/lib/api/types";
import { Logo } from "./Logo";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useSession } from "@/lib/hooks/useSession";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
}

const navByRole: Record<Role, NavItem[]> = {
  student: [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/student/subjects", label: "Subjects", icon: BookOpen },
    { href: "/student/attendance", label: "Attendance", icon: ScanFace },
  ],
  teacher: [
    { href: "/teacher/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/teacher/subjects", label: "Subjects", icon: BookOpen },
    { href: "/teacher/attendance", label: "Sessions", icon: Share2 },
  ],
};

export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, clearSession } = useSession();
  const items = navByRole[role];

  const handleSignOut = () => {
    clearSession();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href={`/${role}/dashboard`} aria-label="Snap Class home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {items.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3.5 py-2 text-sm font-medium transition-colors",
                    active ? "bg-surface-muted text-foreground" : "text-muted hover:text-foreground"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-muted hover:text-secondary"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
            {session && <Avatar name={session.user.name} size="sm" />}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-24 pt-7 sm:px-8 sm:pb-12">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-background/95 backdrop-blur md:hidden"
        aria-label="Primary"
      >
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                active ? "text-primary" : "text-muted"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
