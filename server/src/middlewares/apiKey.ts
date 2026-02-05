import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/prisma';

export interface ApiKeyRequest extends Request {
  siteId?: string;
}

export async function apiKeyMiddleware(req: ApiKeyRequest, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const site = await prisma.site.findUnique({
      where: { apiKey },
      select: { id: true, isActive: true }
    });

    if (!site) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    if (!site.isActive) {
      return res.status(403).json({ error: 'Site is deactivated' });
    }

    req.siteId = site.id;
    next();
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
