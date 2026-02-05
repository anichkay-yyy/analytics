import { Response } from 'express';
import geoip from 'geoip-lite';
import { Prisma } from '@prisma/client';
import { prisma } from '../services/prisma';
import { ApiKeyRequest } from '../middlewares/apiKey';
import { TrackEventPayload } from '../types';

function getGeoFromIp(ip: string | undefined): { country: string | null; city: string | null } {
  if (!ip) return { country: null, city: null };

  const cleanIp = ip.trim();

  // Skip private/local IPs
  if (cleanIp === '127.0.0.1' || cleanIp === '::1' ||
      cleanIp.startsWith('192.168.') || cleanIp.startsWith('10.') ||
      cleanIp.startsWith('172.16.') || cleanIp.startsWith('172.17.') ||
      cleanIp.startsWith('172.18.') || cleanIp.startsWith('172.19.') ||
      cleanIp.startsWith('172.2') || cleanIp.startsWith('172.30.') ||
      cleanIp.startsWith('172.31.')) {
    return { country: null, city: null };
  }

  const geo = geoip.lookup(cleanIp);
  if (!geo) return { country: null, city: null };

  return {
    country: geo.country || null,
    city: geo.city || null
  };
}

export async function trackEvent(req: ApiKeyRequest, res: Response) {
  try {
    const siteId = req.siteId!;
    const { type, name, url, referrer, data, visitorId, sessionId } = req.body as TrackEventPayload;

    if (!type || !visitorId) {
      return res.status(400).json({ error: 'Type and visitorId required' });
    }

    const forwardedFor = req.headers['x-forwarded-for'] as string;
    const realIp = req.headers['x-real-ip'] as string;
    // X-Forwarded-For может содержать цепочку IP, берём первый (оригинальный клиент)
    const ip = (forwardedFor?.split(',')[0]?.trim()) || realIp || req.socket.remoteAddress;

    console.log('[Track] IP detection:', { forwardedFor, realIp, socket: req.socket.remoteAddress, resolved: ip });
    const userAgent = req.headers['user-agent'];

    let currentSessionId = sessionId;

    if (!currentSessionId) {
      const recentSession = await prisma.session.findFirst({
        where: {
          siteId,
          visitorId,
          startedAt: {
            gte: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes
          }
        },
        orderBy: { startedAt: 'desc' }
      });

      if (recentSession) {
        currentSessionId = recentSession.id;
      } else {
        const { country, city } = getGeoFromIp(ip);
        const newSession = await prisma.session.create({
          data: {
            siteId,
            visitorId,
            userAgent,
            ip,
            country,
            city
          }
        });
        currentSessionId = newSession.id;
      }
    }

    const event = await prisma.event.create({
      data: {
        siteId,
        sessionId: currentSessionId,
        type,
        name,
        url,
        referrer,
        data: (data as Prisma.InputJsonValue) || undefined
      }
    });

    res.status(201).json({
      id: event.id,
      sessionId: currentSessionId
    });
  } catch (error) {
    console.error('Track event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function trackBatch(req: ApiKeyRequest, res: Response) {
  try {
    const siteId = req.siteId!;
    const { events } = req.body as { events: TrackEventPayload[] };

    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'Events array required' });
    }

    const results = await Promise.all(
      events.map(async (event) => {
        return prisma.event.create({
          data: {
            siteId,
            type: event.type,
            name: event.name,
            url: event.url,
            referrer: event.referrer,
            data: (event.data as Prisma.InputJsonValue) || undefined
          }
        });
      })
    );

    res.status(201).json({ count: results.length });
  } catch (error) {
    console.error('Track batch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
