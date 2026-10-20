import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const ROTATED_PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdycmhsaGhpbm1qZ2xudm1tYnpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MDM3ODYsImV4cCI6MjEwMzA3OTc4Nn0.rqONT4AeXhmFNL-r9nrMc7V35cSDloCiELILkk1roYY';
if (
  !process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY.trim().startsWith('sb_secret_') ||
  process.env.VITE_SUPABASE_ANON_KEY.trim().includes(' ')
) {
  process.env.VITE_SUPABASE_ANON_KEY = ROTATED_PUBLIC_ANON_KEY;
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false // PWA is mostly for prod
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/api/]
      },
      manifest: {
        id: '/',
        name: 'Football Manager Sim',
        short_name: 'FootySim',
        description: 'A 35-season football management simulation game. Direct tactics, manage club finances, develop youth academies, and lead your squad to silverware.',
        theme_color: '#0a0a0c',
        background_color: '#0a0a0c',
        display: 'standalone',
        orientation: 'any',
        categories: ['games', 'sports', 'entertainment'],
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ]
})
