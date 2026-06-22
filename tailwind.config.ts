import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary accent (indigo) — used for widget button, links, headings
        accent: 'var(--sad-accent, #4f46e5)',
        // Semantic colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      spacing: {
        '4.5': '1.125rem',
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      zIndex: {
        modal: '9999',
        widget: '9999',
      },
      animation: {
        bounce: 'bounce 1s infinite',
      },
    },
  },
  plugins: [typography],
  darkMode: 'class',
  corePlugins: {
    // Disable Preflight if using Payload's styles; enable for standalone Next.js
    preflight: true,
  },
}

export default config
