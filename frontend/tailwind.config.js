/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: '#FBFBFB',
          surface: '#FFFFFF',
          text: '#1D1D1F',
          secondary: '#6E6E73',
          border: '#E5E5E5',
          new: '#323232',
          progress: '#D97706',
          resolved: '#059669',
        }
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
