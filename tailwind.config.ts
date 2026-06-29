import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        "surface-muted": "hsl(var(--surface-muted) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        ruled: "hsl(var(--ruled-line) / <alpha-value>)",
        muted: "hsl(var(--muted-foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "hsl(var(--danger) / <alpha-value>)",
          foreground: "hsl(var(--danger-foreground) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(2.75rem, 6vw, 5.25rem)", { lineHeight: "0.98", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.25rem, 4.5vw, 3.75rem)", { lineHeight: "1.02", letterSpacing: "-0.015em" }],
        "display-md": ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.08", letterSpacing: "-0.01em" }],
        "eyebrow": ["0.75rem", { lineHeight: "1", letterSpacing: "0.16em" }],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "22px",
        stamp: "999px",
      },
      boxShadow: {
        ledger: "0 1px 0 0 hsl(var(--ruled-line))",
        lift: "0 12px 32px -16px hsl(222 47% 8% / 0.28)",
        ring: "0 0 0 1px hsl(var(--border))",
      },
      backgroundImage: {
        "grain": "url('/textures/grain.png')",
      },
      keyframes: {
        "scan-pulse": {
          "0%": { transform: "scale(0.92)", opacity: "0.9" },
          "70%": { transform: "scale(1.35)", opacity: "0" },
          "100%": { transform: "scale(1.35)", opacity: "0" },
        },
        "stamp-in": {
          "0%": { transform: "scale(2.2) rotate(-14deg)", opacity: "0" },
          "55%": { transform: "scale(0.94) rotate(-6deg)", opacity: "1" },
          "75%": { transform: "scale(1.05) rotate(-9deg)" },
          "100%": { transform: "scale(1) rotate(-7deg)", opacity: "1" },
        },
        "rise-in": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "marquee-tick": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "28px 0" },
        },
      },
      animation: {
        "scan-pulse": "scan-pulse 2.2s cubic-bezier(0.22,0.61,0.36,1) infinite",
        "stamp-in": "stamp-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "rise-in": "rise-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
