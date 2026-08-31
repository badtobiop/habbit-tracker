/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#040814",
        foreground: "#f8fafc",
        ocean: {
          950: "#030712",
          900: "#040814",
          850: "#071126",
          800: "#0b1836",
          750: "#0f214a",
          700: "#142c63",
          600: "#1d448c",
          500: "#2563eb",
          400: "#38bdf8",
          300: "#7dd3fc",
          200: "#bae6fd",
          100: "#e0f2fe",
        },
        lunar: {
          cyan: "#06b6d4",
          aqua: "#22d3ee",
          sky: "#38bdf8",
          teal: "#14b8a6",
          emerald: "#10b981",
          silver: "#e2e8f0",
          pearl: "#f1f5f9",
          gold: "#f59e0b",
          amber: "#fbbf24",
          violet: "#8b5cf6",
          indigo: "#6366f1",
        },
        cyber: {
          950: "#030712",
          900: "#040814",
          850: "#071126",
          800: "#0b1836",
          700: "#0f214a",
          600: "#142c63",
          500: "#1e3a8a",
        },
        uchiha: {
          red: "#06b6d4",
          crimson: "#38bdf8",
          blood: "#0284c7",
          dark: "#082f49",
          flame: "#7dd3fc",
        },
        rank: {
          e: "#64748b",
          d: "#38bdf8",
          c: "#06b6d4",
          b: "#0284c7",
          a: "#6366f1",
          s: "#a855f7",
          monarch: "#f59e0b",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "ocean-grid": "linear-gradient(to right, rgba(56, 189, 248, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.05) 1px, transparent 1px)",
        "lunar-glow": "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(56, 189, 248, 0.25), transparent 70%)",
        "glass-ocean": "linear-gradient(135deg, rgba(7, 17, 38, 0.85) 0%, rgba(4, 8, 20, 0.95) 100%)",
        "lunar-gradient": "linear-gradient(135deg, #0284c7 0%, #06b6d4 50%, #38bdf8 100%)",
        "gold-gradient": "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)",
      },
      boxShadow: {
        "glow-cyan": "0 0 20px -3px rgba(6, 182, 212, 0.45)",
        "glow-cyan-lg": "0 0 35px -5px rgba(6, 182, 212, 0.65)",
        "glow-teal": "0 0 20px -3px rgba(20, 184, 166, 0.45)",
        "glow-sky": "0 0 20px -3px rgba(56, 189, 248, 0.45)",
        "glow-moon": "0 0 25px -4px rgba(226, 232, 240, 0.4)",
        "glow-gold": "0 0 20px -3px rgba(245, 158, 11, 0.45)",
        "glow-violet": "0 0 20px -3px rgba(139, 92, 246, 0.45)",
        "glow-red": "0 0 20px -3px rgba(6, 182, 212, 0.45)", // fallback for existing class references
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
        "inner-glow": "inset 0 0 15px 0 rgba(56, 189, 248, 0.15)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 3s linear infinite",
        "spin-slow": "spin 20s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        }
      }
    },
  },
  plugins: [],
};

