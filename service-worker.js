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
  if (!CACHE_FILES.some(file => e.request.url.includes(file))) {
    console.log(`❌ ${e.request.url} is not a cache target`);
    return;
  } else {
    console.log(`✅ ${e.request.url} is a cache target`);
  }

  const cache = caches.match(e.request).then(response => {
    if (response) {
      console.log(`✅ cache for ${e.request.url} is found`);
      return response;
    } else {
      console.log(`❌ cache for ${e.request.url} is not found`);
    }

    return fetch(e.request.clone()).then(response => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
      }

      console.log(`✅ fallback request for ${e.request.url}`);
      return response;
    });
  });

  e.respondWith(cache);
});
