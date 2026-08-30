import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 使用相对路径 base，确保部署到 GitHub Pages 项目站点（/repo/）或任意子路径下资源均可正确加载
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
})
