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

  const baseUrl = window.location.origin;

  return (
    <div className="min-h-full bg-black p-4 sm:p-6 overflow-auto">
      <div className="max-w-3xl mx-auto prose prose-invert prose-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">Anich Analytics</h1>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">Виджеты</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 text-muted-foreground">Виджет</th>
                  <th className="text-left py-2 px-2 text-muted-foreground">Путь</th>
                  <th className="text-left py-2 px-2 text-muted-foreground">Описание</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-border/50">
                  <td className="py-2 px-2 font-medium">Stats</td>
                  <td className="py-2 px-2"><code className="text-primary text-xs">/widget/stats</code></td>
                  <td className="py-2 px-2">Просмотры, сессии, посетители</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-2 font-medium">Chart</td>
                  <td className="py-2 px-2"><code className="text-primary text-xs">/widget/chart</code></td>
                  <td className="py-2 px-2">График просмотров</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-2 font-medium">Pages</td>
                  <td className="py-2 px-2"><code className="text-primary text-xs">/widget/pages</code></td>
                  <td className="py-2 px-2">Топ страниц</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-2 font-medium">Realtime</td>
                  <td className="py-2 px-2"><code className="text-primary text-xs">/widget/realtime</code></td>
                  <td className="py-2 px-2">Live-статистика</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">Параметры</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            <li><code className="text-primary">siteId</code> — обязательный, ID сайта</li>
            <li><code className="text-primary">limit</code> — опциональный, для pages (по умолчанию 10)</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">Встраивание виджета</h2>
          <pre className="bg-[#0C0F16] border border-border rounded-lg p-3 overflow-x-auto text-xs">
            <code className="text-green-400">{`<iframe
  src="${baseUrl}/widget/stats?siteId=YOUR_SITE_ID"
  width="100%"
  height="150"
  frameborder="0"
></iframe>`}</code>
          </pre>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">Аутентификация</h2>
          <p className="text-gray-300 text-sm">
            Виджеты требуют авторизации. Если пользователь не залогинен, появится форма входа.
            Сессия общая для всех виджетов на одном домене.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">API</h2>
          <p className="text-gray-300 text-sm mb-2">
            Получить список виджетов:
          </p>
          <pre className="bg-[#0C0F16] border border-border rounded-lg p-3 overflow-x-auto text-xs">
            <code className="text-green-400">GET {baseUrl}/api/widgets</code>
          </pre>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Скрипт трекинга</h2>
          <p className="text-gray-300 text-sm mb-2">
            Добавить на сайт:
          </p>
          <pre className="bg-[#0C0F16] border border-border rounded-lg p-3 overflow-x-auto text-xs">
            <code className="text-green-400">{`<script src="${baseUrl}/sdk/YOUR_API_KEY.js"></script>`}</code>
          </pre>
          <p className="text-gray-300 text-sm mt-3 mb-2">
            Кастомные события:
          </p>
          <pre className="bg-[#0C0F16] border border-border rounded-lg p-3 overflow-x-auto text-xs">
            <code className="text-green-400">{`Analytics.track('event_name', { key: 'value' });`}</code>
          </pre>
        </section>
      </div>
    </div>
  );
}
