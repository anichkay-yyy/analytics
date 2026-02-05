import { Response } from 'express';
import { prisma } from '../services/prisma';
import { AuthRequest, StatsQuery } from '../types';

function getDateRange(query: StatsQuery) {
  const endDate = query.endDate ? new Date(query.endDate) : new Date();
  endDate.setHours(23, 59, 59, 999);

  let startDate: Date;
  if (query.startDate) {
    startDate = new Date(query.startDate);
  } else {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
  }
  startDate.setHours(0, 0, 0, 0);

  return { startDate, endDate };
}

export async function getSiteStats(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { startDate, endDate } = getDateRange(req.query as StatsQuery);

    const site = await prisma.site.findUnique({ where: { id } });
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    const [totalPageviews, totalSessions, uniqueVisitors] = await Promise.all([
      prisma.event.count({
        where: {
          siteId: id,
          type: 'pageview',
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.session.count({
        where: {
          siteId: id,
          startedAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.session.groupBy({
        by: ['visitorId'],
        where: {
          siteId: id,
          startedAt: { gte: startDate, lte: endDate }
        }
      }).then(result => result.length)
    ]);

    res.json({
      siteId: id,
      period: { start: startDate, end: endDate },
      totalPageviews,
      totalSessions,
      uniqueVisitors
    });
  } catch (error) {
    console.error('Get site stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getTopPages(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { startDate, endDate } = getDateRange(req.query as StatsQuery);
    const limit = parseInt(req.query.limit as string) || 10;

    const pages = await prisma.event.groupBy({
      by: ['url'],
      where: {
        siteId: id,
        type: 'pageview',
        url: { not: null },
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit
    });

    res.json(
      pages.map(p => ({
        url: p.url,
        views: p._count.id
      }))
    );
  } catch (error) {
    console.error('Get top pages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getTopReferrers(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { startDate, endDate } = getDateRange(req.query as StatsQuery);
    const limit = parseInt(req.query.limit as string) || 10;

    const referrers = await prisma.event.groupBy({
      by: ['referrer'],
      where: {
        siteId: id,
        type: 'pageview',
        referrer: { not: null },
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit
    });

    res.json(
      referrers.map(r => ({
        referrer: r.referrer,
        visits: r._count.id
      }))
    );
  } catch (error) {
    console.error('Get top referrers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getEventsByDay(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { startDate, endDate } = getDateRange(req.query as StatsQuery);

    const events = await prisma.event.findMany({
      where: {
        siteId: id,
        type: 'pageview',
        createdAt: { gte: startDate, lte: endDate }
      },
      select: { createdAt: true }
    });

    const byDay: Record<string, number> = {};
    events.forEach(e => {
      const day = e.createdAt.toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });

    const result = Object.entries(byDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json(result);
  } catch (error) {
    console.error('Get events by day error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getCustomEvents(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { startDate, endDate } = getDateRange(req.query as StatsQuery);
    const limit = parseInt(req.query.limit as string) || 20;

    const events = await prisma.event.groupBy({
      by: ['name'],
      where: {
        siteId: id,
        type: 'custom',
        name: { not: null },
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit
    });

    res.json(
      events.map(e => ({
        name: e.name,
        count: e._count.id
      }))
    );
  } catch (error) {
    console.error('Get custom events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getTopCountries(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { startDate, endDate } = getDateRange(req.query as StatsQuery);
    const limit = parseInt(req.query.limit as string) || 10;

    const countries = await prisma.session.groupBy({
      by: ['country'],
      where: {
        siteId: id,
        country: { not: null },
        startedAt: { gte: startDate, lte: endDate }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit
    });

    res.json(
      countries.map(c => ({
        country: c.country,
        sessions: c._count.id
      }))
    );
  } catch (error) {
    console.error('Get top countries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getTopCities(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { startDate, endDate } = getDateRange(req.query as StatsQuery);
    const limit = parseInt(req.query.limit as string) || 10;

    const cities = await prisma.session.groupBy({
      by: ['city', 'country'],
      where: {
        siteId: id,
        city: { not: null },
        startedAt: { gte: startDate, lte: endDate }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit
    });

    res.json(
      cities.map(c => ({
        city: c.city,
        country: c.country,
        sessions: c._count.id
      }))
    );
  } catch (error) {
    console.error('Get top cities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getDashboard(req: AuthRequest, res: Response) {
  try {
    const { startDate, endDate } = getDateRange(req.query as StatsQuery);

    const sites = await prisma.site.findMany({
      select: { id: true, name: true, domain: true, isActive: true }
    });

    const siteStats = await Promise.all(
      sites.map(async (site) => {
        const [pageviews, sessions] = await Promise.all([
          prisma.event.count({
            where: {
              siteId: site.id,
              type: 'pageview',
              createdAt: { gte: startDate, lte: endDate }
            }
          }),
          prisma.session.count({
            where: {
              siteId: site.id,
              startedAt: { gte: startDate, lte: endDate }
            }
          })
        ]);

        return {
          ...site,
          pageviews,
          sessions
        };
      })
    );

    const totals = siteStats.reduce(
      (acc, s) => ({
        pageviews: acc.pageviews + s.pageviews,
        sessions: acc.sessions + s.sessions
      }),
      { pageviews: 0, sessions: 0 }
    );

    res.json({
      period: { start: startDate, end: endDate },
      totals,
      sites: siteStats
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
