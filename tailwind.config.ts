import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./tests/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        field: {
          background: "var(--color-background)",
          surface: "var(--color-surface)",
          surfaceMuted: "var(--color-surface-muted)",
        },
        ink: {
          text: "var(--color-text)",
          muted: "var(--color-text-muted)",
          border: "var(--color-border)",
        },
        signal: {
          primary: "var(--color-primary)",
          primaryHover: "var(--color-primary-hover)",
          secondary: "var(--color-secondary)",
          accent: "var(--color-accent)",
        },
        status: {
          success: "var(--color-success)",
          warning: "var(--color-warning)",
          error: "var(--color-error)",
          info: "var(--color-info)",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
        16: "64px",
        24: "96px",
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
      },
      boxShadow: {
        soft: "0 8px 24px rgb(37 31 24 / 0.08)",
      },
      maxWidth: {
        app: "1120px",
      },
      minHeight: {
        11: "44px",
      },
    },
  },
  plugins: [],
};

export default config;
