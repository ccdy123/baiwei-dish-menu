// Service Worker：运行时缓存策略，保证断网后仍可浏览已访问过的菜品与图片
const CACHE = 'home-cooking-v1'
const CORE = ['./', './index.html', './manifest.json']

self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).catch(() => {}))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)

  // 导航请求：网络优先，失败回退缓存中的 index.html（SPA 离线可用）
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    )
    return
  }

  // 同源静态资源：缓存优先 + 后台更新
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then((cached) => {
        const net = fetch(req).then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {})
          }
          return res
        }).catch(() => cached)
        return cached || net
      })
    )
    return
  }

  // 跨域图片等：网络优先，失败回退缓存
  if (req.destination === 'image') {
    e.respondWith(
      fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {})
        }
        return res
      }).catch(() => caches.match(req))
    )
  }
})
