// ─── Service Worker for СМЫСЛ ЕСТЬ PWA ──────────────────────────────────────
// Strategy: Cache-first for static assets, network-first for API & pages.

const CACHE_NAME = "smuslest-v1"
const STATIC_CACHE_NAME = "smuslest-static-v1"

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
 "/",
 "/market",
 "/profile",
 "/manifest.json",
 "/photo/logo.png",
 "/images/Logoo.png",
]

// ── Install ──────────────────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
 event.waitUntil(
  caches.open(STATIC_CACHE_NAME).then((cache) => {
   return cache.addAll(PRECACHE_ASSETS)
  })
 )
 self.skipWaiting()
})

// ── Activate ─────────────────────────────────────────────────────────────────

self.addEventListener("activate", (event) => {
 event.waitUntil(
  caches.keys().then((keys) =>
   Promise.all(
    keys
     .filter((key) => key !== CACHE_NAME && key !== STATIC_CACHE_NAME)
     .map((key) => caches.delete(key))
   )
  )
 )
 self.clients.claim()
})

// ── Fetch ─────────────────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
 const { request } = event
 const url = new URL(request.url)

 // Skip non-GET and cross-origin requests
 if (request.method !== "GET" || url.origin !== self.location.origin) return

 // Network-first for API and Next.js internal routes
 if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/")) {
  event.respondWith(networkFirst(request))
  return
 }

 // Cache-first for static files (images, fonts, icons)
 if (
  url.pathname.startsWith("/images/") ||
  url.pathname.startsWith("/photo/") ||
  url.pathname.startsWith("/icons/") ||
  url.pathname.match(/\.(png|jpg|jpeg|webp|svg|woff2?|ico)$/)
 ) {
  event.respondWith(cacheFirst(request))
  return
 }

 // Network-first for pages (with offline fallback)
 event.respondWith(networkFirst(request))
})

// ── Strategies ────────────────────────────────────────────────────────────────

async function cacheFirst(request) {
 const cached = await caches.match(request)
 if (cached) return cached

 try {
  const response = await fetch(request)
  if (response.ok) {
   const cache = await caches.open(STATIC_CACHE_NAME)
   cache.put(request, response.clone())
  }
  return response
 } catch {
  return new Response("Offline", { status: 503 })
 }
}

async function networkFirst(request) {
 try {
  const response = await fetch(request)
  if (response.ok) {
   const cache = await caches.open(CACHE_NAME)
   cache.put(request, response.clone())
  }
  return response
 } catch {
  const cached = await caches.match(request)
  if (cached) return cached
  // Offline fallback for navigation requests
  if (request.mode === "navigate") {
   const fallback = await caches.match("/")
   if (fallback) return fallback
  }
  return new Response("Offline", { status: 503 })
 }
}
