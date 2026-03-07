const CACHE_NAME = 'wodtv-cache-v1';
const urlsToCache = [
    '/tv.html'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function (event) {
    // Ignorar llamados a supabase o WSS realtime, solo cachear GET assets.
    if (event.request.method !== 'GET' || event.request.url.includes('supabase.co')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(
                    function (response) {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        var responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(function (cache) {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    }).catch(function () {
                        // Caida red, retornar html preexistente siempre que requiera doc
                        if (event.request.mode === 'navigate') {
                            return caches.match('/tv.html');
                        }
                    });
            })
    );
});
