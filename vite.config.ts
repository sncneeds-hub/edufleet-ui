import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // 🔥 Fix for Vercel build error:
  optimizeDeps: {
    include: ['@rolldown/pluginutils'],
  },

  server: {
    port: 3000,
    host: true,
    allowedHosts: true,
    hmr: { overlay: false },
  },

  build: {
    outDir: 'dist',
  },

  base: '/',
});
