'use strict';

const CACHE_VERSION = 1;
const CACHE_NAME = `v${CACHE_VERSION}`;
const CACHE_FILES = [
  'character',
  'dot',
  'bamboo',
  'honor'
];

self.addEventListener('install', e => {
  console.log('install', e);
});

self.addEventListener('activate', e => {
  console.log('activate', e);

  const deletion = caches.keys()
    .then(keys => keys.filter(key => key !== CACHE_NAME))
    .then(keys => Promise.all(keys.map(key => caches.delete(key))));

  e.waitUntil(deletion);
});

self.addEventListener('fetch', e => {
  const pathname = new URL(e.request.url).pathname.replace('/service-worker-passive-cache', '');

  if (!CACHE_FILES.some(file => e.request.url.includes(file))) {
    console.log(`❌ ${pathname} is not a target`);
    return;
  }

  const cache = caches.match(e.request).then(response => {
    if (response) {
      console.log(`☀️ cache for ${pathname} found`);
      return response;
    } else {
      console.log(`☁️ cache for ${pathname} not found`);
    }

    return fetch(e.request.clone()).then(response => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(e.request, clone))
          .then(() => console.log(`🌤 ${pathname} is cached`));
      }

      return response;
    });
  });

  e.respondWith(cache);
});
