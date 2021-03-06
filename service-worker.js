'use strict';

const CACHE_VERSION = 2;
const CACHE_NAME = `v${CACHE_VERSION}`;
const CACHE_FILES = ['cat'];

self.addEventListener('install', e => {
  console.log('install', e);

  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', e => {
  console.log('activate', e);

  const deletion = caches.keys()
    .then(keys => keys.filter(key => key !== CACHE_NAME))
    .then(keys => Promise.all(keys.map(key => caches.delete(key))));

  e.waitUntil(deletion.then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const pathname = url.pathname.replace('/service-worker-passive-cache', '');

  if (!CACHE_FILES.some(file => e.request.url.includes(file))) {
    console.log(`☔ [${pathname}] is not a target`);
    return;
  }

  const cache = caches.match(e.request).then(response => {
    if (response) {
      console.log(`🌈 [${pathname}] cache found`);
      return response;
    } else {
      console.log(`☁️ [${pathname}] cache not found`);
    }

    return fetch(e.request.clone()).then(response => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(e.request, clone))
          .then(() => console.log(`🌤 [${pathname}] cached`));
      }

      return response;
    });
  });

  e.respondWith(cache);
});
