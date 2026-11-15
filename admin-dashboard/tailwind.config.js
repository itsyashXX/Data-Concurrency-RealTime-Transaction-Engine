/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern FinTech Light Palette
        surface: {
          50: '#f8fafc',   // Canvas background
          100: '#f1f5f9',  // Subtle secondary background
          200: '#e2e8f0',  // Border subtle
          300: '#cbd5e1',  // Border strong
          400: '#94a3b8',  // Icon / subtle text
          500: '#64748b',  // Muted text
          600: '#475569',  // Body text
          700: '#334155',  // Dark body text
          800: '#1e293b',  // Subheadings
          900: '#0f172a',  // High-contrast headings
          950: '#020617',  // Deepest charcoal
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',  // Primary Royal Indigo
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',  // Cash flow green
          700: '#047857',
        },
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',  // Telemetry sky blue
          700: '#0369a1',
        },
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',  // Reversals & deductions
          700: '#be123c',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',  // In-flight / warnings
          700: '#b45309',
        },
      },
      backgroundImage: {
        'light-mesh': 'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.05) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(14, 165, 233, 0.05) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(16, 185, 129, 0.04) 0px, transparent 50%)',
        'gradient-brand': 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 24px -4px rgba(15, 23, 42, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
        'button-brand': '0 2px 8px -1px rgba(79, 70, 229, 0.35)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer-slide': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.9 },
          '50%': { opacity: 0.4 },
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
