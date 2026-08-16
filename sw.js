/* Maisto bazė — service worker.
   Dėl jo programėlė veikia be interneto ir įsirašo į telefoną.

   SVARBU: pakeitei index.html? Pakelk CACHE numerį (v3 -> v4),
   kitaip telefonas ir toliau rodys seną versiją. */
const CACHE = 'maisto-baze-v7';
const FAILAI = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(FAILAI))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(raktai => Promise.all(raktai.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(atsakymas => {
      if(atsakymas) return atsakymas;
      return fetch(e.request).then(tinklo => {
        if(tinklo.ok && new URL(e.request.url).origin === location.origin){
          const kopija = tinklo.clone();
          caches.open(CACHE).then(c => c.put(e.request, kopija));
        }
        return tinklo;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
