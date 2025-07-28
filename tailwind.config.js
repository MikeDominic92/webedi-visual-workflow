/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stealth theme color palette
        'stealth': {
          '900': '#000000',      // Pure black
          '800': '#0a0a0a',      // Near black
          '700': '#1a1a1a',      // Very dark gray
          '600': '#262626',      // Dark gray
          '500': '#404040',      // Medium gray
          '400': '#525252',      // Light gray
          '300': '#737373',      // Lighter gray
          '200': '#a3a3a3',      // Very light gray
          '100': '#d4d4d4',      // Near white
        },

        // Modern document type colors with neon glow
        'doc-810': '#60a5fa',        // Bright blue for invoices
        'doc-850': '#fbbf24',        // Bright amber for purchase orders
        'doc-856': '#34d399',        // Bright emerald for ship notices
        'doc-855': '#a78bfa',        // Bright purple for acknowledgments
        'doc-997': '#22d3ee',        // Bright cyan for functional acks

        // EDI status colors with glow
        'edi': {
          'start': '#4ade80',      // Neon green
          'processing': '#fbbf24', // Neon yellow
          'error': '#f87171',      // Neon red
          'complete': '#60a5fa',   // Neon blue
          'warning': '#fb923c',    // Neon orange
        },

        // Accent colors for stealth theme
        'accent': {
          'blue': '#3b82f6',
          'purple': '#8b5cf6',
          'emerald': '#10b981',
          'amber': '#f59e0b',
          'cyan': '#06b6d4',
          'neon-green': '#39ff14',
          'neon-pink': '#ff006e',
          'neon-blue': '#00f5ff',
        },
      },

      // Stealth shadows with glow effects
      boxShadow: {
        'stealth-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.8)',
        'stealth': '0 1px 3px 0 rgba(0, 0, 0, 0.9), 0 1px 2px 0 rgba(0, 0, 0, 0.8)',
        'stealth-md': '0 4px 6px -1px rgba(0, 0, 0, 0.9), 0 2px 4px -1px rgba(0, 0, 0, 0.8)',
        'stealth-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.9), 0 4px 6px -2px rgba(0, 0, 0, 0.8)',
        'stealth-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.9), 0 10px 10px -5px rgba(0, 0, 0, 0.8)',
        'neon-glow': '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
        'neon-glow-lg': '0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.4)',
      },

      // Custom animations
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },

      keyframes: {
        glow: {
          'from': { boxShadow: '0 0 10px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.2)' },
          'to': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
      },

      // Enhanced transitions
      transitionProperty: {
        'colors-shadow': 'color, background-color, border-color, box-shadow',
      },

      // Custom fonts for stealth theme
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

