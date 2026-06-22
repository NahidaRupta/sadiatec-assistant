import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/components/chat/**/*.{ts,tsx}',
    './src/widget-embed/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  corePlugins: {
    preflight: false,
    container: false, // never emit the global .container utility — collides with host page
  },
  theme: {
    extend: {
      colors: {
        accent: 'var(--sad-accent, #4f46e5)',
      },
    },
  },
}

export default config