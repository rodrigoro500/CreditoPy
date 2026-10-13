// Cache only the offline notice. Credit and payment requests always use the network.
const CACHE = "creditopy-offline-v1";
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add("/offline.html")));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then(async (keys) => {
    await Promise.all(keys.filter((key) => key.startsWith("creditopy-offline-") && key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  }));
});
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate" && new URL(event.request.url).origin === self.location.origin) {
    event.respondWith(fetch(event.request).catch(() => caches.match("/offline.html")));
  }
});
