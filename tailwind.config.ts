import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        foreground: "#f4f4f5",
        brand: {
          light: "#a78bfa",
          DEFAULT: "#8b5cf6",
          dark: "#6d28d9",
        },
        surface: "rgba(25, 25, 25, 0.6)",
        surfaceBorder: "rgba(255, 255, 255, 0.1)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-outfit)", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 10px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.1)",
        "neon-strong": "0 0 15px rgba(139, 92, 246, 0.7), 0 0 50px rgba(139, 92, 246, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
