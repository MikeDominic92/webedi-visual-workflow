/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'edi-start': '#10b981',    // green
        'edi-processing': '#f59e0b', // yellow
        'edi-error': '#ef4444',      // red
        'edi-complete': '#3b82f6',   // blue
      }
    },
  },
  plugins: [],
}

