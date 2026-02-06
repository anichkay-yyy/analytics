import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Users, Eye, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, DashboardStats } from '@/lib/api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeline, setTimeline] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardData = await api.getDashboard();
        setStats(dashboardData);

        if (dashboardData.sites.length > 0) {
          const timelineData = await api.getTimeline(dashboardData.sites[0].id);
          setTimeline(timelineData);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pageviews
            </CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totals.pageviews.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sessions
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totals.sessions.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Sites
            </CardTitle>
            <Globe className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.sites.filter(s => s.isActive).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {timeline.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Pageviews Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(63, 81, 181)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="rgb(63, 81, 181)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0C0F16', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="rgb(63, 81, 181)"
                    fillOpacity={1}
                    fill="url(#colorViews)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sites list */}
      <Card>
        <CardHeader>
          <CardTitle>Sites Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.sites.length === 0 ? (
            <p className="text-muted-foreground">
              No sites yet. <Link to="/sites" className="text-primary hover:underline">Add your first site</Link>
            </p>
          ) : (
            <div className="space-y-3">
              {stats?.sites.map((site) => (
                <Link
                  key={site.id}
                  to={`/sites/${site.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <div className="font-medium">{site.name}</div>
                    <div className="text-sm text-muted-foreground">{site.domain}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{site.pageviews.toLocaleString()} views</div>
                    <div className="text-sm text-muted-foreground">{site.sessions.toLocaleString()} sessions</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
