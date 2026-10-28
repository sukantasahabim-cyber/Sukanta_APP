import { createScope, h, toast } from './ui/dom.js';
import { store } from './store.js';
import { t, lang, LANGUAGES, languageChosen, detectLanguage } from './i18n/i18n.js';
import { applyContent } from './i18n/content.js';
import { homeView } from './views/home.js';
import { courseView } from './views/course.js';
import { lessonView } from './views/lesson.js';
import { toolsView, toolView } from './views/tools.js';
import { progressView } from './views/progress.js';
import { practicalView, practiceHubView } from './views/practical.js';
import { notFound } from './views/notfound.js';
import { singAlongListView, singAlongView } from './views/singalong.js';
import { mySongEditView } from './views/mysongs.js';
import { ownTrackView } from './views/owntrack.js';
import { studioListView, studioEditView, studioSharedView } from './views/studio.js';
import { tableTablaView } from './views/tabletabla.js';
import { accountView } from './views/account.js';
import { teacherView } from './views/teacher.js';
import { fixListView, fixDrillView } from './views/fix.js';
import { account, takeSignInLink } from './online/account.js';
import { earnedBadges, progressSummary } from './data/badges.js';

const routes = [
  [/^\/$/, homeView, 'home'],
  [/^\/course\/([\w-]+)$/, courseView, 'home'],
  [/^\/lesson\/([\w-]+)$/, lessonView, 'home'],
  [/^\/lesson\/([\w-]+)\/practice$/, practicalView, 'practice'],
  [/^\/practice$/, practiceHubView, 'practice'],
  [/^\/practice\/([\w-]+)$/, practiceHubView, 'practice'],
  [/^\/fix$/, fixListView, 'practice'],
  [/^\/fix\/(.+)$/, fixDrillView, 'practice'],
  [/^\/tools$/, toolsView, 'tools'],
  [/^\/tools\/([\w-]+)$/, toolView, 'tools'],
  [/^\/progress$/, progressView, 'progress'],
  [/^\/sing$/, singAlongListView, 'home'],
  [/^\/sing\/track$/, ownTrackView, 'home'],
  [/^\/sing\/new$/, mySongEditView, 'home'],
  [/^\/sing\/edit\/([\w-]+)$/, mySongEditView, 'home'],
  [/^\/sing\/([\w-]+)$/, singAlongView, 'home'],
  [/^\/studio$/, studioListView, 'tools'],
  [/^\/studio\/open\/([\w-]+)$/, studioSharedView, 'tools'],
  [/^\/studio\/([\w-]+)$/, studioEditView, 'tools'],
  [/^\/table-tabla$/, tableTablaView, 'tools'],
  [/^\/table-tabla\/([\w-]+)\/(\d+)$/, tableTablaView, 'tools'],
  [/^\/account$/, accountView, 'progress'],
  [/^\/teacher$/, teacherView, 'tools'],
  [/^\/teacher\/([\w-]+)$/, teacherView, 'tools'],
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
  for (const [pattern, fn, routeTab] of routes) {
    const m = pattern.exec(path);
    if (m) { view = fn; tab = routeTab; params = m.slice(1); break; }
  }
  translateShell();
  app.replaceChildren(view(scope, ...params));
  document.querySelectorAll('.tabbar a').forEach((a) => a.classList.toggle('active', a.dataset.tab === tab));
  window.scrollTo({ top: 0 });
  app.focus({ preventScroll: true });
}

// Static parts of index.html carry data-i18n keys.
function translateShell() {
  document.documentElement.lang = lang();
  document.title = t('app.title');
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  const switcher = document.getElementById('lang-switch');
  switcher.replaceChildren(...LANGUAGES.map((l) => h('button', {
    class: `lang-btn${l.id === lang() ? ' on' : ''}`, lang: l.id, title: l.label, 'aria-pressed': String(l.id === lang()),
    onClick: () => store.setSetting('lang', l.id),
  }, l.short)));
  switcher.setAttribute('aria-label', t('lang.title'));
}

// First visit: ask which language to use, in all three languages.
function chooseLanguage() {
  const suggested = detectLanguage();
  const dialog = h('div', { class: 'lang-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'lang-dialog-title' },
    h('div', { class: 'lang-card' },
      h('img', { src: 'icons/icon.svg', alt: '', width: 64, height: 64 }),
      h('h1', { id: 'lang-dialog-title' }, 'Choose your language'),
      h('p', { lang: 'bn' }, 'আপনার ভাষা বেছে নিন'),
      h('p', { lang: 'hi' }, 'अपनी भाषा चुनें'),
      h('div', { class: 'lang-choices' }, LANGUAGES.map((l) => h('button', {
        class: `btn ${l.id === suggested ? 'btn-primary' : ''}`, lang: l.id,
        onClick: () => { dialog.remove(); store.setSetting('lang', l.id); },
      }, l.label)))));
  document.body.append(dialog);
  dialog.querySelector('.btn-primary')?.focus();
}

let shownLang = lang();
let shownNotation = store.setting('notation');
store.subscribe(async () => {
  if (lang() !== shownLang) {
    shownLang = lang();
    shownNotation = store.setting('notation');
    await applyContent(shownLang);
    render();
  } else if (store.setting('notation') !== shownNotation) {
    shownNotation = store.setting('notation');
    render();
  }
});

// Award any newly earned badges and celebrate them.
function checkBadges() {
  const fresh = store.awardBadges(earnedBadges(progressSummary(store)));
  if (fresh.length === 1) toast(t('badges.new', { name: t(`badge.${fresh[0]}.name`) }));
  else if (fresh.length > 1) toast(t('badges.newMany', { n: fresh.length }));
}
store.subscribe(checkBadges);

window.addEventListener('hashchange', render);
takeSignInLink();
applyContent(lang()).then(() => {
  render();
  if (!languageChosen()) chooseLanguage();
  checkBadges();
  account.start()
    .then((result) => {
      if (result === 'signedIn') toast(t('account.welcome'));
      else if (result === 'linkFailed') toast(t('account.linkFailed'));
    })
    .catch((err) => console.warn('SurTaal account', err));
});

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is optional */ });
}
