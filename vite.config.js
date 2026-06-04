import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api-proxy': {
        target: 'http://localhost:5173', // placeholder, será substituído
        changeOrigin: true,
        bypass: function(req, res, proxyOptions) {
          // O proxy não deve ter URL fixa
          // A URL virá do apiClient.js
          return null;
        }
      }
    }
  }
})