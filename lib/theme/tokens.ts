/**
 * Snap Class design tokens.
 *
 * Source of truth for color, type and motion decisions lives here and in
 * `tailwind.config.ts` / `app/globals.css`. Components should reach for
 * Tailwind utility classes first; this file exists for the cases where a
 * raw value is needed in JS (canvas/SVG charts, inline styles, the capture
 * preview ring, etc).
 *
 * Palette concept: an attendance register, reimagined. "Verdant" is the ink
 * of a confirmed present mark; "Vermilion" is the stamp red teachers have
 * used on roll-call sheets for generations; "Amber" is a highlighter
 * mid-thought. Light mode is cool paper under classroom light, not cream.
 */

export const radius = {
  sm: "6px",
  md: "10px",
  lg: "16px",
  xl: "22px",
  stamp: "999px",
} as const;

export const motion = {
  quick: 0.18,
  base: 0.32,
  slow: 0.5,
  easeOut: [0.16, 1, 0.3, 1] as const,
  easeInOut: [0.65, 0, 0.35, 1] as const,
};

export const chartPalette = {
  present: "#1FA679",
  absent: "#E2502B",
  late: "#F2A93B",
  excused: "#7C8AA5",
};

export const fontStack = {
  display: "var(--font-display)",
  sans: "var(--font-sans)",
  mono: "var(--font-mono)",
};
