/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#070b14',
          800: '#0d1226',
          700: '#111827',
          600: '#1a2235',
          500: '#212d42',
        },
        brand: {
          green: '#00e676',
          cyan: '#00d4ff',
          red: '#ff3d5a',
          yellow: '#ffd600',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
