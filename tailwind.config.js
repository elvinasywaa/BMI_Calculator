/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-purple': '#8A2BE2', // Ungu (BlueViolet)
        'brand-blue': '#4169E1', // Biru (RoyalBlue)
        'brand-light-purple': '#F3E8FF', // Latar belakang ungu muda
        'brand-gray': '#F4F7FF', // Latar belakang kartu
        'text-primary': '#1F2937',
        'text-secondary': '#6B7280',
      }
    },
  },
  plugins: [],
}