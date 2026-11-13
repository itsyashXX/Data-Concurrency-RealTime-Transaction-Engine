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
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#ced9fd',
          300: '#a3bbfb',
          400: '#7195f7',
          500: '#436cf0',
          600: '#2b4fe5',
          700: '#213dc8',
          800: '#1e33a2',
          900: '#1d2f7f',
          950: '#121c4e',
        },
      },
    },
  },
  plugins: [],
}
