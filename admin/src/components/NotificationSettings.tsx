import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  subscribeToPushNotifications,
  unsubscribeFromPush,
  getPushSubscription,
  arePushNotificationsSupported,
  getNotificationPermission,
} from '@/lib/pwa'

export function NotificationSettings() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    checkSubscription()
    setPermission(getNotificationPermission())
  }, [])

  async function checkSubscription() {
    const subscription = await getPushSubscription()
    setIsSubscribed(!!subscription)
  }

  async function handleSubscribe() {
    setIsLoading(true)
    try {
      // TODO: Get VAPID public key from your server
      const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY_HERE'

      const subscription = await subscribeToPushNotifications(VAPID_PUBLIC_KEY)

      if (subscription) {
        // Send subscription to your server
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        })

        setIsSubscribed(true)
        setPermission('granted')
      }
    } catch (error) {
      console.error('Failed to subscribe:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUnsubscribe() {
    setIsLoading(true)
    try {
      const success = await unsubscribeFromPush()
      if (success) {
        // Notify your server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
        })

        setIsSubscribed(false)
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!arePushNotificationsSupported()) {
    return (
      <div className="text-sm text-muted-foreground">
        Push notifications are not supported in your browser
      </div>
    )
  }

  if (permission === 'denied') {
    return (
      <div className="text-sm text-muted-foreground">
        Notifications are blocked. Please enable them in your browser settings.
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
    </div>
  )
}
