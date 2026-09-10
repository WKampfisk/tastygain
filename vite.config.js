import base44 from '@base44/vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const githubPages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  logLevel: 'error',
  base: githubPages ? '/tastygain/' : '/',
  plugins: [
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: !githubPages,
      navigationNotifier: false,
      analyticsTracker: false,
      visualEditAgent: false,
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
