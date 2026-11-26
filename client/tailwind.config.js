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
        // Page & surface colors — inspired by Linear/Vercel/Notion
        surface: {
          base: '#F7F8FC',    // Page background — very slightly blue-tinted off-white
          card: '#FFFFFF',    // Card/panel background — clean white
          subtle: '#EEF0F8',  // Hover states, subtle sections
          border: '#E4E6EF',  // Default border
          muted: '#DDE0EF',   // Strong divider
        },
        // Brand — violet-purple, same hue as original
        brand: {
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },
        // Text
        ink: {
          primary: '#111827',  // Near-black headings (gray-900)
          secondary: '#374151',// Body copy (gray-700)
          muted: '#6B7280',    // Supporting text (gray-500)
          faint: '#9CA3AF',    // Placeholder / disabled (gray-400)
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.05)',
        'card-md': '0 4px 12px 0 rgba(0,0,0,0.08), 0 1px 3px -1px rgba(0,0,0,0.05)',
        'card-hover': '0 8px 24px 0 rgba(0,0,0,0.10), 0 2px 6px -2px rgba(0,0,0,0.06)',
        'brand-sm': '0 0 0 3px rgba(139,92,246,0.15)',
      },
      borderRadius: {
        'card': '10px',
        'pill': '999px',
        'chip': '6px',
      }
    },
  },
  plugins: [],
}
