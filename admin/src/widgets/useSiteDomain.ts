import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export function useSiteDomain(siteId: string | null, user: unknown) {
  const [domain, setDomain] = useState<string | null>(null);

  useEffect(() => {
    if (!siteId || !user) return;
    api.getSite(siteId).then((site) => setDomain(site.domain)).catch(() => {});
  }, [siteId, user]);

  return domain;
}
