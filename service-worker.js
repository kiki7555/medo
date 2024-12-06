const CACHE_NAME = 'app-cache-v1';
const CACHE_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/assets/custom-marker.jpg',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png'
];

// Installationsereignis: Cache erstellen
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CACHE_ASSETS);
        })
    );
});

// Aktivierungsereignis: Alten Cache löschen
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_NAME)
                    .map((cacheName) => caches.delete(cacheName))
            );
        })
    );
});

// Fetch-Ereignis: Dateien aus dem Cache oder Netzwerk holen
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
