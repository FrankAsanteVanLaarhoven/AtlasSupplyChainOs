/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
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
        // AETHON Tactical Colors - NO PURPLE
        aethon: {
          cyan: "#00F0FF",
          slate: "#64748B",
          success: "#00FF41",
          warning: "#FFB800",
          error: "#FF3B30",
          dark: {
            void: "#030303",
            DEFAULT: "#050505",
            panel: "#0A0A0A",
            subtle: "#0F0F0F",
          }
        }
      },
      fontFamily: {
        heading: ['Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['IBM Plex Sans', 'sans-serif'],
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
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 10px rgba(0, 240, 255, 0.3)",
          },
          "50%": {
            opacity: "0.6",
            boxShadow: "0 0 20px rgba(0, 240, 255, 0.5)",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
        scanline: "scanline 8s linear infinite",
      },
      backgroundImage: {
        'tactical-gradient': 'linear-gradient(135deg, rgba(0,240,255,0.1) 0%, transparent 100%)',
        'dark-overlay': 'linear-gradient(to bottom, rgba(5,5,5,0) 0%, #030303 100%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
