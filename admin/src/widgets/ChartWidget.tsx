import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { WidgetAuth } from './WidgetAuth';
import { useSiteDomain } from './useSiteDomain';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function ChartWidget() {
  const [searchParams] = useSearchParams();
  const siteId = searchParams.get('siteId');
  const { user, loading: authLoading } = useAuth();
  const domain = useSiteDomain(siteId, user);
  const [timeline, setTimeline] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    if (!siteId || !user) return;
    try {
      const data = await api.getTimeline(siteId);
      setTimeline(data);
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

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="h-full min-h-[200px] rounded-xl bg-[#0C0F16] border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Pageviews Over Time</h3>
          {domain && <span className="text-xs text-muted-foreground font-mono">{domain}</span>}
        </div>
        {timeline.length > 0 ? (
          <div className="h-[calc(100%-2rem)]" style={{ minHeight: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="colorViewsWidget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(63, 81, 181)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="rgb(63, 81, 181)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#666"
                  fontSize={10}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0C0F16', border: '1px solid #333', fontSize: 12 }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="rgb(63, 81, 181)"
                  fillOpacity={1}
                  fill="url(#colorViewsWidget)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[180px] flex items-center justify-center text-muted-foreground">
            No data yet
          </div>
        )}
      </div>
    </div>
  );
}

function WidgetLoading() {
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="h-64 bg-[#0C0F16] rounded-xl animate-pulse" />
    </div>
  );
}
