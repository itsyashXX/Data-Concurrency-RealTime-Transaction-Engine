/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          950: '#040409',
          900: '#080813',
          850: '#0e0e1f',
          800: '#15152c',
          750: '#1d1d3b',
          700: '#27274e',
        },
        aurora: {
          cyan: '#00f0ff',
          sky: '#38bdf8',
          violet: '#8b5cf6',
          fuchsia: '#d946ef',
          pink: '#f43f5e',
          mint: '#00ffa3',
          emerald: '#10b981',
          gold: '#fbbf24',
          amber: '#f59e0b',
        },
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
      },
      backgroundImage: {
        'aurora-mesh': 'radial-gradient(at 0% 0%, rgba(139, 92, 246, 0.18) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(0, 240, 255, 0.15) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(0, 255, 163, 0.1) 0px, transparent 50%)',
        'card-glass': 'linear-gradient(135deg, rgba(21, 21, 44, 0.6) 0%, rgba(8, 8, 19, 0.7) 100%)',
        'card-glass-hover': 'linear-gradient(135deg, rgba(29, 29, 59, 0.8) 0%, rgba(14, 14, 31, 0.85) 100%)',
        'gradient-cyan-violet': 'linear-gradient(135deg, #00f0ff 0%, #8b5cf6 50%, #d946ef 100%)',
        'gradient-mint-cyan': 'linear-gradient(135deg, #00ffa3 0%, #00f0ff 100%)',
      },
      boxShadow: {
        'neon-cyan': '0 0 25px -4px rgba(0, 240, 255, 0.4)',
        'neon-violet': '0 0 25px -4px rgba(139, 92, 246, 0.45)',
        'neon-mint': '0 0 25px -4px rgba(0, 255, 163, 0.4)',
        'neon-pink': '0 0 25px -4px rgba(244, 63, 94, 0.4)',
        'inner-glass': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'shimmer-slide': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.9, filter: 'drop-shadow(0 0 15px rgba(0, 240, 255, 0.6))' },
          '50%': { opacity: 0.5, filter: 'drop-shadow(0 0 5px rgba(139, 92, 246, 0.3))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
