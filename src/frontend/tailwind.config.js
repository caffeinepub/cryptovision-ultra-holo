import typography from "@tailwindcss/typography";
import containerQueries from "@tailwindcss/container-queries";
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring) / <alpha-value>)",
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
        chart: {
          1: "oklch(var(--chart-1))",
          2: "oklch(var(--chart-2))",
          3: "oklch(var(--chart-3))",
          4: "oklch(var(--chart-4))",
          5: "oklch(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "oklch(var(--sidebar))",
          foreground: "oklch(var(--sidebar-foreground))",
          primary: "oklch(var(--sidebar-primary))",
          "primary-foreground": "oklch(var(--sidebar-primary-foreground))",
          accent: "oklch(var(--sidebar-accent))",
          "accent-foreground": "oklch(var(--sidebar-accent-foreground))",
          border: "oklch(var(--sidebar-border))",
          ring: "oklch(var(--sidebar-ring))",
        },
        // Neon semantic colors
        "neon-cyan": "oklch(0.85 0.18 195)",
        "neon-purple": "oklch(0.65 0.25 285)",
        "neon-green": "oklch(0.82 0.2 150)",
        "neon-pink": "oklch(0.72 0.22 330)",
        "neon-orange": "oklch(0.78 0.2 55)",
        "space-deep": "oklch(0.06 0.02 270)",
        "space-dark": "oklch(0.09 0.025 270)",
        "space-mid": "oklch(0.12 0.025 265)",
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['Bricolage Grotesque', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0,0,0,0.05)",
        "neon-cyan": "0 0 15px oklch(0.85 0.18 195 / 0.4), 0 0 30px oklch(0.85 0.18 195 / 0.2)",
        "neon-purple": "0 0 15px oklch(0.65 0.25 285 / 0.4), 0 0 30px oklch(0.65 0.25 285 / 0.2)",
        "neon-green": "0 0 15px oklch(0.82 0.2 150 / 0.4), 0 0 30px oklch(0.82 0.2 150 / 0.2)",
        "neon-pink": "0 0 15px oklch(0.72 0.22 330 / 0.4), 0 0 30px oklch(0.72 0.22 330 / 0.2)",
        "glass": "0 8px 32px oklch(0 0 0 / 0.3), inset 0 1px 0 oklch(1 0 0 / 0.05)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-neon": {
          "0%, 100%": { boxShadow: "0 0 10px oklch(0.85 0.18 195 / 0.4)" },
          "50%": { boxShadow: "0 0 25px oklch(0.85 0.18 195 / 0.8), 0 0 50px oklch(0.85 0.18 195 / 0.4)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "coin-spin": {
          "0%": { transform: "rotateY(0deg)" },
          "50%": { transform: "rotateY(180deg)" },
          "100%": { transform: "rotateY(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-neon": "pulse-neon 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "gradient-shift": "gradient-shift 4s ease infinite",
        "coin-spin": "coin-spin 0.6s ease-in-out",
      },
    },
  },
  plugins: [typography, containerQueries, animate],
};
