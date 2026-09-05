/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ============================================
        // SINGLE SOURCE OF TRUTH: src/index.css
        // Colors defined as RGB values, enabling opacity modifiers
        // Usage: bg-uw-purple, bg-uw-purple/90, text-uw-gold/50
        // ============================================

        // Primary Brand - UW Purple
        'uw-purple': {
          DEFAULT: 'rgb(var(--uw-purp) / <alpha-value>)',
          light: 'rgb(var(--uw-purp-light) / <alpha-value>)',
          dark: 'rgb(var(--uw-purp-dark) / <alpha-value>)',
          50: 'rgb(var(--uw-purp-50) / <alpha-value>)',
          100: 'rgb(var(--uw-purp-100) / <alpha-value>)',
          200: 'rgb(var(--uw-purp-200) / <alpha-value>)',
          300: 'rgb(var(--uw-purp-300) / <alpha-value>)',
          400: 'rgb(var(--uw-purp-400) / <alpha-value>)',
          500: 'rgb(var(--uw-purp-500) / <alpha-value>)',
          600: 'rgb(var(--uw-purp-600) / <alpha-value>)',
          700: 'rgb(var(--uw-purp-700) / <alpha-value>)',
          800: 'rgb(var(--uw-purp-800) / <alpha-value>)',
          900: 'rgb(var(--uw-purp-900) / <alpha-value>)',
        },

        // Accent - UW Gold
        'uw-gold': {
          DEFAULT: 'rgb(var(--uw-gold) / <alpha-value>)',
          light: 'rgb(var(--uw-gold-light) / <alpha-value>)',
          dark: 'rgb(var(--uw-gold-dark) / <alpha-value>)',
          50: 'rgb(var(--uw-gold-50) / <alpha-value>)',
          100: 'rgb(var(--uw-gold-100) / <alpha-value>)',
          200: 'rgb(var(--uw-gold-200) / <alpha-value>)',
          300: 'rgb(var(--uw-gold-300) / <alpha-value>)',
          400: 'rgb(var(--uw-gold-400) / <alpha-value>)',
          500: 'rgb(var(--uw-gold-500) / <alpha-value>)',
          600: 'rgb(var(--uw-gold-600) / <alpha-value>)',
          700: 'rgb(var(--uw-gold-700) / <alpha-value>)',
          800: 'rgb(var(--uw-gold-800) / <alpha-value>)',
          900: 'rgb(var(--uw-gold-900) / <alpha-value>)',
        },

        // Neutrals
        'app': {
          black: 'rgb(var(--app-black) / <alpha-value>)',
          'grey-dark': 'rgb(var(--app-grey-dark) / <alpha-value>)',
          grey: 'rgb(var(--app-grey) / <alpha-value>)',
          'grey-light': 'rgb(var(--app-grey-light) / <alpha-value>)',
          'grey-lighter': 'rgb(var(--app-grey-lighter) / <alpha-value>)',
          'grey-lightest': 'rgb(var(--app-grey-lightest) / <alpha-value>)',
          white: 'rgb(var(--app-white) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 4px 20px var(--shadow-gold)',
        'gold-glow-lg': '0 8px 30px var(--shadow-gold-strong)',
        'purple-glow': '0 4px 20px var(--shadow-purple)',
      },
    },
  },
  plugins: [],
}
