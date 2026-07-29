/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg1: "900px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        text: "var(--text)",
        "text-secondary": "var(--text-secondary)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-light": "var(--accent-light)",
        teal: "var(--teal)",
        pink: "var(--pink)",
        "card-bg": "var(--card-bg)",
        "card-border": "var(--card-border)",
      },
      boxShadow: {
        card: "var(--shadow)",
        "card-lg": "var(--shadow-lg)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        wave: {
          "0%": { transform: "rotate(0deg)" },
          "10%": { transform: "rotate(-10deg)" },
          "20%": { transform: "rotate(12deg)" },
          "30%": { transform: "rotate(-10deg)" },
          "40%": { transform: "rotate(9deg)" },
          "50%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
      },
      animation: {
        wave: "wave 2.5s infinite",
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
