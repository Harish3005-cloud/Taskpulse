/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ---- Existing shadcn/ui tokens ---- */
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },

        /* ---- TaskPulse Design Tokens ---- */
        // Surfaces
        "tp-bg": "var(--tp-bg)",
        "tp-surface": "var(--tp-surface)",
        "tp-elevated": "var(--tp-elevated)",

        // Text (use as text-tp-foreground / text-tp-muted / text-tp-subtle)
        "tp-foreground": "var(--tp-text)",
        "tp-muted": "var(--tp-text-muted)",
        "tp-subtle": "var(--tp-text-subtle)",

        // Brand accent
        "tp-accent": {
          DEFAULT: "var(--tp-accent)",
          hover: "var(--tp-accent-hover)",
          soft: "var(--tp-accent-soft)",
          foreground: "var(--tp-on-accent)",
        },

        // Borders
        "tp-border": {
          DEFAULT: "var(--tp-border)",
          strong: "var(--tp-border-strong)",
        },

        // Semantic
        "tp-success": {
          DEFAULT: "var(--tp-success)",
          soft: "var(--tp-success-soft)",
        },
        "tp-warning": {
          DEFAULT: "var(--tp-warning)",
          soft: "var(--tp-warning-soft)",
        },
        "tp-danger": {
          DEFAULT: "var(--tp-danger)",
          soft: "var(--tp-danger-soft)",
        },
        "tp-info": {
          DEFAULT: "var(--tp-info)",
          soft: "var(--tp-info-soft)",
        },

        // Priority
        "tp-priority": {
          urgent: "var(--tp-priority-urgent)",
          high: "var(--tp-priority-high)",
          medium: "var(--tp-priority-medium)",
          low: "var(--tp-priority-low)",
        },

        // AI identity (reserve for AI surfaces)
        "tp-ai": {
          from: "var(--tp-ai-from)",
          to: "var(--tp-ai-to)",
          soft: "var(--tp-ai-soft)",
        },

        // Accent alias (for redesign Tailwind classes like bg-accent, text-accent)
        accent: {
          DEFAULT: "var(--tp-accent)",
          hover: "var(--tp-accent-hover)",
          soft: "var(--tp-accent-soft)",
          foreground: "var(--tp-on-accent)",
        },
      },
      fontFamily: {
        sans: [
          "Geist Variable",
          "Geist Fallback",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        heading: ["Outfit Variable", "sans-serif"],
        mono: ["Geist Mono Variable", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "tp-sm": "var(--tp-radius-sm)",
        "tp": "var(--tp-radius)",
        "tp-lg": "var(--tp-radius-lg)",
        "tp-xl": "var(--tp-radius-xl)",
      },
      boxShadow: {
        "tp-sm": "var(--tp-shadow-sm)",
        "tp-md": "var(--tp-shadow-md)",
        "tp-lg": "var(--tp-shadow-lg)",
      },
      backgroundImage: {
        "ai-gradient": "var(--tp-ai-gradient)",
      },
      keyframes: {
        "tp-shimmer": {
          "100%": { transform: "translateX(100%)" },
        },
        "tp-fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "tp-shimmer": "tp-shimmer 1.5s infinite",
        "tp-fade-up": "tp-fade-up 0.25s ease-out both",
      },
      transitionTimingFunction: {
        "tp-spring": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
