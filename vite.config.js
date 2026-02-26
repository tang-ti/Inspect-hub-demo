import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For GitHub Pages, set REPO_NAME env var to your repo name (e.g. 'inspect-hub')
const base = process.env.REPO_NAME ? `/${process.env.REPO_NAME}/` : '/'

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
