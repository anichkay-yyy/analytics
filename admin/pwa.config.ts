import { defineConfig } from 'pwa-lib/config'

export default defineConfig({
  icon: './public/icon.png',

  manifest: {
    name: 'Anich Analytics',
    short_name: 'Analytics',
    description: 'Web analytics dashboard',
    theme_color: '#3F51B5',
    background_color: '#ffffff',
    display: 'standalone',
    start_url: '/',
    scope: '/',
    lang: 'ru',
    orientation: 'any',
  },

  sw: {
    output: './public/sw.js',
    precache: [],
    routes: [
      {
        match: '/api/**',
        strategy: 'NetworkFirst',
        cache: 'api-cache',
        maxAge: 60 * 5,
      },
      {
        match: '*.{png,jpg,jpeg,gif,svg,webp,ico}',
        strategy: 'CacheFirst',
        cache: 'images',
        maxAge: 60 * 60 * 24 * 30,
        maxEntries: 100,
      },
      {
        match: '*.{woff,woff2,ttf,eot}',
        strategy: 'CacheFirst',
        cache: 'fonts',
        maxAge: 60 * 60 * 24 * 365,
      },
      {
        match: '/**',
        strategy: 'StaleWhileRevalidate',
        cache: 'pages',
      },
    ],
  },

  notifications: {
    defaultIcon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
  },

  outDir: './public/icons',
})
