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
      // Phase 4: Proxy API calls to avoid CORS in development
      proxy: {
        // Phase 5: Backend API
        '/api/v1': {
          target: 'http://localhost:3002',
          changeOrigin: true,
        },
        // Phase 4: External AI APIs
        '/api/mimo': {
          target: 'https://api.xiaomimimo.com',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/mimo/, ''),
        },
        '/api/tavily': {
          target: 'https://api.tavily.com',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/tavily/, ''),
        },
      },
    },
  };
});
