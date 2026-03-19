/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '0.95' },
        },
        drift: {
          '0%, 100%': { transform: 'translateX(0px) translateY(0px)' },
          '50%': { transform: 'translateX(10px) translateY(-6px)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(14px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(14px) rotate(-360deg)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.35', transform: 'translateX(-4px)' },
          '50%': { opacity: '0.75', transform: 'translateX(4px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        'fade-up-delay': 'fade-up 0.9s ease-out both',
        pop: 'pop 0.35s ease-out both',
        float: 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
        drift: 'drift 9s ease-in-out infinite',
        orbit: 'orbit 12s linear infinite',
        shimmer: 'shimmer 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
