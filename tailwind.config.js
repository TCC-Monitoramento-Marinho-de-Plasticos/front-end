/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#EBF8FF',
          100: '#D6F1FF',
          200: '#ADE3FF',
          300: '#84D5FF',
          400: '#5BC7FF',
          500: '#39B0CA', // aqua
          600: '#0A82B7',
          700: '#0A5E8C',
          800: '#0A3255', // deep blue
          900: '#051E33',
        },
        coral: {
          50: '#FFF5F2',
          100: '#FFEAE5',
          200: '#FFD6CB',
          300: '#FFC1B0',
          400: '#FFAC96',
          500: '#FF967C',
          600: '#FF7863', // coral accent
          700: '#E85A45',
          800: '#CC3D28',
          900: '#A42A16',
        },
        sand: {
          50: '#FDFCF8',
          100: '#FAF8F2',
          200: '#F5F0E5',
          300: '#EFE8D8',
          400: '#EAE0CB',
          500: '#E5D8BE',
          600: '#D0BC96',
          700: '#BB9F6F',
          800: '#A68347',
          900: '#91672A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      animation: {
        'wave': 'wave 3s ease-in-out infinite',
        'ripple': 'ripple 1.5s cubic-bezier(0, 0.2, 0.8, 1) infinite',
        'float': 'float 5s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: 1 },
          '100%': { transform: 'scale(1)', opacity: 0 },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
      },
      backgroundImage: {
        'wave-pattern': "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI3NCIgdmlld0JveD0iMCAwIDE0NDAgNzQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDUxLjc2MDZDMTIwIDc5Ljc2MDYgMjQwIDc5Ljc2MDYgMzYwIDUxLjc2MDZDNDgwIDIzLjc2MDYgNjAwIDIzLjc2MDYgNzIwIDUxLjc2MDZDODQwIDc5Ljc2MDYgOTYwIDc5Ljc2MDYgMTA4MCA1MS43NjA2QzEyMDAgMjMuNzYwNiAxMzIwIDIzLjc2MDYgMTQ0MCA1MS43NjA2VjczLjc2MDZIMFYzMC43NjA2VjUxLjc2MDZaIiBmaWxsPSIjMEE1RThDIiBmaWxsLW9wYWNpdHk9IjAuMiIvPgo8L3N2Zz4=')",
      },
    },
  },
  plugins: [],
};