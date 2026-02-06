import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { WidgetAuth } from './WidgetAuth';
import { useSiteDomain } from './useSiteDomain';

export function PagesWidget() {
  const [searchParams] = useSearchParams();
  const siteId = searchParams.get('siteId');
  const limit = parseInt(searchParams.get('limit') || '10');
  const { user, loading: authLoading } = useAuth();
  const domain = useSiteDomain(siteId, user);
  const [pages, setPages] = useState<{ url: string; views: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    if (!siteId || !user) return;
    try {
      const data = await api.getTopPages(siteId, limit);
      setPages(data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && siteId) {
      loadData();
    }
  }, [user, siteId]);

  if (authLoading) {
    return <WidgetLoading />;
  }

  if (!user) {
    return <WidgetAuth onSuccess={loadData} />;
  }

  if (!siteId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-muted-foreground">
        Missing siteId parameter
      </div>
    );
  }

  if (loading) {
    return <WidgetLoading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  const maxViews = Math.max(...pages.map(p => p.views), 1);

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="rounded-xl bg-[#0C0F16] border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Top Pages</h3>
          {domain && <span className="text-xs text-muted-foreground font-mono">{domain}</span>}
        </div>
        {pages.length > 0 ? (
          <div className="space-y-2">
            {pages.map((page, i) => (
              <div key={i} className="relative">
                <div
                  className="absolute inset-0 bg-primary/10 rounded"
                  style={{ width: `${(page.views / maxViews) * 100}%` }}
                />
                <div className="relative flex items-center justify-between p-2">
                  <div className="flex items-center gap-2 truncate">
                    <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{page.url}</span>
                  </div>
                  <span className="text-sm font-medium ml-2">{page.views}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">No data yet</div>
        )}
      </div>
    </div>
  );
}

function WidgetLoading() {
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="rounded-xl bg-[#0C0F16] border border-border p-4">
        <div className="h-4 w-24 bg-muted rounded mb-4" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-muted/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
