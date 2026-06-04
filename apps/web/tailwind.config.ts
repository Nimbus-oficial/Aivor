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
        ink: "#15181A",
        graphite: "#222529",
        carbon: "#383B3E",
        muted: "#6F7174",
        silver: "#9C9D9F",
        mist: "#F4F7F6",
        line: "#2B2E32",
        blue: "#2973FF",
        azure: "#5792FF",
        ice: "#C4DAFF",
        forest: "#0C5B48",
        mint: "#BFF3DB",
        gold: "#C7A15A"
      },
      boxShadow: {
        calm: "0 18px 50px rgba(0, 0, 0, 0.22)",
        glow: "0 0 36px rgba(41, 115, 255, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
