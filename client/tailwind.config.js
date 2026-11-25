/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      colors: {
        void: {
          950: '#07070D', // Deep cosmic midnight base
          900: '#0B0A14',
          850: '#100E1F',
          800: '#16142A',
          750: '#1D1A36',
          700: '#252145',
          600: '#342E5E'
        },
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6', // Electric Ultraviolet
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065'
        },
        neon: {
          cyan: '#00F0FF',
          emerald: '#00F5A0',
          violet: '#A855F7',
          pink: '#EC4899',
          amber: '#F59E0B'
        }
      },
      boxShadow: {
        'glow-violet': '0 0 25px -4px rgba(139, 92, 246, 0.35)',
        'glow-cyan': '0 0 25px -4px rgba(0, 240, 255, 0.35)',
        'glow-emerald': '0 0 25px -4px rgba(0, 245, 160, 0.35)',
        'glow-sm': '0 0 15px -2px rgba(139, 92, 246, 0.25)',
      },
      borderRadius: {
        'card': '8px',
        'subtle': '6px'
      }
    },
  },
  plugins: [],
}
