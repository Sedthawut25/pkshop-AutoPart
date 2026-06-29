/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f7f7f5",
        ink: "#111827",
        line: "#e5e7eb",
        muted: "#6b7280",
      },
      borderRadius: {
        xl2: "1rem",
      },
      boxShadow: {
        soft: "0 10px 25px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};