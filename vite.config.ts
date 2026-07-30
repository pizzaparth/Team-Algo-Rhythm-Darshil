import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Proxy the backend API (including /api/v1/ai — the mimo/Tavily
      // proxy routes in server/routes/ai.ts) to avoid CORS in development.
      // This is the same route prefix used in production, so AI features
      // work identically in both — no more separate dev-only proxy
      // straight to the external providers (that bypassed the server
      // entirely and only worked in `npm run dev`).
      proxy: {
        '/api/v1': {
          target: 'http://localhost:3002',
          changeOrigin: true,
        },
      },
    },
  };
});
