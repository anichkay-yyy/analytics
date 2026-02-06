import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { notifications, createPushClient, PushClientError } from '@anichkay/pwa-lib/client'

const push = createPushClient()

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
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  async function checkSubscription() {
    try {
      const subscription = await notifications.getSubscription()
      setIsSubscribed(!!subscription)
    } catch {
      // SW not ready yet
    }
  }

  async function handleSubscribe() {
    setIsLoading(true)
    setError(null)
    try {
      await push.subscribe()
      setIsSubscribed(true)
      setPermission('granted')
    } catch (err) {
      if (err instanceof PushClientError) {
        switch (err.code) {
          case 'PERMISSION_DENIED':
            setPermission('denied')
            setError('Разрешите уведомления в настройках браузера')
            break
          case 'NETWORK_ERROR':
          case 'VAPID_FETCH_FAILED':
          case 'SERVER_SUBSCRIBE_FAILED':
            setError('Ошибка сервера. Попробуйте позже.')
            break
          default:
            setError('Не удалось подписаться на уведомления')
        }
      } else {
        console.error('Failed to subscribe:', err)
        setError('Не удалось подписаться на уведомления')
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUnsubscribe() {
    setIsLoading(true)
    setError(null)
    try {
      await push.unsubscribe()
      setIsSubscribed(false)
    } catch (err) {
      if (err instanceof PushClientError && err.code === 'SERVER_UNSUBSCRIBE_FAILED') {
        setError('Ошибка сервера. Попробуйте позже.')
      } else {
        console.error('Failed to unsubscribe:', err)
      }
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

  if (!notifications.isSupported()) {
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
