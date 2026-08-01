import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef9f4",
          100: "#d5f0e3",
          500: "#1f9d63",
          600: "#16824f",
          700: "#126840",
          900: "#0b3d28"
        },
        ink: "#14213d"
      },
      boxShadow: {
        soft: "0 12px 30px rgba(20, 33, 61, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;
