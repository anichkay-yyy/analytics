/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "rgb(63, 81, 181)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#0C0F16",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#0C0F16",
          foreground: "#a1a1aa",
        },
        accent: {
          DEFAULT: "rgb(63, 81, 181)",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#0C0F16",
          foreground: "#ffffff",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
