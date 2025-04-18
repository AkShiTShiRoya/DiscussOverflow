/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        keppel: {
          DEFAULT: "#01b39e", // default when you use `text-keppel`
          50: "#e6f8f3",
          100: "#c4f0e4",
          200: "#9be4d1",
          300: "#6ed9bf",
          400: "#3ab795",
          500: "#2e9f84",
          600: "#21876e",
          700: "#176f59",
          800: "#0e5744",
          900: "#063f30",
        },
        "keppel-dark": "#03AC98",
        azure: "#f2fefd",
        "outer-space": "#3d494e",
        "outer-space-light": "#3e4d50",
      },
    },
  },
  plugins: [],
};
