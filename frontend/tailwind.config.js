/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        monad: {
          50: "#f3f0ff",
          100: "#e9e5ff",
          200: "#d5ceff",
          300: "#b5a5fe",
          400: "#9476fc",
          500: "#836EF9", // Official Monad Purple
          600: "#6e4af2",
          700: "#5c37dc",
          800: "#4a2db5",
          900: "#3e2792",
          950: "#130938",
        },
        cyber: {
          bg: "#08090e",
          card: "rgba(18, 20, 32, 0.75)",
          border: "rgba(131, 110, 249, 0.2)",
          cyan: "#00F5FF",
          neonGreen: "#10B981",
          gold: "#F59E0B",
          rose: "#FF4A70",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 10px rgba(131, 110, 249, 0.4)" },
          "100%": { boxShadow: "0 0 25px rgba(0, 245, 255, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};
