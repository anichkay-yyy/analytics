import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  subscribeToPushNotifications,
  unsubscribeFromPush,
  getPushSubscription,
  arePushNotificationsSupported,
  getNotificationPermission,
} from '@/lib/pwa'

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

function isStandalone(): boolean {
  return ('standalone' in navigator && (navigator as any).standalone === true)
    || window.matchMedia('(display-mode: standalone)').matches
}

export function NotificationSettings() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    checkSubscription()
    setPermission(getNotificationPermission())
  }, [])

  async function checkSubscription() {
    try {
      const subscription = await getPushSubscription()
      setIsSubscribed(!!subscription)
    } catch {
      // SW not ready yet
    }
  }

  async function handleSubscribe() {
    setIsLoading(true)
    setError(null)
    try {
      const subscription = await subscribeToPushNotifications(
        import.meta.env.VITE_VAPID_PUBLIC_KEY
      )

      if (subscription) {
        setIsSubscribed(true)
        setPermission('granted')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('Failed to subscribe:', message)
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUnsubscribe() {
    setIsLoading(true)
    setError(null)
    try {
      const success = await unsubscribeFromPush()
      if (success) {
        setIsSubscribed(false)
      }
    } catch (err) {
      console.error('Failed to unsubscribe:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // iOS in browser (not installed PWA)
  if (isIOS() && !isStandalone()) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Push Notifications</h3>
        <p className="text-sm text-muted-foreground">
          To enable notifications on iOS, install this app first:
        </p>
        <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
          <li>Tap the <strong>Share</strong> button in Safari</li>
          <li>Select <strong>Add to Home Screen</strong></li>
          <li>Open the app from Home Screen</li>
          <li>Enable notifications in Settings</li>
        </ol>
      </div>
    )
  }

  if (!arePushNotificationsSupported()) {
    return (
      <div className="text-sm text-muted-foreground">
        Push notifications are not supported in this browser
      </div>
    )
  }

  if (permission === 'denied') {
    return (
      <div className="text-sm text-muted-foreground">
        Notifications are blocked. Please enable them in browser settings.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Push Notifications</h3>
          <p className="text-xs text-muted-foreground">
            {isSubscribed
              ? 'You will receive notifications'
              : 'Enable to receive updates'}
          </p>
        </div>
        <Button
          variant={isSubscribed ? 'outline' : 'default'}
          size="sm"
          onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : isSubscribed ? 'Disable' : 'Enable'}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}
