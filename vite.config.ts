import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // set base to repository name so built asset URLs are /<repo>/assets/...
  base: '/minesweeper/',
  plugins: [react()],
})
