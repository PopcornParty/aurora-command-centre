import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/aurora-command-centre/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  }
})
