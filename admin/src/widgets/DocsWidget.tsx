import { useAuth } from '@/context/AuthContext';
import { WidgetAuth } from './WidgetAuth';

export function DocsWidget() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-full bg-black p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <WidgetAuth onSuccess={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-full bg-black p-4 sm:p-6 overflow-auto">
      <div className="max-w-3xl mx-auto prose prose-invert prose-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">Analytics Widgets</h1>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">Available Widgets</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 text-muted-foreground">Widget</th>
                  <th className="text-left py-2 px-2 text-muted-foreground">Path</th>
                  <th className="text-left py-2 px-2 text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-border/50">
                  <td className="py-2 px-2 font-medium">Stats</td>
                  <td className="py-2 px-2"><code className="text-primary text-xs">/widget/stats</code></td>
                  <td className="py-2 px-2">Pageviews, sessions, visitors</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-2 font-medium">Chart</td>
                  <td className="py-2 px-2"><code className="text-primary text-xs">/widget/chart</code></td>
                  <td className="py-2 px-2">Timeline area chart</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-2 font-medium">Pages</td>
                  <td className="py-2 px-2"><code className="text-primary text-xs">/widget/pages</code></td>
                  <td className="py-2 px-2">Top pages list</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-2 font-medium">Realtime</td>
                  <td className="py-2 px-2"><code className="text-primary text-xs">/widget/realtime</code></td>
                  <td className="py-2 px-2">Live stats (auto-refresh)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">Parameters</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            <li><code className="text-primary">siteId</code> — required, your site ID</li>
            <li><code className="text-primary">limit</code> — optional, for pages widget (default: 10)</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">Embed Example</h2>
          <pre className="bg-[#0C0F16] border border-border rounded-lg p-3 overflow-x-auto text-xs">
            <code className="text-green-400">{`<iframe
  src="https://analytics.example.com/widget/stats?siteId=YOUR_SITE_ID"
  width="100%"
  height="150"
  frameborder="0"
  style="border-radius: 8px;"
></iframe>`}</code>
          </pre>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">Authentication</h2>
          <p className="text-gray-300 text-sm">
            Widgets require authentication. If not logged in, a login form will appear inside the widget.
            Session is shared across all widgets on the same domain.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">API Endpoint</h2>
          <p className="text-gray-300 text-sm mb-2">
            Get all widgets programmatically:
          </p>
          <pre className="bg-[#0C0F16] border border-border rounded-lg p-3 overflow-x-auto text-xs">
            <code className="text-green-400">GET /api/widgets</code>
          </pre>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Tracking Script</h2>
          <p className="text-gray-300 text-sm mb-2">
            Add this to your website:
          </p>
          <pre className="bg-[#0C0F16] border border-border rounded-lg p-3 overflow-x-auto text-xs">
            <code className="text-green-400">{`<script src="https://analytics.example.com/sdk/YOUR_API_KEY.js"></script>`}</code>
          </pre>
          <p className="text-gray-300 text-sm mt-2">
            Custom events:
          </p>
          <pre className="bg-[#0C0F16] border border-border rounded-lg p-3 overflow-x-auto text-xs">
            <code className="text-green-400">{`Analytics.track('event_name', { key: 'value' });`}</code>
          </pre>
        </section>
      </div>
    </div>
  );
}
