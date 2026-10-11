
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#effcf4",
          100: "#d8f8e5",
          500: "#22a45a",
          600: "#168548",
          700: "#126b3b",
          900: "#10452b",
        },
      },
    },
  },
  plugins: [],
};