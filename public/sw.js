// Minimal, safe service worker: only provides an offline fallback page for
// navigation requests. Deliberately does NOT cache the app shell, JS/CSS
// bundles, API responses, or any user data (progress photos use short-lived
// signed URLs and must never be cached) — avoids the classic "stale app
// after deploy" PWA bug while still giving a friendly offline screen.
const CACHE_NAME = 'fittrack-ai-offline-v1'
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return

  event.respondWith(
    fetch(event.request).catch(() => caches.match(OFFLINE_URL))
  )
})
