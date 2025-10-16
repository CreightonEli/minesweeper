import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/minesweeper/', // change to '/' for user site or keep '/<repo>/' for project site
  plugins: [react()],
})
