const CACHE_NAME = 'fwdlive-2025-v1'
const urlsToCache = [
  '/',
  '/admin',
  '/delegate', 
  '/register',
  '/api/branding',
  '/api/register'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request)
      })
  )
})
