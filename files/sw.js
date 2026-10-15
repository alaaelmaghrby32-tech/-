const CACHE = 'makka-pro-v7';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const put = (req, res) => {
  if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
  return res;
};

// ملفات المعرض: من النت الأول (عشان التحديثات تظهر)، ومن الكاش لو مفيش نت
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const isGal = new URL(e.request.url).pathname.includes('/designs/');
  e.respondWith(isGal
    ? fetch(e.request).then(res => put(e.request, res)).catch(() => caches.match(e.request))
    : caches.match(e.request).then(hit => hit || fetch(e.request).then(res => put(e.request, res)).catch(() => caches.match('./index.html'))));
});
