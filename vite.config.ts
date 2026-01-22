import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages project sites are served from /<repo-name>/
  // Repo: https://github.com/hrushikesh1310/React_AI
  base: '/React_AI/',
  plugins: [react()],
})
