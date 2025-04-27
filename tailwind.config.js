/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        fontFamily: {
          inter: ['Inter', 'sans-serif'],
          poppins: ['Poppins', 'sans-serif'],
        },
        colors: {
          'dark-blue': '#1E3A8A',
        },
      },
    },
    plugins: [],
  };