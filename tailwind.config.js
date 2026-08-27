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
        background: "#050508",
        foreground: "#f8fafc",
        cyber: {
          950: "#050508",
          900: "#090a0f",
          850: "#0e0f17",
          800: "#141622",
          700: "#1e2130",
          600: "#2a2d40",
          500: "#3d4258",
        },
        uchiha: {
          red: "#dc2626",
          crimson: "#ef4444",
          blood: "#991b1b",
          dark: "#450a0a",
          flame: "#f87171",
        },
        rank: {
          e: "#64748b",
          d: "#ef4444",
          c: "#dc2626",
          b: "#b91c1c",
          a: "#991b1b",
          s: "#ef4444",
          monarch: "#dc2626",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "cyber-grid": "linear-gradient(to right, rgba(220, 38, 38, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(220, 38, 38, 0.04) 1px, transparent 1px)",
        "hero-glow": "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(220, 38, 38, 0.2), transparent 70%)",
        "glass-card": "linear-gradient(135deg, rgba(14, 15, 23, 0.8) 0%, rgba(8, 9, 13, 0.9) 100%)",
        "rank-gradient": "linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #991b1b 100%)",
      },
      boxShadow: {
        "glow-red": "0 0 20px -3px rgba(220, 38, 38, 0.4)",
        "glow-red-lg": "0 0 35px -5px rgba(220, 38, 38, 0.6)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
        "inner-glow": "inset 0 0 15px 0 rgba(220, 38, 38, 0.15)",
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
