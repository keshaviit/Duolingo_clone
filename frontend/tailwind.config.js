/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        macaw: {
          DEFAULT: "#58cc02",
          dark: "#46a302",
          light: "#78db25",
        },
        cardinal: {
          DEFAULT: "#ff4b4b",
          dark: "#ea2b2b",
        },
        bee: {
          DEFAULT: "#ffc800",
          dark: "#e6b400",
        },
        fox: {
          DEFAULT: "#ff9600",
          dark: "#e68500",
        },
        feather: {
          DEFAULT: "#1cb0f6",
          dark: "#1899d6",
          light: "#84d8ff",
        },
        hare: {
          DEFAULT: "#afafaf",
          dark: "#8a8a8a",
          light: "#e5e5e5",
          ultralight: "#f7f7f7",
        },
      },
      fontFamily: {
        nunito: ["var(--font-nunito)", "sans-serif"],
      },
    },
  },
  plugins: [],
}
