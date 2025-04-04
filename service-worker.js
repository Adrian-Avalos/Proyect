const CACHE_NAME = "nutricion-cache-v1";
const urlsToCache = [
  "index.html",
  "menu.html",
  "manifest.json",
  "imagenes/icono-192.png",
  "imagenes/icono-512.png",
  "imagenes/icono-180.png",
  "imagenes/fondo-comida.gif",
  "sonido/sonido.wav",
  "css/estilo.css",
  "js/app.js",
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

// Sirve siempre desde caché
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
