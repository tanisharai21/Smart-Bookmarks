import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["'Cabinet Grotesk'", "var(--font-geist-sans)", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#0A0A0F",
          900: "#111118",
          800: "#1A1A26",
          700: "#252535",
          600: "#32324A",
        },
        slate: {
          highlight: "#E2E8F8",
        },
        accent: {
          DEFAULT: "#6C63FF",
          light: "#8B85FF",
          glow: "rgba(108, 99, 255, 0.3)",
        },
        success: "#34D399",
        danger: "#F87171",
      },
      boxShadow: {
        glow: "0 0 30px rgba(108, 99, 255, 0.2)",
        "glow-sm": "0 0 15px rgba(108, 99, 255, 0.15)",
        card: "0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(108,99,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.05) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(108,99,255,0.15), transparent)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
