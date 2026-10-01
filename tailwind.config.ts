import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f3f7f0",
          100: "#e3ede0",
          200: "#c7dbc0",
          300: "#a0c194",
          400: "#73a065",
          500: "#528544",
          600: "#3e6a34",
          700: "#32542b",
          800: "#2a4426",
          900: "#243a21",
        },
        sand: {
          50: "#fbf9f4",
          100: "#f5f0e4",
          200: "#eadfc7",
          300: "#dcc8a0",
        },
        clay: "#9c6b3f",
      },
    },
  },
  plugins: [],
};

export default config;
