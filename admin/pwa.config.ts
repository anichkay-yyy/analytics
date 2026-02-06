import { defineConfig } from '@anichkay/pwa-lib/config'

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
    serverUrl: 'https://notifications.anichkay.dev',
    appId: 'a1d94604-282d-4e22-abfd-1c253055df29',
    apiKey: 'pna_29c255b703c8e26b207fbb1904fa58ac696ba3d01afb657a',
    vapidPublicKey: 'BLqaOvP6KbYuiOE0sCcj3F82VKzlLg8z9SZl3qkFsUT8buVsGRFfBl_xZ-2N7JnSs44_X7sNNuRYP5ZdslRu9pc',
  },

  outDir: './public/icons',
})
