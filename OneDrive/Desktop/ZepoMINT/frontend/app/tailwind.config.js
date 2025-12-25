/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#FFD700'
      },
      boxShadow: {
        'gold-lg': '0 10px 30px rgba(255,215,0,0.12)'
      }
    },
  },
  plugins: [],
}