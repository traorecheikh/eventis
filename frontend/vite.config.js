import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['tests/e2e/**', '**/node_modules/**']
  },
  server: {
    proxy: {
      '/api': 'http://localhost:80'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
