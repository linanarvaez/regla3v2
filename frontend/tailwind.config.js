/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        latam: {
          blue: '#000066',
          red: '#e61e6e',
          gray: '#4d4d4d',
        }
      }
    },
  },
  plugins: [],
}
