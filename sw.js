// Offline: the app shell and exercise images come from cache; Supabase calls always go to the network.
const V = 'b2s-1';
const SHELL = ['./', 'index.html', 'app.css', 'app.js', 'plan.js', 'manifest.webmanifest', 'icon-180.png', 'icon-512.png'];

self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.hostname.endsWith('supabase.co')) return;
  // Network first for the shell so updates land; cache first for images, fonts and the pinned CDN script.
  const shell = u.origin === location.origin && !u.pathname.includes('/img/');
  e.respondWith(shell
    ? fetch(e.request).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request))
    : caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
        if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); }
        return r;
      })));
});
