/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bronze Canvas Theme (Principal)
        'bronze-canvas': {
          background: '#f0ede4',
          'primary-text': '#1a362a',
          'secondary-text': '#5a6b5a',
          'component-bg': '#e6e0d3',
          accent: '#a6886e',
          border: '#c9c2b6',
        },

        // Gold Cream Theme (Variante 1 - Premium Cálido)
        'gold-cream': {
          background: '#faf8f3',
          'primary-text': '#2d2416',
          'secondary-text': '#6b5d4f',
          'component-bg': '#f5f0e8',
          accent: '#d4a574',
          border: '#e8dcc8',
        },

        // Silver Blue Theme (Variante 2 - Sofisticado)
        'silver-blue': {
          background: '#f0f4f8',
          'primary-text': '#1a2332',
          'secondary-text': '#4a5568',
          'component-bg': '#e2e8f0',
          accent: '#94a3b8',
          border: '#cbd5e1',
        },

        // Mauve Copper Theme (Variante 3 - Elegante)
        'mauve-copper': {
          background: '#f5f0f3',
          'primary-text': '#2d1a28',
          'secondary-text': '#6b5563',
          'component-bg': '#ebe3e8',
          accent: '#b8856a',
          border: '#d9c9d3',
        },
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        sans: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
