import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // expose on local network (0.0.0.0) so phones on the same WiFi can reach it
    proxy: {
      '/api': {
        target: 'https://lostx-app.onrender.com',
        changeOrigin: true
      },
      '/uploads': {
        target: 'https://lostx-app.onrender.com',
        changeOrigin: true
      }
    }
  }
});
