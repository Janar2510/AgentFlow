/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
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
          DEFAULT: "#007AFF", // Electric Blue
          50: "#E6F3FF",
          100: "#CCE7FF",
          200: "#99CFFF", 
          300: "#66B7FF",
          400: "#339FFF",
          500: "#007AFF", // Main
          600: "#0062CC",
          700: "#004999",
          800: "#003166",
          900: "#001933",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "#00FF87", // Neon Green
          50: "#E6FFFA",
          100: "#CCFFF5",
          200: "#99FFEB",
          300: "#66FFE1",
          400: "#33FFD7",
          500: "#00FF87", // Main
          600: "#00CC6C",
          700: "#009951",
          800: "#006636",
          900: "#00331B",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "#6366F1", // Deep Purple
          50: "#F0F0FF",
          100: "#E1E1FF",
          200: "#C3C3FF",
          300: "#A5A5FF",
          400: "#8487FF",
          500: "#6366F1", // Main
          600: "#4F52C1",
          700: "#3B3E91",
          800: "#272A61",
          900: "#131530",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // AgentFlow specific colors
        node: {
          input: "#4ECDC4",
          output: "#45B7D1",
          process: "#96CEB4",
          condition: "#FFEAA7",
          loop: "#DDA0DD",
          ai: "#FF6B6B",
        },
        flow: {
          edge: "#94A3B8",
          "edge-selected": "#007AFF",
          background: "#F8FAFC",
          grid: "#E2E8F0",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: 0 },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        pulse: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "bounce-in": "bounce-in 0.6s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace", "Monaco"],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'node': '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
        'node-selected': '0 8px 32px 0 rgba(0, 122, 255, 0.3)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}