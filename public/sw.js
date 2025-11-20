/**
 * Service Worker for ImageMark PWA
 * Provides offline support and caching strategies
 */

const CACHE_NAME = 'imagemark-v1'
const STATIC_CACHE_NAME = 'imagemark-static-v1'
const DYNAMIC_CACHE_NAME = 'imagemark-dynamic-v1'

// Assets to cache on install
const STATIC_ASSETS = ['/', '/watermark', '/favicon.ico', '/site.webmanifest']

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.warn('Failed to cache some static assets:', error)
      })
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return (
              name !== STATIC_CACHE_NAME &&
              name !== DYNAMIC_CACHE_NAME &&
              name.startsWith('imagemark-')
            )
          })
          .map((name) => caches.delete(name))
      )
    })
  )
  return self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip API requests (they should always go to network)
  if (url.pathname.startsWith('/api/')) {
    return
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        return cachedResponse
      }

      // Otherwise, fetch from network
      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          // Clone the response for caching
          const responseToCache = response.clone()

          // Cache dynamic content
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // If network fails and no cache, return offline page
          if (request.destination === 'document') {
            return caches.match('/')
          }
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
          })
        })
    })
  )
})

// Message event - handle cache clearing
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.map((name) => caches.delete(name)))
    })
  }
})
