/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        bear: {
          fur: '#6B4F3A',
          furLight: '#9C7A5C',
          honey: '#FFB703',
          sky: '#E6F3FF',
          leaf: '#2A9D8F',
          berry: '#E76F51'
        }
      },
      boxShadow: {
        sticky: '0 10px 20px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        bucket: '24px'
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        poof: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.7)' },
        }
      },
      animation: {
        shake: 'shake 300ms ease-in-out',
        poof: 'poof 300ms ease-in',
      }
    }
  },
  plugins: []
}
