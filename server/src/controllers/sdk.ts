import { Request, Response } from 'express';
import { prisma } from '../services/prisma';

const SDK_SCRIPT = `
(function(window) {
  'use strict';

  var Analytics = (function() {
    var config = { apiKey: '', endpoint: '', debug: false };
    var visitorId = getOrCreateVisitorId();
    var sessionId = null;
    var queue = [];
    var flushTimer = null;
    var initialized = false;

    function getOrCreateVisitorId() {
      var key = '_a_vid';
      var id = localStorage.getItem(key);
      if (!id) {
        id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0;
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        localStorage.setItem(key, id);
      }
      return id;
    }

    function log() {
      if (config.debug) console.log.apply(console, ['[Analytics]'].concat(Array.prototype.slice.call(arguments)));
    }

    function send(event) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', config.endpoint + '/api/events/track', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('X-API-Key', config.apiKey);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 201) {
          var res = JSON.parse(xhr.responseText);
          if (res.sessionId && !sessionId) sessionId = res.sessionId;
        }
      };
      xhr.send(JSON.stringify(Object.assign({}, event, { visitorId: visitorId, sessionId: sessionId })));
    }

    function queueEvent(event) {
      queue.push(event);
      if (flushTimer) clearTimeout(flushTimer);
      if (queue.length >= 10) {
        flush();
      } else {
        flushTimer = setTimeout(flush, 2000);
      }
    }

    function flush() {
      if (queue.length === 0) return;
      var events = queue.slice();
      queue = [];
      events.forEach(send);
    }

    function setupAutoTracking() {
      var pushState = history.pushState;
      var replaceState = history.replaceState;

      history.pushState = function() {
        pushState.apply(history, arguments);
        trackPageview();
      };

      history.replaceState = function() {
        replaceState.apply(history, arguments);
        trackPageview();
      };

      window.addEventListener('popstate', trackPageview);

      document.addEventListener('click', function(e) {
        var el = e.target.closest ? e.target.closest('[data-analytics]') : null;
        if (el) {
          var name = el.getAttribute('data-analytics');
          var data = {};
          Array.prototype.forEach.call(el.attributes, function(attr) {
            if (attr.name.indexOf('data-analytics-') === 0) {
              data[attr.name.replace('data-analytics-', '')] = attr.value;
            }
          });
          track(name || 'click', data);
        }
      });
    }

    function trackPageview(url) {
      if (!initialized) return;
      queueEvent({
        type: 'pageview',
        url: url || window.location.href,
        referrer: document.referrer
      });
      log('Pageview:', url || window.location.href);
    }

    function track(name, data) {
      if (!initialized) return;
      queueEvent({
        type: 'custom',
        name: name,
        url: window.location.href,
        data: data
      });
      log('Event:', name, data);
    }

    function init(opts) {
      if (initialized) return;
      config.apiKey = opts.apiKey;
      config.endpoint = opts.endpoint || window.location.origin;
      config.debug = opts.debug || false;
      initialized = true;
      log('Initialized');
      if (opts.autoTrack !== false) setupAutoTracking();
      trackPageview();
    }

    return {
      init: init,
      track: track,
      trackPageview: trackPageview,
      identify: function(userId, traits) {
        track('identify', Object.assign({ userId: userId }, traits));
      },
      reset: function() {
        sessionId = null;
        localStorage.removeItem('_a_vid');
        visitorId = getOrCreateVisitorId();
      }
    };
  })();

  window.Analytics = Analytics;
})(window);
`;

export async function getSDKScript(_req: Request, res: Response) {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(SDK_SCRIPT.trim());
}

export async function getSDKScriptWithKey(req: Request, res: Response) {
  const { apiKey } = req.params;

  const site = await prisma.site.findUnique({
    where: { apiKey },
    select: { isActive: true }
  });

  if (!site || !site.isActive) {
    return res.status(404).send('// Invalid API key');
  }

  const endpoint = `${req.protocol}://${req.get('host')}`;

  const script = SDK_SCRIPT.trim() + `
Analytics.init({ apiKey: '${apiKey}', endpoint: '${endpoint}' });
`;

  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(script);
}

export async function getSnippet(req: Request, res: Response) {
  const { id } = req.params;

  const site = await prisma.site.findUnique({
    where: { id },
    select: { apiKey: true, domain: true }
  });

  if (!site) {
    return res.status(404).json({ error: 'Site not found' });
  }

  const endpoint = `${req.protocol}://${req.get('host')}`;

  const simpleSnippet = `<script src="${endpoint}/sdk/${site.apiKey}.js"></script>`;

  const fullSnippet = `<script src="${endpoint}/sdk.js"></script>
<script>
  Analytics.init({
    apiKey: '${site.apiKey}',
    endpoint: '${endpoint}'
  });
</script>`;

  res.json({
    domain: site.domain,
    simple: simpleSnippet,
    full: fullSnippet,
    apiKey: site.apiKey
  });
}

export function getWidgets(_req: Request, res: Response) {
  const widgets = [
    {
      id: 'stats',
      name: 'Stats Overview',
      description: 'Pageviews, sessions, and unique visitors cards',
      path: '/widget/stats',
      minHeight: 120
    },
    {
      id: 'chart',
      name: 'Timeline Chart',
      description: 'Area chart showing pageviews over time',
      path: '/widget/chart',
      minHeight: 250
    },
    {
      id: 'pages',
      name: 'Top Pages',
      description: 'List of most viewed pages',
      path: '/widget/pages',
      minHeight: 300
    },
    {
      id: 'realtime',
      name: 'Realtime Stats',
      description: 'Live stats for today with auto-refresh',
      path: '/widget/realtime',
      minHeight: 140
    },
    {
      id: 'docs',
      name: 'Documentation',
      description: 'How to use analytics widgets',
      path: '/widget/docs',
      minHeight: 400
    }
  ];

  res.json(widgets);
}
