/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme color palette
        'dark': {
          'primary': '#1a1a1a',      // Primary background
          'secondary': '#2d2d2d',    // Secondary backgrounds
          'tertiary': '#3a3a3a',     // Tertiary backgrounds
          'text': '#f5f5f5',         // Primary text
          'text-secondary': '#b3b3b3', // Secondary text
          'text-muted': '#808080',   // Muted text
        },

        // Modern document type colors (replacing red/brick scheme)
        'doc-810': '#3b82f6',        // Blue for invoices (was red)
        'doc-850': '#f59e0b',        // Amber for purchase orders
        'doc-856': '#10b981',        // Emerald for ship notices
        'doc-855': '#8b5cf6',        // Purple for acknowledgments
        'doc-997': '#06b6d4',        // Cyan for functional acks

        // Status colors for dark theme
        'status': {
          'success': '#10b981',      // Green
          'warning': '#f59e0b',      // Amber
          'error': '#ef4444',        // Red
          'info': '#3b82f6',         // Blue
          'processing': '#8b5cf6',   // Purple
        },

        // Accent colors
        'accent': {
          'blue': '#3b82f6',
          'purple': '#8b5cf6',
          'emerald': '#10b981',
          'amber': '#f59e0b',
          'cyan': '#06b6d4',
        },

        // Legacy EDI colors (updated for dark theme)
        'edi-start': '#10b981',      // green
        'edi-processing': '#f59e0b', // yellow
        'edi-error': '#ef4444',      // red
        'edi-complete': '#3b82f6',   // blue
        'edi-warning': '#f59e0b',    // amber
      },

      // Enhanced shadows for dark theme
      boxShadow: {
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'dark': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        'dark-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
      },

      // Enhanced transitions
      transitionProperty: {
        'colors-shadow': 'color, background-color, border-color, box-shadow',
      }
    },
  },
  plugins: [],
}

