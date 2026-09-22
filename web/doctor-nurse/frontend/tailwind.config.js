// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        // Custom pink from #F48FB1
        pink: {
          50: '#fef6f9',
          100: '#fce8f0',
          200: '#fad0e1',
          300: '#f5a8c9',
          400: '#f48fb1',  // ✅ Your color!
          500: '#eb6f99',
          600: '#df4f7d',
          700: '#ce3365',
          800: '#b32a56',
          900: '#8a2345',
        }
      },
    },
  },
  plugins: [],
}