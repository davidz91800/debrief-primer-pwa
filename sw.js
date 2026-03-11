const CACHE_NAME = 'debrief-primer-shell-v3';
const CORE_ASSETS = ['./debrief-primer.html'];
const OPTIONAL_ASSETS = [
  './',
  './manifest.webmanifest',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
];

async function putInCache(cache, url) {
  const request = new Request(url, { cache: 'reload' });
  const response = await fetch(request);
  if (response && response.ok) {
    await cache.put(url, response.clone());
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(CORE_ASSETS.map((url) => putInCache(cache, url)));
      await Promise.allSettled(OPTIONAL_ASSETS.map((url) => putInCache(cache, url)));
    })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedShell = await cache.match('./debrief-primer.html');

        const networkPromise = fetch(request)
          .then(async (response) => {
            if (response && response.ok) {
              await cache.put('./debrief-primer.html', response.clone());
            }
            return response;
          })
          .catch(() => null);

        if (cachedShell) {
          event.waitUntil(networkPromise);
          return cachedShell;
        }

        const networkResponse = await networkPromise;
        if (networkResponse) {
          return networkResponse;
        }

        return new Response('Offline', { status: 503, statusText: 'Offline' });
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(request, { ignoreSearch: true });
      if (cached) {
        return cached;
      }

      try {
        const response = await fetch(request);
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const copy = response.clone();
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, copy);
        return response;
      } catch {
        if (request.destination === 'document') {
          const cache = await caches.open(CACHE_NAME);
          const fallback = await cache.match('./debrief-primer.html');
          if (fallback) return fallback;
        }
        return new Response('', { status: 503, statusText: 'Offline' });
      }
    })()
  );
});
