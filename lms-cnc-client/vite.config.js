import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { mockApiPlugin } from './mockApi.js';

// target backend untuk proxy dev jika user menjalankan server PHP sendiri (opsional)
const HAS_CUSTOM_BACKEND = !!process.env.DEV_API_URL;
const BACKEND = process.env.DEV_API_URL || 'http://127.0.0.1:8000';

export default defineConfig({
  base: './', // aset relatif → bisa di-root public_html maupun subfolder
  plugins: [react(), !HAS_CUSTOM_BACKEND && mockApiPlugin()],
  server: {
    port: 5173,
    proxy: HAS_CUSTOM_BACKEND ? {
      '/api': BACKEND,
      '/uploads': BACKEND
    } : undefined
  }
});
