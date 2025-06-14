import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // port: 5000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8899',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // 配置静态资源目录
  publicDir: 'public'
})
