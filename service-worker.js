const CACHE_NAME = 'app-cache-v2'; // Versioniere den Cache
const STATIC_ASSETS = [
    '/', // Startseite
    '/index.html',
    '/style.css',
    '/script.js',
    '/assets/custom-marker.jpg',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png'
];

// Installationsereignis
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Aktivierungsereignis
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Removing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch-Ereignis (Netzwerkabfragen abfangen)
self.addEventListener('fetch', (event) => {
    // Prüfen, ob die Anfrage dynamisch ist
    const url = new URL(event.request.url);

    // Dynamische Inhalte (z. B. Orte-Liste) niemals cachen
    if (url.pathname.includes('/places') || url.pathname.includes('/dynamic')) {
        console.log('[Service Worker] Bypassing cache for dynamic content:', event.request.url);
        return; // Ignoriere diese Anfragen und lass sie direkt ans Netzwerk gehen
    }

    // Statische Inhalte aus dem Cache liefern
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Falls im Cache vorhanden, liefere die Antwort aus dem Cache
            if (cachedResponse) {
                return cachedResponse;
            }

            // Sonst: Anfrage ans Netzwerk weiterleiten
            return fetch(event.request).then((networkResponse) => {
                // Erfolgreiche Antworten können optional gecacht werden
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        })
    );
});
