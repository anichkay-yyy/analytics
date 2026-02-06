// Inlined from pwa-lib/client — zero dependencies

interface SwRegisterOptions {
  onUpdate?: (registration: ServiceWorkerRegistration) => void
  onReady?: (registration: ServiceWorkerRegistration) => void
  onError?: (error: Error) => void
}

interface SubscribeOptions {
  applicationServerKey: string
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

async function registerSW(
  swUrl = '/sw.js',
  options: SwRegisterOptions = {}
): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Workers are not supported in this browser')
  }
  try {
    const registration = await navigator.serviceWorker.register(swUrl, { scope: '/' })
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (!newWorker) return
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'activated') {
          if (navigator.serviceWorker.controller) {
            options.onUpdate?.(registration)
          } else {
            options.onReady?.(registration)
          }
        }
      })
    })
    if (registration.active) {
      options.onReady?.(registration)
    }
    return registration
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    options.onError?.(error)
    throw error
  }
}

const notifications = {
  isSupported(): boolean {
    return 'Notification' in globalThis && 'PushManager' in globalThis && 'serviceWorker' in navigator
  },
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in globalThis)) {
      throw new Error('Notifications are not supported')
    }
    return Notification.requestPermission()
  },
  async subscribe(options: SubscribeOptions): Promise<PushSubscription> {
    const registration = await navigator.serviceWorker.ready
    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(options.applicationServerKey) as unknown as BufferSource,
    })
  },
  async getSubscription(): Promise<PushSubscription | null> {
    const registration = await navigator.serviceWorker.ready
    return registration.pushManager.getSubscription()
  },
  async unsubscribe(): Promise<boolean> {
    const subscription = await this.getSubscription()
    if (!subscription) return false
    return subscription.unsubscribe()
  },
}

// --- Public API ---

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

export async function subscribeToPushNotifications(
  vapidPublicKey: string
): Promise<PushSubscription | null> {
  if (!notifications.isSupported()) {
    console.warn('Push notifications are not supported')
    return null
  }

  const permission = await notifications.requestPermission()
  if (permission !== 'granted') {
    console.log('Notification permission denied')
    return null
  }

  return notifications.subscribe({ applicationServerKey: vapidPublicKey })
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!notifications.isSupported()) return null
  return notifications.getSubscription()
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (!notifications.isSupported()) return false
  return notifications.unsubscribe()
}

export function arePushNotificationsSupported(): boolean {
  return notifications.isSupported()
}

export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied'
  return Notification.permission
}
