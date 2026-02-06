import { registerSW, notifications, createPushClient, PushClientError } from '@anichkay/pwa-lib/client'

export { registerSW, notifications, createPushClient, PushClientError }

export async function initPWA() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers are not supported')
    return null
  }

  try {
    const registration = await registerSW('/sw.js', {
      onUpdate: () => {
        console.log('New version available! Please refresh.')
      },
      onReady: () => {
        console.log('Service Worker is ready')
      },
      onError: (err) => {
        console.error('Service Worker registration failed:', err)
      },
    })
    return registration
  } catch (error) {
    console.error('Failed to initialize PWA:', error)
    return null
  }
}
