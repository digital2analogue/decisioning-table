import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// brand-tokens lives as a sibling of decisioning-table in Github/.
// From main repo root that's 1 level up. (In a worktree this path won't
// resolve — change temporarily to '../../../../brand-tokens' for local dev.)
const BRAND_TOKENS_PATH = path.resolve(__dirname, '../brand-tokens')

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
