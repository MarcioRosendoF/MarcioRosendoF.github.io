const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ["./*.{html,js}", "./js/**/*.js"],
  darkMode: 'class',
  theme: {
    screens: {
      'sm': '640px',
      'md': '820px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: '#0a0a0a',
        surface: '#121212',
        border: '#27272a',
        muted: '#b4b4bb',
        white: '#ededed',
        accent: '#fff',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  },
  plugins: [
    plugin(function({ addVariant }) {
      addVariant('hover-hover', '@media (hover: hover)')
    })
  ],
}
