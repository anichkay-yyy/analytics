import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../services/prisma';
import { AuthRequest, CreateSitePayload, UpdateSitePayload } from '../types';

export async function listSites(req: AuthRequest, res: Response) {
  try {
    const sites = await prisma.site.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        domain: true,
        apiKey: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { events: true, sessions: true }
        }
      }
    });

    res.json(sites);
  } catch (error) {
    console.error('List sites error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getSite(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const site = await prisma.site.findUnique({
      where: { id },
      include: {
        _count: {
          select: { events: true, sessions: true }
        }
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    res.json(site);
  } catch (error) {
    console.error('Get site error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createSite(req: AuthRequest, res: Response) {
  try {
    const { name, domain } = req.body as CreateSitePayload;

    if (!name || !domain) {
      return res.status(400).json({ error: 'Name and domain required' });
    }

    const existingSite = await prisma.site.findUnique({ where: { domain } });

    if (existingSite) {
      return res.status(409).json({ error: 'Domain already exists' });
    }

    const apiKey = `ak_${uuidv4().replace(/-/g, '')}`;

    const site = await prisma.site.create({
      data: { name, domain, apiKey }
    });

    res.status(201).json(site);
  } catch (error) {
    console.error('Create site error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateSite(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, domain, isActive } = req.body as UpdateSitePayload;

    const existing = await prisma.site.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ error: 'Site not found' });
    }

    if (domain && domain !== existing.domain) {
      const domainExists = await prisma.site.findUnique({ where: { domain } });
      if (domainExists) {
        return res.status(409).json({ error: 'Domain already exists' });
      }
    }

    const site = await prisma.site.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(domain !== undefined && { domain }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json(site);
  } catch (error) {
    console.error('Update site error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteSite(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const existing = await prisma.site.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ error: 'Site not found' });
    }

    await prisma.site.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error('Delete site error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function regenerateApiKey(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const existing = await prisma.site.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ error: 'Site not found' });
    }

    const newApiKey = `ak_${uuidv4().replace(/-/g, '')}`;

    const site = await prisma.site.update({
      where: { id },
      data: { apiKey: newApiKey }
    });

    res.json({ apiKey: site.apiKey });
  } catch (error) {
    console.error('Regenerate API key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
