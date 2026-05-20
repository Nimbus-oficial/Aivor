import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101418",
        graphite: "#2B3238",
        mist: "#F4F7F6",
        line: "#DCE5E1",
        forest: "#0C5B48",
        mint: "#BFF3DB",
        gold: "#C7A15A"
      },
      boxShadow: {
        calm: "0 18px 50px rgba(16, 20, 24, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
