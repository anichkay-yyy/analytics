import { useEffect, useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api, Site } from '@/lib/api';

const WIDGET_TYPES = [
  {
    id: 'stats',
    name: 'Stats Overview',
    description: 'Shows pageviews, sessions, and unique visitors',
    path: '/widget/stats',
    height: 150,
  },
  {
    id: 'chart',
    name: 'Timeline Chart',
    description: 'Area chart showing pageviews over time',
    path: '/widget/chart',
    height: 300,
  },
  {
    id: 'pages',
    name: 'Top Pages',
    description: 'List of most viewed pages with bar visualization',
    path: '/widget/pages',
    height: 400,
  },
  {
    id: 'realtime',
    name: 'Realtime Stats',
    description: 'Live stats for today with auto-refresh',
    path: '/widget/realtime',
    height: 180,
  },
];

export function Widgets() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    api.getSites().then(setSites);
  }, []);

  useEffect(() => {
    if (sites.length > 0 && !selectedSite) {
      setSelectedSite(sites[0].id);
    }
  }, [sites, selectedSite]);

  const getIframeCode = (widget: typeof WIDGET_TYPES[0]) => {
    const baseUrl = window.location.origin;
    return `<iframe
  src="${baseUrl}${widget.path}?siteId=${selectedSite}"
  width="100%"
  height="${widget.height}"
  frameborder="0"
  style="border-radius: 12px; background: #000;"
></iframe>`;
  };

  const copyToClipboard = (text: string, widgetId: string) => {
    navigator.clipboard.writeText(text);
    setCopied(widgetId);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Embeddable Widgets</h1>
          <p className="text-muted-foreground mt-1">
            Add analytics widgets to your dashboards via iframe
          </p>
        </div>
      </div>

      {/* Site selector */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <label className="text-sm text-muted-foreground mb-2 block">Select Site</label>
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="w-full max-w-md p-2 rounded-lg bg-muted border border-border text-white"
          >
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name} ({site.domain})
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Widgets */}
      <div className="grid gap-6">
        {WIDGET_TYPES.map((widget) => (
          <Card key={widget.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    {widget.name}
                  </CardTitle>
                  <CardDescription>{widget.description}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(getIframeCode(widget), widget.id)}
                >
                  {copied === widget.id ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Embed Code</label>
                  <pre className="p-4 rounded-lg bg-black border border-border overflow-x-auto text-xs">
                    <code className="text-green-400">{getIframeCode(widget)}</code>
                  </pre>
                </div>

                {/* Preview */}
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Preview</label>
                  <div className="rounded-lg overflow-hidden border border-border" style={{ height: widget.height }}>
                    {selectedSite && (
                      <iframe
                        src={`${widget.path}?siteId=${selectedSite}`}
                        width="100%"
                        height={widget.height}
                        frameBorder="0"
                        style={{ background: '#000' }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Usage Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-white">Authentication:</strong> Widgets require authentication.
            If the user is not logged in, they will see a login form within the widget.
          </p>
          <p>
            <strong className="text-white">Parameters:</strong> All widgets require a <code className="text-primary">siteId</code> parameter.
            The Pages widget also accepts an optional <code className="text-primary">limit</code> parameter.
          </p>
          <p>
            <strong className="text-white">Styling:</strong> Widgets have a black background and match the admin theme.
            You can adjust the iframe dimensions to fit your layout.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
