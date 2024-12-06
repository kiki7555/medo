const CACHE_NAME = 'app-cache-v3'; // Cache-Version
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/assets/custom-marker.jpg', // Benutzerdefiniertes Icon
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png'
];

// Installieren des Service Workers und Caching der statischen Dateien
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Aktivierung des Service Workers und Bereinigung von alten Caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Abfangen der Fetch-Anfragen und Antworten aus dem Cache oder dem Netzwerk holen
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        })
    );
});
