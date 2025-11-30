import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#1e3a8a',
        'brand-secondary': '#3b82f6',
        'brand-accent': '#10b981',
        'base-100': '#ffffff',
        'base-200': '#f3f4f6',
        'base-300': '#e5e7eb',
        'text-primary': '#111827',
        'text-secondary': '#4b5563',
      },
    },
  },
  plugins: [],
};

export default config;
