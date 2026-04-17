import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// brand-tokens lives as a sibling of decisioning-table in Github/.
// From this worktree (.claude/worktrees/<name>/) that's 4 levels up.
// When merged to main the relative path becomes '../brand-tokens' (1 level up) — update accordingly.
const BRAND_TOKENS_PATH = path.resolve(__dirname, '../../../../brand-tokens')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'brand-tokens': BRAND_TOKENS_PATH,
    },
  },
  server: {
    fs: {
      // Allow serving files from the brand-tokens repo outside the project root
      allow: [__dirname, BRAND_TOKENS_PATH],
    },
  },
})
