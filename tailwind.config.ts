import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        cyber: {
          black: '#050505',
          dark: '#0a0a0c',
          panel: '#111116',
          border: '#2a2a35',
          cyan: '#00f0ff',
          blue: '#2d60ff',
          purple: '#b967ff',
          orange: '#ff6b00',
          green: '#00ff9d',
          text: '#e0e0e0',
          muted: '#858595',
        },
      },
    },
  },
} satisfies Config;
