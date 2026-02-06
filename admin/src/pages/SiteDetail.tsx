import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Eye, Users, UserCheck, ExternalLink, Globe, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api, Site, SiteStats } from '@/lib/api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export function SiteDetail() {
  const { id } = useParams<{ id: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [timeline, setTimeline] = useState<{ date: string; count: number }[]>([]);
  const [topPages, setTopPages] = useState<{ url: string; views: number }[]>([]);
  const [topReferrers, setTopReferrers] = useState<{ referrer: string; visits: number }[]>([]);
  const [customEvents, setCustomEvents] = useState<{ name: string; count: number }[]>([]);
  const [topCountries, setTopCountries] = useState<{ country: string; sessions: number }[]>([]);
  const [topCities, setTopCities] = useState<{ city: string; country: string; sessions: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        const [siteData, statsData, timelineData, pagesData, referrersData, eventsData, countriesData, citiesData] = await Promise.all([
          api.getSite(id),
          api.getSiteStats(id),
          api.getTimeline(id),
          api.getTopPages(id),
          api.getTopReferrers(id),
          api.getCustomEvents(id),
          api.getTopCountries(id),
          api.getTopCities(id),
        ]);
        setSite(siteData);
        setStats(statsData);
        setTimeline(timelineData);
        setTopPages(pagesData);
        setTopReferrers(referrersData);
        setCustomEvents(eventsData);
        setTopCountries(countriesData);
        setTopCities(citiesData);
      } catch (err) {
        console.error('Failed to load site:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="p-4 md:p-8">
        <p>Site not found</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/sites">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{site.name}</h1>
          <p className="text-muted-foreground">{site.domain}</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pageviews</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalPageviews.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sessions</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalSessions.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unique Visitors</CardTitle>
            <UserCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.uniqueVisitors.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pageviews Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline}>
                  <defs>
                    <linearGradient id="colorViews2" x1="0" y1="0" x2="0" y2="1">
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
                    fill="url(#colorViews2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No data yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="pages">
        <TabsList className="w-full overflow-x-auto flex">
          <TabsTrigger value="pages" className="flex-1 min-w-0">Pages</TabsTrigger>
          <TabsTrigger value="referrers" className="flex-1 min-w-0">Referrers</TabsTrigger>
          <TabsTrigger value="countries" className="flex-1 min-w-0">Countries</TabsTrigger>
          <TabsTrigger value="cities" className="flex-1 min-w-0">Cities</TabsTrigger>
          <TabsTrigger value="events" className="flex-1 min-w-0">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <Card>
            <CardContent className="pt-6">
              {topPages.length > 0 ? (
                <div className="space-y-3">
                  {topPages.map((page, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 truncate">
                        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{page.url}</span>
                      </div>
                      <span className="font-medium ml-4">{page.views}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No page data yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrers">
          <Card>
            <CardContent className="pt-6">
              {topReferrers.length > 0 ? (
                <div className="space-y-3">
                  {topReferrers.map((ref, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="truncate">{ref.referrer || 'Direct'}</span>
                      <span className="font-medium ml-4">{ref.visits}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No referrer data yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="countries">
          <Card>
            <CardContent className="pt-6">
              {topCountries.length > 0 ? (
                <div className="space-y-3">
                  {topCountries.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>{item.country}</span>
                      </div>
                      <span className="font-medium">{item.sessions} sessions</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No geo data yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cities">
          <Card>
            <CardContent className="pt-6">
              {topCities.length > 0 ? (
                <div className="space-y-3">
                  {topCities.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{item.city}</span>
                        <span className="text-muted-foreground text-sm">({item.country})</span>
                      </div>
                      <span className="font-medium">{item.sessions} sessions</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No geo data yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardContent className="pt-6">
              {customEvents.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={customEvents} layout="vertical">
                      <XAxis type="number" stroke="#666" fontSize={12} />
                      <YAxis type="category" dataKey="name" stroke="#666" fontSize={12} width={150} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0C0F16', border: '1px solid #333' }}
                      />
                      <Bar dataKey="count" fill="rgb(63, 81, 181)" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No custom events yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
