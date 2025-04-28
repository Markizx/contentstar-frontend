/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'text-white', // Гарантируем, что утилита text-white включена
  ],
  theme: {
    extend: {
      colors: {
        'dark-blue': '#1E3A8A',
        'blue-600': '#2563EB',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      backdropBlur: {
        lg: '10px',
      },
    },
  },
  plugins: [],
};