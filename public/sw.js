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

self.addEventListener('push', (event) => {
  let payload = { title: 'FitTrack AI', body: 'Come back and check in on your progress.', url: '/dashboard' }
  try {
    if (event.data) payload = { ...payload, ...event.data.json() }
  } catch {
    // non-JSON push payload — fall back to the default text above
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: payload.url },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/dashboard'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })
  )
})
