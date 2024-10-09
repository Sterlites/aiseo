/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'gradient': 'gradient 15s ease infinite',
        'theme-toggle': 'theme-toggle 0.5s ease-in-out',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'theme-toggle': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      backgroundColor: {
        'light-primary': 'white',
        'light-secondary': '#f3f4f6',
        'dark-primary': '#111827',
        'dark-secondary': '#1f2937',
      },
      textColor: {
        'light-primary': '#111827',
        'light-secondary': '#374151',
        'dark-primary': '#f3f4f6',
        'dark-secondary': '#e5e7eb',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}