/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Esto ya está correcto
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          500: '#FF8C00', // Tu color personalizado
        },
      },
    },
  },
  plugins: [],
}