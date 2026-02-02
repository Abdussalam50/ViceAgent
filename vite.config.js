import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Gabungkan semua plugin ke dalam satu array plugins
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'], // Opsional: aset tambahan
      manifest: {
        name: 'ViceAgent Dashboard',
        short_name: 'ViceAgent',
        description: 'Simple & Powerful Code Health Dashboard',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000', 
        icons: [
          {
            src: '/icon-192.png', 
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Bagus untuk tampilan icon di Android
          }
        ]
      }
    })
  ]
})