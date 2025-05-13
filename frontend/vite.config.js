import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // use polling to detect file changes on Windows
      usePolling: true,
      interval: 100
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    },
    hmr: {
      overlay: true
    },

    
  }
});
