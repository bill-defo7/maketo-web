import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// En dev, le front appelle /api et /fichiers sur le même port (5173) :
// Vite relaie vers Spring Boot (8081). Pas de souci de CORS ni de cookie.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Maketo — le marché des étudiants',
        short_name: 'Maketo',
        description: 'Vends et achète entre étudiants du campus ESTLC.',
        lang: 'fr',
        start_url: '/',
        display: 'standalone',
        background_color: '#FFF7F0',
        theme_color: '#1A1411',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api/, /^\/fichiers/],
        runtimeCaching: [
          {
            // Photos : servies depuis le cache (économise le forfait data)
            urlPattern: ({ url }) => url.pathname.startsWith('/fichiers/') || url.hostname.endsWith('cloudinary.com'),
            handler: 'CacheFirst',
            options: { cacheName: 'maketo-photos', expiration: { maxEntries: 300, maxAgeSeconds: 30 * 24 * 3600 } }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8081',
      '/fichiers': 'http://localhost:8081'
    }
  }
});
