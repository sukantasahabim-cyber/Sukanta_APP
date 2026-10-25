import { createScope } from './ui/dom.js';
import { homeView } from './views/home.js';
import { courseView } from './views/course.js';
import { lessonView } from './views/lesson.js';
import { toolsView, toolView } from './views/tools.js';
import { progressView } from './views/progress.js';
import { notFound } from './views/notfound.js';

const routes = [
  [/^\/$/, homeView, 'home'],
  [/^\/course\/([\w-]+)$/, courseView, 'home'],
  [/^\/lesson\/([\w-]+)$/, lessonView, 'home'],
  [/^\/tools$/, toolsView, 'tools'],
  [/^\/tools\/([\w-]+)$/, toolView, 'tools'],
  [/^\/progress$/, progressView, 'progress'],
];

const app = document.getElementById('app');
let scope = createScope();

function render() {
  scope.dispose();
  scope = createScope();
  const path = location.hash.replace(/^#/, '') || '/';
  let view = notFound;
  let tab = null;
  let params = [];
  for (const [pattern, fn, t] of routes) {
    const m = pattern.exec(path);
    if (m) { view = fn; tab = t; params = m.slice(1); break; }
  }
  app.replaceChildren(view(scope, ...params));
  document.querySelectorAll('.tabbar a').forEach((a) => a.classList.toggle('active', a.dataset.tab === tab));
  window.scrollTo({ top: 0 });
  app.focus({ preventScroll: true });
}

window.addEventListener('hashchange', render);
render();

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is optional */ });
}
