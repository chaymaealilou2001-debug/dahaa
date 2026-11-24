// Service worker : garde l'appli en cache pour qu'elle s'ouvre vite, même avec une connexion faible.
const CACHE = 'dahaa-v5';
const SHELL = [
  './', 'index.html', 'css/style.css', 'manifest.webmanifest',
  'js/core.js', 'js/i18n.js', 'js/words.js', 'js/intros.js', 'js/app.js',
  'js/games/mot.js', 'js/games/petit.js', 'js/games/tiens.js',
  'js/games/menteur.js', 'js/games/nitrop.js', 'js/games/degrade.js',
  'js/games/pyramide.js', 'js/games/balance.js', 'js/games/dejavu.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png',
  'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.allSettled(SHELL.map((u) => c.add(u)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// Réseau d'abord (pour avoir les mises à jour), cache si hors-ligne.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const ours = url.origin === location.origin || url.href.startsWith('https://unpkg.com/peerjs@');
  if (!ours) return;
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('index.html')))
  );
});
