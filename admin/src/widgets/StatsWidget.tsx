import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, Users, UserCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { api, SiteStats } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { WidgetAuth } from './WidgetAuth';
import { cn } from '@/lib/utils';

export function StatsWidget() {
  const [searchParams] = useSearchParams();
  const siteId = searchParams.get('siteId');
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    if (!siteId || !user) return;
    try {
      const data = await api.getSiteStats(siteId);
      setStats(data);
    } catch (err) {
      setError('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && siteId) {
      loadStats();
    }
  }, [user, siteId]);

  if (authLoading) {
    return <WidgetLoading />;
  }

  if (!user) {
    return <WidgetAuth onSuccess={loadStats} />;
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Eye}
          label="Pageviews"
          value={stats?.totalPageviews || 0}
        />
        <StatCard
          icon={Users}
          label="Sessions"
          value={stats?.totalSessions || 0}
        />
        <StatCard
          icon={UserCheck}
          label="Unique Visitors"
          value={stats?.uniqueVisitors || 0}
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend }: {
  icon: React.ElementType;
  label: string;
  value: number;
  trend?: number;
}) {
  return (
    <div className="p-4 rounded-xl bg-[#0C0F16] border border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold">{value.toLocaleString()}</span>
        {trend !== undefined && (
          <span className={cn(
            "flex items-center text-sm",
            trend >= 0 ? "text-green-400" : "text-red-400"
          )}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

function WidgetLoading() {
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-[#0C0F16] rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
