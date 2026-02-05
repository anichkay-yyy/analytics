const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function removeToken() {
  localStorage.removeItem('token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; admin: { id: string; email: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<{ id: string; email: string }>('/api/auth/me'),

  // Sites
  getSites: () => request<Site[]>('/api/sites'),
  getSite: (id: string) => request<Site>(`/api/sites/${id}`),
  createSite: (data: { name: string; domain: string }) =>
    request<Site>('/api/sites', { method: 'POST', body: JSON.stringify(data) }),
  updateSite: (id: string, data: Partial<Site>) =>
    request<Site>(`/api/sites/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteSite: (id: string) =>
    request<void>(`/api/sites/${id}`, { method: 'DELETE' }),
  regenerateKey: (id: string) =>
    request<{ apiKey: string }>(`/api/sites/${id}/regenerate-key`, { method: 'POST' }),
  getSnippet: (id: string) =>
    request<{ simple: string; full: string; apiKey: string }>(`/api/sites/${id}/snippet`),

  // Stats
  getDashboard: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return request<DashboardStats>(`/api/stats/dashboard?${params}`);
  },

  getSiteStats: (id: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return request<SiteStats>(`/api/stats/sites/${id}?${params}`);
  },

  getTopPages: (id: string, limit = 10) =>
    request<{ url: string; views: number }[]>(`/api/stats/sites/${id}/pages?limit=${limit}`),

  getTopReferrers: (id: string, limit = 10) =>
    request<{ referrer: string; visits: number }[]>(`/api/stats/sites/${id}/referrers?limit=${limit}`),

  getTimeline: (id: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return request<{ date: string; count: number }[]>(`/api/stats/sites/${id}/timeline?${params}`);
  },

  getCustomEvents: (id: string, limit = 20) =>
    request<{ name: string; count: number }[]>(`/api/stats/sites/${id}/events?limit=${limit}`),

  getTopCountries: (id: string, limit = 10) =>
    request<{ country: string; sessions: number }[]>(`/api/stats/sites/${id}/countries?limit=${limit}`),

  getTopCities: (id: string, limit = 10) =>
    request<{ city: string; country: string; sessions: number }[]>(`/api/stats/sites/${id}/cities?limit=${limit}`),
};

export interface Site {
  id: string;
  name: string;
  domain: string;
  apiKey: string;
  isActive: boolean;
  createdAt: string;
  _count?: { events: number; sessions: number };
}

export interface DashboardStats {
  period: { start: string; end: string };
  totals: { pageviews: number; sessions: number };
  sites: Array<Site & { pageviews: number; sessions: number }>;
}

export interface SiteStats {
  siteId: string;
  period: { start: string; end: string };
  totalPageviews: number;
  totalSessions: number;
  uniqueVisitors: number;
}
