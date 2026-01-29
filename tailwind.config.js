/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Neon Cyberpunk Colors
        neon: {
          cyan: "#00f0ff",
          magenta: "#ff00aa",
          green: "#00ff88",
          purple: "#bf00ff",
          orange: "#ff6b00",
          pink: "#ff0080",
          blue: "#0080ff",
          yellow: "#ffff00",
        },
        cyber: {
          dark: "#0a0a1a",
          darker: "#050510",
          card: "#1a1a2e",
          border: "#2a2a4e",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.8", filter: "brightness(1.2)" },
        },
        "neon-flicker": {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.3" },
          "94%": { opacity: "1" },
          "96%": { opacity: "0.5" },
          "97%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "count-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(2px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px var(--glow-color, #00f0ff)" },
          "50%": {
            boxShadow:
              "0 0 40px var(--glow-color, #00f0ff), 0 0 60px var(--glow-color, #00f0ff)",
          },
        },
        "race-move": {
          "0%": { left: "0%" },
          "100%": { left: "var(--progress, 0%)" },
        },
        "trail-fade": {
          "0%": { opacity: "0.8", width: "100%" },
          "100%": { opacity: "0", width: "0%" },
        },
        shine: {
          "0%": { left: "-100%" },
          "100%": { left: "100%" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(5deg)" },
        },
        "winner-reveal": {
          "0%": { transform: "scale(0) rotate(-180deg)", opacity: "0" },
          "50%": { transform: "scale(1.2) rotate(10deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        "podium-rise": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "neon-flicker": "neon-flicker 4s linear infinite",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "slide-in-left": "slide-in-left 0.5s ease-out",
        "count-up": "count-up 0.3s ease-out",
        shake: "shake 0.3s ease-in-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "race-move": "race-move 0.3s ease-out forwards",
        "trail-fade": "trail-fade 0.5s ease-out forwards",
        shine: "shine 2s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "winner-reveal": "winner-reveal 0.8s ease-out forwards",
        "podium-rise": "podium-rise 0.6s ease-out forwards",
      },
      boxShadow: {
        "neon-cyan": "0 0 20px #00f0ff, 0 0 40px #00f0ff40",
        "neon-magenta": "0 0 20px #ff00aa, 0 0 40px #ff00aa40",
        "neon-green": "0 0 20px #00ff88, 0 0 40px #00ff8840",
        "neon-purple": "0 0 20px #bf00ff, 0 0 40px #bf00ff40",
        "neon-orange": "0 0 20px #ff6b00, 0 0 40px #ff6b0040",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
