import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: "#2B3A30", light: "#3E5248", muted: "#5A7266" },
        sand: { DEFAULT: "#FCFBF9", dark: "#F0EBE3", line: "#E5DED2" },
        clay: "#C67B4E",
      },
      borderRadius: { lg: "0.75rem" },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
