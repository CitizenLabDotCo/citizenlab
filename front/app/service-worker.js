const CACHE_NAME = 'govocal-pwa-cache-v1';
// const urlsToCache = ["/", "/index.html", "/static/js/main.js"];

// Install the service worker
// self.addEventListener("install", (event) => {
// event.waitUntil(
//   caches.open(CACHE_NAME).then((cache) => {
//     return cache.addAll(urlsToCache);
//   })
// );
// });

// Fetch resources from the cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Activate the service worker and clear old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          } else {
            return Promise.resolve(); // Ensure that every branch returns a value
          }
        })
      );
    })
  );
});

export {};
