import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@api': path.resolve(__dirname, './src/api'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api-proxy-producao': {
        target: 'http://179.0.177.138:8091',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy-producao/, ''),
      },
      '/api-proxy-teste': {
        target: 'http://179.0.177.138:8092',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy-teste/, ''),
      }
    }
  }
})