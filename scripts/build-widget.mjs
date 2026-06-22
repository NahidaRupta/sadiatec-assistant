import * as esbuild from 'esbuild'
import { execSync } from 'child_process'
import postcss from 'postcss'
import prefixSelector from 'postcss-prefix-selector'
import { readFileSync, writeFileSync } from 'fs'

// 1. Bundle the React entry point
await esbuild.build({
  entryPoints: ['src/widget-embed/entry.tsx'],
  bundle: true,
  minify: true,
  format: 'iife',
  outfile: 'public/widget-dist/widget.js',
  loader: { '.tsx': 'tsx', '.css': 'empty' },
  define: { 'process.env.NODE_ENV': '"production"' },
  jsx: 'automatic',
  alias: { '@': './src' },
})

console.log('✓ widget.js built')

// 2. Compile Tailwind CSS to a temp file first
execSync(
  'npx tailwindcss -c tailwind.widget.config.ts -i src/widget-embed/widget.css -o public/widget-dist/widget.raw.css --minify',
  { stdio: 'inherit' },
)

// 3. Scope EVERY selector (including * and :where()) under our root via PostCSS
const rawCss = readFileSync('public/widget-dist/widget.raw.css', 'utf8')

const result = await postcss([
  prefixSelector({
    prefix: '#sadiatec-assistant-root',
    transform(prefix, selector, prefixedSelector) {
      // Universal selector and pseudo-elements need special handling
      if (selector === '*' || selector.startsWith('*,') || selector.includes('*::') || selector.includes('*:')) {
        return selector
          .split(',')
          .map((s) => `${prefix} ${s.trim()}`)
          .join(', ')
      }
      // Don't double-prefix if it's already our root
      if (selector.includes('#sadiatec-assistant-root')) {
        return selector
      }
      return prefixedSelector
    },
  }),
]).process(rawCss, { from: undefined })

writeFileSync('public/widget-dist/widget.css', result.css)

console.log('✓ widget.css scoped + built')