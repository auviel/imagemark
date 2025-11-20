'use client'

import { useEffect } from 'react'

/**
 * Service Worker Registration Component
 * Registers the service worker for PWA functionality
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration.scope)

          // Check for updates periodically
          setInterval(
            () => {
              registration.update()
            },
            60 * 60 * 1000
          ) // Check every hour
        })
        .catch((error) => {
          console.warn('Service Worker registration failed:', error)
        })

      // Handle service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    }
  }, [])

  return null
}
