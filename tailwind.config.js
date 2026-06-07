/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#E64A19",
          light: "#FF6F00",
          dark: "#D84315",
        },
        ancient: {
          bg: "#F5F0E8",
          primary: "#2D5016",
          accent: "#C9A227",
          text: "#3E2723",
        },
      },
      fontFamily: {
        sans: ["Noto Sans SC", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

