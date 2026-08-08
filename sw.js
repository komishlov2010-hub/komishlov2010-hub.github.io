// خدمت‌گزار (Service Worker) برای کتابخانه‌ی من
// این فایل فقط زمانی فعال می‌شود که برنامه از طریق یک آدرس اینترنتی (https) باز شود،
// نه وقتی مستقیماً به‌صورت فایل محلی (file://) باز شده باشد.
const CACHE_NAME = 'ketabkhan-cache-v1';
const APP_SHELL = ['./ketabkhan.html', './'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(()=>{})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
