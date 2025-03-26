/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import { default as tailwindColors } from 'tailwindcss/colors';

const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      // Explicitly include all Tailwind v4 colors
      transparent: 'transparent',
      current: 'currentColor',
      black: tailwindColors.black,
      white: tailwindColors.white,
      gray: tailwindColors.gray,
      red: tailwindColors.red,
      orange: tailwindColors.orange,
      yellow: tailwindColors.yellow,
      green: tailwindColors.green,
      blue: tailwindColors.blue,
      indigo: tailwindColors.indigo,
      purple: tailwindColors.purple,
      pink: tailwindColors.pink,
    },
    extend: {
      colors: {
        primary: 'rgb(var(--primary-color))',
        secondary: 'rgb(var(--secondary-color))',
        accent: 'rgb(var(--accent-color))',
      },
    },
  },
  plugins: [
    forms,
    typography,
  ],
};

export default config;