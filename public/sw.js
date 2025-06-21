const CACHE_NAME = 'financial-vault-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.svg',
  '/icon-512x512.svg'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', (event) => {
  // Skip Vite dev server requests in production
  if (event.request.url.includes('localhost:3000') || 
      event.request.url.includes('@vite/client') ||
      event.request.url.includes('@react-refresh')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).catch((error) => {
          console.log('Fetch failed:', error);
          // Return a fallback response for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Network error', { status: 503 });
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for SMS data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sms-sync') {
    event.waitUntil(syncSMSData());
  }
});

async function syncSMSData() {
  // This will be implemented when we add SMS functionality
  console.log('Background sync triggered');
} 