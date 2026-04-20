/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "var(--bg-base)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        subtle: "var(--bg-subtle)",
        accent: {
          DEFAULT: "var(--accent)",
          light: "var(--accent-light)",
          glow: "var(--accent-glow)",
        },
        success: "var(--success)",
        danger: "var(--danger)",
        warning: "var(--warning)",
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        heading: ["Syne", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderColor: {
        subtle: "var(--border-subtle)",
        strong: "var(--border-strong)",
      },
      animation: {
        fadeIn: "fadeIn 0.2s ease-out",
        slideUp: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
  ],
};
