/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f6f8f7",
        ink: "#17211f",
        line: "#dce5e2",
        muted: "#6b7b77",
        brand: "#0f766e",
        "brand-dark": "#115e59",
        "brand-soft": "#e5f3f0",
        coral: "#e76f51",
      },
      borderRadius: {
        xl2: "1rem",
      },
      boxShadow: {
        soft: "0 14px 35px rgba(23, 33, 31, 0.08)",
        lift: "0 18px 45px rgba(23, 33, 31, 0.12)",
      },
    },
  },
  plugins: [],
};