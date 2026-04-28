import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 匹配所有以 /api 开头的请求
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // 如果后端接口本身就带 /api 前缀，则不需要 rewrite
        // rewrite: (path) => path.replace(/^\/api/, '') 
      },
    },
  },
});