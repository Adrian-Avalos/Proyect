// © 2025 Ramón Adrian Avalos Verá (GitHub: Adrian-Avalos)
// Prohibida la copia o uso comercial sin autorización.

const CACHE_NAME = "nutricion-cache-v2";
const urlsToCache = [
  "index.html",
  "menu.html",
  "Calculadora-Ncompl.html",
  "imc.html",
  "vtc.html",
  "manifest.json",
  "imagenes/icono-192.png",
  "imagenes/icono-512.png",
  "imagenes/icono-180.png",
  "js/Calculadora-Ncompl.js",
  "js/index.js",
  "js/menu.js",
  "datos/datos.js"
];

// Instala y guarda en caché
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Limpia versiones viejas
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// Manejo de requests con fallback a index.html
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => networkResponse)
      .catch(() => {
        return caches.match(event.request).then(cachedResponse => {
          return cachedResponse || caches.match("index.html");
        });
      })
  );
});
