/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#F9F9F9",
        surface: "#FFFFFF",
        elevated: "#F3F4F6",
        subtle: "#E5E7EB",
        sky: {
          brand: "#5AA9E6",
          hover: "#7FC8F8",
          glow: "rgba(90, 169, 230, 0.15)",
        },
        gold: "#FFE45E",
        rose: {
          kiss: "#FF6392",
        },
        success: "#22C55E",
        danger: "#FF6392",
        warning: "#FFE45E",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        logo: ["Pacifico", "cursive"],
        money: ["Space Grotesk", "sans-serif"],
      },
      borderColor: {
        subtle: "rgba(0, 0, 0, 0.05)",
        strong: "rgba(0, 0, 0, 0.10)",
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
