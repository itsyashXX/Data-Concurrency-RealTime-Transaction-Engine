/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#030712',
          900: '#060a17',
          850: '#0a1022',
          800: '#0f172a',
          750: '#15203b',
          700: '#1e293b',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        cyber: {
          cyan: '#38bdf8',
          emerald: '#10b981',
          violet: '#a855f7',
          amber: '#f59e0b',
          rose: '#f43f5e',
        }
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.12), transparent 70%)',
        'card-gradient': 'linear-gradient(180deg, rgba(30, 41, 59, 0.3) 0%, rgba(15, 23, 42, 0.5) 100%)',
        'emerald-glow': 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-brand': '0 0 20px -3px rgba(99, 102, 241, 0.35)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        'glow-cyan': '0 0 20px -3px rgba(56, 189, 248, 0.35)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
