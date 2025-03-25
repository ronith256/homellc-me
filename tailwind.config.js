/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neutral-00': '#000',
        'neutral-5': '#181a1b',
        'neutral-10': '#1c1f21',
        'neutral-15': '#232729',
        'neutral-20': '#2a2f31',
        'neutral-30': '#404547',
        'neutral-50': '#707577',
        'neutral-60': '#888d8f',
        'neutral-80': '#c3c6c7',
        'neutral-90': '#e1e2e3',
        'green-500': '#0d9c53',
        'green-700': '#025022',
        'blue-500': '#1f94ff',
        'blue-800': '#0f3557',
        'red-400': '#ff9c7a',
        'red-500': '#ff4600',
        'red-600': '#e03c00',
        'red-700': '#bd3000',
      },
      fontFamily: {
        'space-mono': ['"Space Mono"', 'monospace'],
        'sans': ['"Google Sans"', 'sans-serif'],
      },
      animation: {
        'hover': 'hover 1.4s infinite alternate ease-in-out',
        'pulse': 'pulse 1.4s infinite alternate ease-in-out',
      },
      keyframes: {
        hover: {
          'from': { transform: 'translateY(0)' },
          'to': { transform: 'translateY(-3.5px)' },
        },
        pulse: {
          'from': { transform: 'scale(1, 1)' },
          'to': { transform: 'scale(1.2, 1.2)' },
        }
      }
    },
  },
  plugins: [],
}