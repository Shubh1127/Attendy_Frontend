import type { Metadata, Viewport } from "next";
import { SessionProvider } from "@/lib/hooks/useSession";
import "./globals.css";

// NOTE: next/font/google requires network access to Google Fonts during build.
// In this stub the font CSS variables are defined in globals.css using
// @import so they resolve from the CDN at runtime (no build-time fetch).
// Remove this comment and restore next/font/google when building with network
// access — it will self-host the fonts for best performance.

export const metadata: Metadata = {
  title: "Snap Class — Attendance, recognized instantly",
  description:
    "Snap Class marks attendance with a glance or a word — face and voice recognition built for real classrooms.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F6FA" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1220" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
