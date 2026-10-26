// Offline support. Online, every request goes to the network first (skipping
// the browser's HTTP cache), so a new version shows up on the next load; the
// cache is the fallback when offline.
const CACHE = 'surtaal-v18';
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
  'js/analysis/singalong.js',
  'js/data/practice.js',
  'js/data/plan.js',
  'js/data/badges.js',
  'js/data/lehras.js',
  'js/data/songs.js',
  'js/data/mysongs.js',
  'js/data/youtube.js',
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
  'js/i18n/bn/more.js',
  'js/i18n/bn/more2.js',
  'js/i18n/hi/singing.js',
  'js/i18n/hi/tabla.js',
  'js/i18n/hi/guitar.js',
  'js/i18n/hi/common.js',
  'js/i18n/hi/more.js',
  'js/i18n/hi/more2.js',
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
  'js/widgets/lehra.js',
  'js/views/home.js',
  'js/views/course.js',
  'js/views/lesson.js',
  'js/views/tools.js',
  'js/views/progress.js',
  'js/views/notfound.js',
  'js/views/lessonHeader.js',
  'js/views/practical.js',
  'js/views/singalong.js',
  'js/views/mysongs.js',
  'js/views/owntrack.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE)
    .then((c) => c.addAll(ASSETS.map((url) => new Request(url, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;
  event.respondWith((async () => {
    try {
      const res = await fetch(request.url, { cache: 'no-cache' });
      if (res.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(request, res.clone());
      }
      return res;
    } catch {
      const cached = await caches.match(request, { ignoreSearch: true });
      return cached || (request.mode === 'navigate' ? caches.match('./') : Response.error());
    }
  })());
});
