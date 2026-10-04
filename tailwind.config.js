/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#090d16",
        darkCard: "rgba(15, 23, 42, 0.75)",
        neonBlue: "#00f0ff",
        neonPurple: "#7000ff",
        neonPink: "#ff007f",
        neonGreen: "#00ff88",
        neonYellow: "#ffe600",
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'orbit-1': 'orbit1 6s linear infinite',
        'orbit-2': 'orbit2 10s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'vortex': 'vortex 8s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 15px rgba(0,240,255,0.6))' },
          '50%': { opacity: 0.7, filter: 'drop-shadow(0 0 5px rgba(0,240,255,0.2))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        vortex: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.1)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
