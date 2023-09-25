/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.{html,js}", "./src/**/*.{html,js}",
    "./js/app.js",
    "./js/abstraction.js",
],
  theme: {
    extend: {
      zIndex: {
        '99': '99',
      },
      minWidth: {
        'b': '60px',
      },
      minHeight: {
        'b': '20px',
      },
      maxWidth: {
        'confirm': '300px',
      }
    },
  },
  plugins: [],
}

