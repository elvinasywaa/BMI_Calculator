import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,txt}'],
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: true, // Aktifkan PWA di mode dev
      },
      manifest: {
        name: 'BMI Calculator',
        short_name: 'BMI Calc',
        description: 'A simple BMI Calculator PWA built with React and Vite.',
        theme_color: '#8A2BE2', // Warna ungu dari referensi
        background_color: '#F3E8FF', // Warna latar belakang ungu muda
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icon-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
});