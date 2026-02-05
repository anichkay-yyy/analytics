import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Activity, Users } from 'lucide-react';
import { api, SiteStats } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { WidgetAuth } from './WidgetAuth';

export function RealtimeWidget() {
  const [searchParams] = useSearchParams();
  const siteId = searchParams.get('siteId');
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    if (!siteId || !user) return;
    try {
      // Get stats for today only
      const today = new Date().toISOString().split('T')[0];
      const data = await api.getSiteStats(siteId, today, today);
      setStats(data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && siteId) {
      loadData();
      // Refresh every 30 seconds
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
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

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="rounded-xl bg-[#0C0F16] border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-muted-foreground">Live — Today</span>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Activity className="h-4 w-4" />
              <span className="text-xs">Pageviews</span>
            </div>
            <div className="text-3xl font-bold">{stats?.totalPageviews || 0}</div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Visitors</span>
            </div>
            <div className="text-3xl font-bold">{stats?.uniqueVisitors || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WidgetLoading() {
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="rounded-xl bg-[#0C0F16] border border-border p-6 animate-pulse">
        <div className="h-4 w-24 bg-muted rounded mb-4" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-12 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
