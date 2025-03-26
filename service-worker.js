const CACHE_NAME = "nutricion-cache-v1";
const urlsToCache = [
  "index.html",
  "menu.html",
  "manifest.json",
  "imagenes/icono-192.png",
  "imagenes/icono-512.png",
  "imagenes/icono-apple.png",
  "imagenes/fondo-comida.gif",
  "js/login.js",
  "js/menu.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
