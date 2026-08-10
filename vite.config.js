import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Buyly',
        short_name: 'Buyly',
        description: 'Your shopping companion',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/android/launchericon-48x48.png', sizes: '48x48', type: 'image/png', purpose: 'any' },
          { src: '/android/launchericon-72x72.png', sizes: '72x72', type: 'image/png', purpose: 'any' },
          { src: '/android/launchericon-96x96.png', sizes: '96x96', type: 'image/png', purpose: 'any' },
          { src: '/android/launchericon-144x144.png', sizes: '144x144', type: 'image/png', purpose: 'any' },
          { src: '/android/launchericon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/android/launchericon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/android/maskable-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/android/maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
})