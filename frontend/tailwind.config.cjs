/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef3fb",
          100: "#d9e6f6",
          200: "#b3cdea",
          300: "#7eaad8",
          400: "#4f86c4",
          500: "#2f66ad",
          600: "#1f4f8d",
          700: "#003366",
          800: "#002a55",
          900: "#001f40",
        },
        accent: {
          red: "#c41e3a",
          gold: "#b8860b",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"],
        serif: ["Crimson Text", "ui-serif", "Georgia", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};
