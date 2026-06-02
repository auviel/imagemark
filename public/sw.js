/**
 * Service Worker — shell-only caching (no user images or dynamic API responses).
 */

const STATIC_CACHE_NAME = 'imagemark-static-v2'

const STATIC_ASSETS = ['/', '/watermark', '/favicon.ico', '/site.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name.startsWith('imagemark-') && name !== STATIC_CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
  )
  return self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== location.origin) return
  if (url.pathname.startsWith('/api/')) return

  const isShell =
    request.destination === 'document' ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'manifest' ||
    url.pathname === '/favicon.ico'

  if (!isShell) {
    event.respondWith(fetch(request))
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }
        const clone = response.clone()
        caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, clone))
        return response
      })
    })
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => Promise.all(names.map((name) => caches.delete(name))))
  }
})
