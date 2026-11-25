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
        brand: {
          50: '#f0f5ff',
          100: '#e1ecfe',
          200: '#c7dcfe',
          300: '#9ec4fc',
          400: '#6ea4f9',
          500: '#3f82f6',
          600: '#2563eb', // Crisp, refined, authoritative royal blue
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        }
      },
      borderRadius: {
        'card': '6px',
        'subtle': '4px'
      }
    },
  },
  plugins: [],
}
