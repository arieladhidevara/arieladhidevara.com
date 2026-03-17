import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        base: "var(--color-base)",
        surface: "var(--color-surface)",
        layer: "var(--color-layer)",
        text: "var(--color-text)",
        subtext: "var(--color-subtext)",
        muted: "var(--color-muted)",
        accent: "var(--color-accent)",
        line: "var(--color-line)"
      },
      borderRadius: {
        soft: "var(--radius-soft)",
        card: "var(--radius-card)"
      },
      boxShadow: {
        soft: "0 20px 45px -38px rgba(18, 24, 31, 0.2)",
        lift: "0 28px 52px -40px rgba(14, 20, 28, 0.28)"
      },
      maxWidth: {
        layout: "77rem"
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)"
      },
      backgroundImage: {
        "soft-grid": "radial-gradient(circle at 1px 1px, rgba(15, 20, 27, 0.08) 1px, transparent 0)",
        "hero-haze": "radial-gradient(50% 58% at 18% 16%, rgba(184, 196, 212, 0.38) 0%, rgba(184, 196, 212, 0) 80%), radial-gradient(56% 64% at 84% 6%, rgba(210, 216, 228, 0.58) 0%, rgba(210, 216, 228, 0) 82%)"
      }
    }
  },
  plugins: []
};

export default config;
