/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // EVE Frontier inspired dark space theme
        'space': {
          900: '#0a1628',  // Darkest navy
          800: '#0f2137',
          700: '#152a46',
          600: '#1c3655',
          500: '#234264',
        },
        'cyber': {
          400: '#00d4ff',  // Primary cyan
          500: '#00b8e6',
          600: '#009dcc',
          glow: 'rgba(0, 212, 255, 0.5)',
        },
        'neon': {
          green: '#00ff88',
          red: '#ff4757',
          orange: '#ff9f43',
          purple: '#a55eea',
        },
      },
      fontFamily: {
        'space': ['Orbitron', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-space': 'linear-gradient(135deg, #0a1628 0%, #152a46 50%, #0a1628 100%)',
        'gradient-cyber': 'linear-gradient(135deg, #00d4ff 0%, #00b8e6 100%)',
      },
      boxShadow: {
        'cyber': '0 0 20px rgba(0, 212, 255, 0.3)',
        'cyber-lg': '0 0 40px rgba(0, 212, 255, 0.4)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.3)',
        'neon-red': '0 0 20px rgba(255, 71, 87, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 212, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};