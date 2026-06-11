import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
  proxy: {
    '/api': {
      target: 'https://safepulse-production-4e0d.up.railway.app',
      changeOrigin: true,
      secure: false,
    }
  }
}
})