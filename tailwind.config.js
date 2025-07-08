// ====================================================================================
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
        colors: {
            'dark-bg': '#111827',
            'dark-surface': '#1f2937',
            'dark-border': '#374151',
            'dark-text': '#f9fafb',
            'dark-text-secondary': '#9ca3af',
            'brand-blue': '#2563eb',
        }
    },
  },
  plugins: [],
}


// ====================================================================================
// ===== End of File: tailwind.config.js =====

