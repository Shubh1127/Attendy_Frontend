# Snap Class — Frontend

A production-ready Next.js 14 / TypeScript attendance application with biometric (face + voice) recognition, built as the frontend counterpart to a Python ML backend and Supabase database.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local — mocks are ON by default so the app runs without a backend

# 3. Run the dev server
npm run dev
# → http://localhost:3000
```

Visit `/` to see the landing page. Use the Student or Teacher login to go through the biometric flow (mock mode simulates a successful match automatically).

### Font setup

The project loads Fraunces, Plus Jakarta Sans, and JetBrains Mono from Google Fonts via a CSS `@import` at runtime. This works out-of-the-box in any browser with internet access.

For **production**, switch to `next/font/google` in `app/layout.tsx` (the comments there show exactly what to restore) — Next.js will self-host the fonts for zero layout shift and no third-party requests. The `next.config.js` also has a comment on removing `optimizeFonts: false` when doing so.

---

## Wiring the real Python backend

1. Set `NEXT_PUBLIC_API_BASE_URL` to your backend's base URL (e.g. `http://localhost:8000`).
2. Set `NEXT_PUBLIC_USE_MOCKS=false`.
3. The backend should implement the REST contract documented in [`lib/api/endpoints.ts`](lib/api/endpoints.ts). Every `//` comment above each function describes the HTTP verb, path, request shape, and response shape.

No component code changes are needed — every screen depends only on the typed return values of `endpoints.*`.

---

## Architecture overview

```
app/                     Next.js App Router pages
  page.tsx               Landing — role selector
  student/
    login/               Biometric login (face / voice)
    dashboard/           Stats, subject tiles, recent marks
    subjects/            Enrolled subjects + join-by-code
    attendance/          Per-subject rings + session log
  teacher/
    login/               Teacher biometric login
    dashboard/           Stats, quick-start roll-call
    subjects/            Subject list + create subject
    subjects/[id]/       Subject detail: roster, share code, breakdown
    attendance/          Sessions list + start new session
    attendance/[id]/
      review/            Review biometric marks, override, confirm

components/
  auth/                  FaceCapture, AudioCapture, MethodTabs
  dashboard/             SubjectTile, StatTile
  layout/                AppShell, AuthLayout, RoleGate, Logo
  ui/                    Button, TextField, Stamp, Avatar, ProgressRing,
                         EmptyState, Notice, Skeleton, ThemeToggle

lib/
  api/
    types.ts             Domain types (Subject, AttendanceSession, …)
    env.ts               Centralised env-var reader + mock flag
    client.ts            Typed fetch wrapper (ApiResult<T>, ApiError)
    endpoints.ts         ← THE INTEGRATION POINT — all network calls live here
    mocks.ts             In-memory mock data for local development
  hooks/
    useSession.tsx       Auth session context (localStorage-backed)
    useTheme.ts          Dark/light toggle
    useWebcam.ts         getUserMedia lifecycle + captureFrame()
    useAudioRecorder.ts  MediaRecorder + live RMS level
  theme/
    tokens.ts            JS-accessible design tokens (radius, motion, chart palette)
    subjectColors.ts     Subject colour → Tailwind class map
  utils/
    cn.ts                clsx + tailwind-merge helper
    format.ts            formatPercent, formatConfidence, initials
    file.ts              blobToFile, formatBytes, formatDuration
```

---

## Design system

The visual language is an **Indian attendance register reimagined digitally** — a literal ledger brought to life.

### Colour palette (CSS HSL variables)

| Token | Light | Dark | Role |
|---|---|---|---|
| `--background` | Cool paper | Ink navy | Page background |
| `--primary` | Verdant green | Brighter verdant | "Present" / primary action |
| `--secondary` | Vermilion | Brighter vermilion | "Absent" / destructive |
| `--accent` | Amber | Brighter amber | "Late" / highlights |
| `--surface` | White | Dark navy | Card backgrounds |

### Typography

- **Display** — Fraunces (variable, optical size, SOFT/WONK axes). Used for headings and numbers.
- **Body / UI** — Plus Jakarta Sans. All labels, body text, buttons.
- **Mono / Data** — JetBrains Mono. Roll numbers, codes, timestamps, stats.

### Signature motifs

- **`.stamp`** — rotated ink-stamp badge (CSS class). Used for all status marks (Present / Absent / Late / Excused) instead of generic pill badges.
- **`.ruled-row`** — single bottom border mimicking a register line, used for all list rows.
- **`.ledger-field`** — repeating horizontal rule texture for ambient backgrounds.
- **`.scan-ring`** — pulsing circular ring around webcam/mic capture previews.

### Dark mode

Toggle via the sun/moon button in the app shell. Preference persists in `localStorage`. The `<html>` element receives the `.dark` class; all colours switch via CSS variables — no JS re-render.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | For production | Python backend base URL |
| `NEXT_PUBLIC_USE_MOCKS` | Optional | Force mocks on (`true`) or off (`false`) |
| `NEXT_PUBLIC_SUPABASE_URL` | For production | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For production | Supabase anon/public key only |

**Never** set `SUPABASE_SERVICE_ROLE_KEY` as a `NEXT_PUBLIC_*` variable.

---

## Scripts

```bash
npm run dev      # Development server with HMR
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint
```
