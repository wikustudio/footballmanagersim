import { defineConfig, type Plugin } from 'vite'
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

// Prevents Vite dev server from base64-inlining 15+ MB of sourcemaps onto large TS/TSX modules over Cloud Run preview
function stripDevSourceMaps(): Plugin {
  return {
    name: 'fms-strip-dev-sourcemaps',
    apply: 'serve',
    enforce: 'post',
    transform(code, id) {
      if (id.includes('/src/') && !id.includes('node_modules')) {
        return { code, map: { mappings: '' } as any };
      }
      return null;
    },
  };
}

// Vite 6 still injects /@vite/client and attempts a WebSocket connection even when server.hmr === false,
// causing "WebSocket closed without opened." errors behind reverse proxies (and breaking plugins like
// vite-plugin-pwa that call import.meta.hot.send in dev). Replace the client WS transport with a clean no-op.
function disableHmrWebSocket(): Plugin {
  return {
    name: 'fms-disable-hmr-websocket',
    apply: 'serve',
    enforce: 'post',
    transform(code, id) {
      if (id.includes('vite/dist/client/client.mjs') || id.endsWith('/@vite/client')) {
        const replaced = code.replace(
          /const createWebSocketModuleRunnerTransport = \(options\) => \{[\s\S]*?return \{[\s\S]*?send\(data\) \{[\s\S]*?\}\s*\};\s*\};/,
          `const createWebSocketModuleRunnerTransport = () => ({
  async connect() {},
  disconnect() {},
  send() {}
});`
        );
        return { code: replaced, map: null };
      }
      return null;
    },
  };
}

export default defineConfig({
  esbuild: {
    sourcemap: false,
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
    hmr: false,
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  css: {
    devSourcemap: false,
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'motion', 'motion/react'],
  },
  optimizeDeps: {
    holdUntilCrawlEnd: true,
    include: [
      'react',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom',
      'react-dom/client',
      'motion',
      'motion/react',
      'lucide-react',
      'canvas-confetti',
      'chart.js',
      'react-chartjs-2',
      'html-to-image',
      '@supabase/supabase-js',
      'workbox-window',
    ],
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'vendor-charts';
            if (id.includes('@supabase')) return 'vendor-supabase';
            return 'vendor';
          }
          if (id.includes('/src/mod-data/teams')) return 'mod-teams';
          if (id.includes('/src/data/clubsData') || id.includes('/src/data/randomEvents')) return 'game-data';
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    stripDevSourceMaps(),
    disableHmrWebSocket(),
    VitePWA({
      registerType: 'prompt', // never auto-reload mid-session (an unsaved season-end would be lost)
      manifest: false, // Single source of truth: /public/manifest.json linked in index.html
      includeAssets: ['manifest.json', 'favicon.ico', 'favicon.png', 'favicon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'assets/a_footballsim_logo.jpg'],
      devOptions: {
        enabled: true,
        type: 'module',
      },
      workbox: {
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    })
  ]
})
