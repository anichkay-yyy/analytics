import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Globe, Trash2, RefreshCw, Code, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { api, Site } from '@/lib/api';

interface SnippetData {
  simple: string;
  full: string;
  apiKey: string;
  domain?: string;
  siteName?: string;
}

export function Sites() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [snippetOpen, setSnippetOpen] = useState(false);
  const [snippetData, setSnippetData] = useState<SnippetData | null>(null);
  const [newSite, setNewSite] = useState({ name: '', domain: '' });
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const loadSites = async () => {
    try {
      const data = await api.getSites();
      setSites(data);
    } catch (err) {
      console.error('Failed to load sites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const site = await api.createSite(newSite);
      const snippet = await api.getSnippet(site.id);
      setSnippetData({ ...snippet, siteName: site.name, domain: site.domain });
      setNewSite({ name: '', domain: '' });
      setCreateOpen(false);
      setSnippetOpen(true);
      loadSites();
    } catch (err) {
      console.error('Failed to create site:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this site?')) return;
    try {
      await api.deleteSite(id);
      loadSites();
    } catch (err) {
      console.error('Failed to delete site:', err);
    }
  };

  const handleRegenerateKey = async (id: string) => {
    if (!confirm('Regenerate API key? The old key will stop working.')) return;
    try {
      await api.regenerateKey(id);
      loadSites();
    } catch (err) {
      console.error('Failed to regenerate key:', err);
    }
  };

  const showSnippet = async (site: Site) => {
    try {
      const data = await api.getSnippet(site.id);
      setSnippetData({ ...data, siteName: site.name, domain: site.domain });
      setSnippetOpen(true);
    } catch (err) {
      console.error('Failed to get snippet:', err);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sites</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Site
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Site</DialogTitle>
              <DialogDescription>
                Create a new site to start tracking analytics.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Site Name</Label>
                  <Input
                    id="name"
                    value={newSite.name}
                    onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                    placeholder="My Website"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    value={newSite.domain}
                    onChange={(e) => setNewSite({ ...newSite, domain: e.target.value })}
                    placeholder="example.com"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Site'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No sites yet</h3>
            <p className="text-muted-foreground mb-4">Add your first site to start tracking analytics.</p>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Site
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sites.map((site) => (
            <Card key={site.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                  <Link to={`/sites/${site.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 shrink-0 rounded-full ${site.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                      <div className="min-w-0">
                        <h3 className="font-medium truncate">{site.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{site.domain}</p>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 font-mono hover:text-muted-foreground transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            copyToClipboard(site.id, `site-id-${site.id}`);
                          }}
                          title="Click to copy Site ID"
                        >
                          ID: {site.id}
                          {copied === `site-id-${site.id}` ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center justify-between sm:gap-4 pl-6 sm:pl-0">
                    <div className="text-sm sm:text-right">
                      <div>{site._count?.events || 0} events</div>
                      <div className="text-muted-foreground">{site._count?.sessions || 0} sessions</div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => showSnippet(site)} title="Get code">
                        <Code className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleRegenerateKey(site.id)} title="Regenerate API key">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(site.id)} title="Delete">
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Snippet Dialog */}
      <Dialog open={snippetOpen} onOpenChange={setSnippetOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Installation Code
              {snippetData?.siteName && (
                <span className="text-muted-foreground font-normal">— {snippetData.siteName}</span>
              )}
            </DialogTitle>
            <DialogDescription>
              Add this script to your website's HTML to start tracking analytics.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="simple" className="mt-4">
            <TabsList className="w-full">
              <TabsTrigger value="simple" className="flex-1">One Line</TabsTrigger>
              <TabsTrigger value="full" className="flex-1">With Options</TabsTrigger>
            </TabsList>

            <TabsContent value="simple" className="mt-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Just add this single line before <code className="text-primary">&lt;/body&gt;</code>:
                </p>
                <div className="relative">
                  <pre className="p-4 rounded-lg bg-black border border-border overflow-x-auto text-sm pr-12 whitespace-pre-wrap break-all">
                    <code className="text-green-400">{snippetData?.simple}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(snippetData?.simple || '', 'simple')}
                  >
                    {copied === 'simple' ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="full" className="mt-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Use this if you need manual control over initialization:
                </p>
                <div className="relative">
                  <pre className="p-4 rounded-lg bg-black border border-border overflow-x-auto text-sm pr-12">
                    <code className="text-green-400">{snippetData?.full}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(snippetData?.full || '', 'full')}
                  >
                    {copied === 'full' ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
            <h4 className="text-sm font-medium mb-2">What gets tracked automatically:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Page views (including SPA navigation)</li>
              <li>• Referrer information</li>
              <li>• Session duration</li>
              <li>• Clicks on elements with <code className="text-primary">data-analytics</code> attribute</li>
            </ul>
          </div>

          <div className="mt-2 p-4 rounded-lg bg-muted/50 border border-border">
            <h4 className="text-sm font-medium mb-2">Custom events:</h4>
            <pre className="text-sm text-muted-foreground">
              <code>{`Analytics.track('button_click', { buttonId: 'signup' });`}</code>
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
