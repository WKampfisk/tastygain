import base44 from '@base44/vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
// @base44/vite-plugin enables editor preview (iframe HMR, visual edit, navigation notify)
export default defineConfig({
  logLevel: 'error',
  plugins: [
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // SPA fallback for Base44 hosting + editor preview routes
  server: {
    host: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
