import { registerSW, notifications } from 'pwa-lib/client'

/**
 * Initialize PWA Service Worker
 */
export async function initPWA() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers are not supported')
    return null
  }

  try {
    const registration = await registerSW('/sw.js', {
      onUpdate: (reg) => {
        console.log('New version available! Please refresh.')
        // TODO: Show user notification about update
      },
      onReady: (reg) => {
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

/**
 * Request notification permission and subscribe to push
 */
export async function subscribeToPushNotifications(
  vapidPublicKey: string
): Promise<PushSubscription | null> {
  if (!notifications.isSupported()) {
    console.warn('Push notifications are not supported')
    return null
  }

  try {
    // Request permission
    const permission = await notifications.requestPermission()

    if (permission !== 'granted') {
      console.log('Notification permission denied')
      return null
    }

    // Subscribe to push
    const subscription = await notifications.subscribe({
      applicationServerKey: vapidPublicKey,
    })

    console.log('Push subscription created:', subscription)
    return subscription
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error)
    return null
  }
}

/**
 * Get current push subscription
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!notifications.isSupported()) {
    return null
  }

  try {
    return await notifications.getSubscription()
  } catch (error) {
    console.error('Failed to get push subscription:', error)
    return null
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!notifications.isSupported()) {
    return false
  }

  try {
    const success = await notifications.unsubscribe()
    console.log('Unsubscribed from push:', success)
    return success
  } catch (error) {
    console.error('Failed to unsubscribe from push:', error)
    return false
  }
}

/**
 * Check if push notifications are supported
 */
export function arePushNotificationsSupported(): boolean {
  return notifications.isSupported()
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied'
  }
  return Notification.permission
}
