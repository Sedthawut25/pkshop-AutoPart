/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F5F2",
        ink: "#111827",
        line: "#E5E7EB",
        muted: "#6B7280",
      },
      borderRadius: {
        xl2: "1rem",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};