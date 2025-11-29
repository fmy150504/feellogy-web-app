/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Memastikan Tailwind memindai semua file di src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}