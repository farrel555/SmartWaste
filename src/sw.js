import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// Ini akan secara otomatis mengisi daftar aset yang akan di-cache saat build
precacheAndRoute(self.__WB_MANIFEST);

// Strategi caching untuk navigasi (HTML)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'html-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  })
);

// Strategi caching untuk aset statis (CSS, JS) - Cache First
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'worker',
  new CacheFirst({
    cacheName: 'static-assets-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
      }),
    ],
  })
);

// Strategi caching untuk gambar - Cache First
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
      }),
    ],
  })
);

// Contoh strategi caching untuk API (Network First atau Stale While Revalidate)
// Sesuaikan dengan kebutuhan dan frekuensi update data Anda
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'), // Ganti dengan pola URL API Anda
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 5 * 60, // Cache untuk 5 menit
      }),
    ],
  })
);

// Mengaktifkan navigasi offline (jika ingin menampilkan halaman offline kustom)
// self.addEventListener('fetch', (event) => {
//   if (event.request.mode === 'navigate' && !navigator.onLine) {
//     event.respondWith(caches.match('/offline.html')); // Ganti dengan halaman offline Anda
//   }
// });

// Pastikan service worker mengontrol halaman secepatnya
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});