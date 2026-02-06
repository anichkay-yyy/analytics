import { Card } from '@/components/ui/card'
import { NotificationSettings } from '@/components/NotificationSettings'

export function Settings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and notification preferences
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Notifications Card */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Notifications</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Configure push notifications for important events
              </p>
            </div>
            <NotificationSettings />
          </div>
        </Card>

        {/* PWA Info Card */}
        <Card className="p-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Progressive Web App</h2>
            <p className="text-sm text-muted-foreground">
              This application can be installed on your device for a native app experience.
            </p>
            <div className="pt-2 text-sm">
              <p className="font-medium mb-2">Features:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Works offline with smart caching</li>
                <li>Install as a desktop or mobile app</li>
                <li>Receive push notifications</li>
                <li>Fast loading with service worker</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
