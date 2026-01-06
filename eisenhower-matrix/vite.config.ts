import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 如果要部署到 GitHub Pages,請取消註解並修改為你的 repo 名稱
  // base: '/eisenhower-matrix/',
})
