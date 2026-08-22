import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'src/renderer'),
  base: './',
  plugins: [vue()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 100,
      ignored: [
        '**/node_modules/**',
        '**/desktop/**',
        '**/blackbox/**',
        '**/vendor/**',
        '**/data/**',
        '**/docker/**',
        '**/dist/**',
        '**/out/**',
        '**/.git/**'
      ]
    }
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true
  }
});
