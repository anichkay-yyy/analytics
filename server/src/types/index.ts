import { Request } from 'express';

export interface AuthRequest extends Request {
  adminId?: string;
}

export interface TrackEventPayload {
  type: 'pageview' | 'click' | 'custom';
  name?: string;
  url?: string;
  referrer?: string;
  data?: Record<string, unknown>;
  visitorId: string;
  sessionId?: string;
}

export interface CreateSitePayload {
  name: string;
  domain: string;
}

export interface UpdateSitePayload {
  name?: string;
  domain?: string;
  isActive?: boolean;
}

export interface StatsQuery {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month';
}
