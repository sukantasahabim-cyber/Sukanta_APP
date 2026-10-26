// Offline support: serve from cache, refresh the cache in the background.
const CACHE = 'surtaal-v11';
const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png',
  'css/styles.css',
  'js/main.js',
  'js/music.js',
  'js/store.js',
  'js/audio/engine.js',
  'js/audio/looper.js',
  'js/audio/tabla.js',
  'js/audio/guitar.js',
  'js/audio/voice.js',
  'js/audio/mic.js',
  'js/audio/pitch.js',
  'js/audio/ks.js',
  'js/audio/listen.js',
  'js/audio/capture-worklet.js',
  'js/analysis/fft.js',
  'js/analysis/onsets.js',
  'js/analysis/strokes.js',
  'js/analysis/chroma.js',
  'js/analysis/notes.js',
  'js/analysis/rhythm.js',
  'js/analysis/sync.js',
  'js/data/practice.js',
  'js/data/plan.js',
  'js/data/courses.js',
  'js/data/tabla.js',
  'js/data/guitar.js',
  'js/data/singing.js',
  'js/data/taals.js',
  'js/data/chords.js',
  'js/i18n/i18n.js',
  'js/i18n/names.js',
  'js/i18n/content.js',
  'js/i18n/en.js',
  'js/i18n/bn.js',
  'js/i18n/hi.js',
  'js/i18n/content-bn.js',
  'js/i18n/content-hi.js',
  'js/i18n/bn/singing.js',
  'js/i18n/bn/tabla.js',
  'js/i18n/bn/guitar.js',
  'js/i18n/bn/common.js',
  'js/i18n/hi/singing.js',
  'js/i18n/hi/tabla.js',
  'js/i18n/hi/guitar.js',
  'js/i18n/hi/common.js',
  'js/ui/dom.js',
  'js/ui/controls.js',
  'js/widgets/index.js',
  'js/widgets/common.js',
  'js/widgets/tabla.js',
  'js/widgets/guitar.js',
  'js/widgets/voice.js',
  'js/widgets/practice.js',
  'js/widgets/syncMap.js',
  'js/widgets/micCheck.js',
  'js/widgets/ear.js',
  'js/views/home.js',
  'js/views/course.js',
  'js/views/lesson.js',
  'js/views/tools.js',
  'js/views/progress.js',
  'js/views/notfound.js',
  'js/views/lessonHeader.js',
  'js/views/practical.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  const network = fetch(event.request).then(async (res) => {
    if (res.ok) {
      const copy = res.clone();
      const cache = await caches.open(CACHE);
      await cache.put(event.request, copy);
    }
    return res;
  });
  event.waitUntil(network.catch(() => {}));
  event.respondWith(caches.match(event.request).then((cached) => cached || network));
});
