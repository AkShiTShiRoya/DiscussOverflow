/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        keppel: "#01b39e",
        "keppel-dark": "#03AC98",
        azure: "#f2fefd",
        "outer-space": "#3d494e",
        "outer-space-light": "#3e4d50",
      },
    },
  },
  plugins: [],
};
