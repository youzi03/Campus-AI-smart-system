import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // 作为静态文件服务器，不处理 Vue SFC 编译
  // 项目使用 CDN 加载的 Vue 3 + Element Plus，无需编译
  server: {
    port: 3000,
    // 代理 /api 请求到后端 Spring Boot
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
