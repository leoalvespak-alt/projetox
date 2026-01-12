/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {}, // Keep autoprefixer for browser compatibility
  },
};

export default config;
