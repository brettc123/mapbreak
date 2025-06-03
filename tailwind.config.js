/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'antique': '#F4F1DE',
        'terra': '#E07A5F',
        'slate': '#3D405B',
        'sage': '#81B29A',
        'parchment': '#F5E6D3',
        'compass': {
          50: '#F7F9F9',
          100: '#E2ECF0',
          200: '#C5D9E3',
          300: '#A3C3D1',
          400: '#7FA8BC',
          500: '#5B8CA3',
          600: '#456A7C',
          700: '#2F4856',
          800: '#1A2830',
          900: '#0B1013'
        },
        'terrain': {
          50: '#F4F1ED',
          100: '#E2D5C3',
          200: '#D1B99A',
          300: '#BF9D71',
          400: '#AD8148',
          500: '#8B6739',
          600: '#694D2B',
          700: '#47341D',
          800: '#251B0F',
          900: '#120D07'
        }
      },
      fontFamily: {
        'display': ['Cal Sans', 'sans-serif'],
        'sans': ['Outfit', 'sans-serif']
      }
    },
  },
  plugins: [],
};