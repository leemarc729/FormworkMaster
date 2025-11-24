import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],

    // Cloud Run 上不會使用 dev server，但保持完整
    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    // 🔥 build 非常重要：輸出到 dist
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
    },

    // 🔥 讓 React Router / SPA 能正常刷新
    base: '/',

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },

    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    }
  };
});
