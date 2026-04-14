import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0A0A0A',
          graphite: '#1C1C1C',
          amber: '#F59E0B',
          'amber-light': '#FCD34D',
          'amber-dark': '#B45309',
          offwhite: '#F5F5F5',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.85) 100%)',
        'card-gradient': 'linear-gradient(to top, rgba(10,10,10,0.9) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
} satisfies Config
