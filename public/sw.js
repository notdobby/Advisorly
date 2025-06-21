const CACHE_NAME = 'financial-vault-v6';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.svg',
  '/icon-512x512.svg'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip all localhost requests completely
  if (url.hostname === 'localhost' || 
      url.hostname === '127.0.0.1' ||
      url.pathname.includes('@vite') ||
      url.pathname.includes('@react-refresh') ||
      url.pathname.includes('vite.svg')) {
    console.log('Skipping localhost/dev request:', request.url);
    return;
  }
  
  // Only handle requests from our domain (any Vercel subdomain)
  if (!url.hostname.includes('vercel.app') && 
      url.hostname !== 'localhost' && 
      url.hostname !== '127.0.0.1') {
    console.log('Skipping external request:', request.url);
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          console.log('Serving from cache:', request.url);
          return response;
        }
        
        // Fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Cache successful responses for static assets
            if (networkResponse.status === 200 && 
                (request.destination === 'image' || 
                 request.destination === 'script' || 
                 request.destination === 'style')) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.log('Fetch failed:', request.url, error);
            
            // Return fallback for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            // Return error response for other requests
            return new Response('Network error', { 
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
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
  console.log('Background sync triggered');
  // This will be implemented when we add SMS functionality
} 