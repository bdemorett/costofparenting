import type { Config } from "tailwindcss";

/**
 * Cost of Parenting — warm editorial financial theme
 *
 * Canvas: soft cream (#faf9f6)
 * Accent: deep teal (teal-700 / #0f766e)
 * Display: Playfair / Georgia serif
 * UI: Inter / system sans
 */
const config: Config = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#faf9f6",
          muted: "#f5f4f0",
          deep: "#efece6",
        },
        brand: {
          DEFAULT: "#0f766e", // teal-700
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
          hover: "#115e59",
          foreground: "#ffffff",
        },
        ink: {
          DEFAULT: "#292524",
          soft: "#57534e",
          muted: "#78716c",
        },
        surface: {
          DEFAULT: "#ffffff",
          subtle: "#f5f4f0",
          muted: "#efece6",
        },
        // Remap cool tech gray defaults toward warm stone for editorial cascade
        slate: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
          950: "#0c0a09",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        serif: [
          "var(--font-playfair)",
          "Georgia",
          "Times New Roman",
          "serif",
        ],
        display: [
          "var(--font-playfair)",
          "Georgia",
          "Times New Roman",
          "serif",
        ],
      },
      boxShadow: {
        pillow:
          "0 1px 2px rgba(41, 37, 36, 0.04), 0 10px 28px rgba(41, 37, 36, 0.04)",
        glass: "0 8px 32px rgba(41, 37, 36, 0.06)",
        editorial: "0 1px 3px rgba(41, 37, 36, 0.06), 0 12px 40px rgba(15, 118, 110, 0.06)",
      },
      borderRadius: {
        pillow: "1rem",
        pill: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
