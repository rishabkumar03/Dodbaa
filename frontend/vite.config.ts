import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {

      // During development : proxies/api calls to my backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }

})
