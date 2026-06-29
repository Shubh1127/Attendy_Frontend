"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthSession, Role } from "@/lib/api/types";

const STORAGE_KEY = "snapclass.session";

interface SessionContextValue {
  session: AuthSession | null;
  status: "loading" | "authenticated" | "unauthenticated";
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  /** True once we've read localStorage and the user's role matches the requested one. */
  requireRole: (role: Role) => boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: AuthSession = JSON.parse(raw);
        if (new Date(parsed.expiresAt).getTime() > Date.now()) {
          setSessionState(parsed);
          setStatus("authenticated");
          return;
        }
      }
      setStatus("unauthenticated");
    } catch {
      setStatus("unauthenticated");
    }
  }, []);

  const setSession = useCallback((next: AuthSession) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSessionState(next);
    setStatus("authenticated");
  }, []);

  const clearSession = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSessionState(null);
    setStatus("unauthenticated");
  }, []);

  const requireRole = useCallback(
    (role: Role) => status === "authenticated" && session?.user.role === role,
    [session, status]
  );

  const value = useMemo(
    () => ({ session, status, setSession, clearSession, requireRole }),
    [session, status, setSession, clearSession, requireRole]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
