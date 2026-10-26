import { h, toast } from '../ui/dom.js';
import { store, dayKey } from '../store.js';
import { COURSES, courseProgress, practiceProgress } from '../data/courses.js';
import { stepBlock } from '../widgets/index.js';
import { t, lang, LANGUAGES } from '../i18n/i18n.js';
import { BADGES } from '../data/badges.js';

const LOCALES = { en: 'en-IN', bn: 'bn-IN', hi: 'hi-IN' };

function weekChart() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ label: d.toLocaleDateString(LOCALES[lang()], { weekday: 'short' }), minutes: store.minutesOn(dayKey(d)) });
  }
  const max = Math.max(30, ...days.map((d) => d.minutes));
  return h('div', { class: 'week-chart', role: 'img', 'aria-label': t('progress.chartLabel', { list: days.map((d) => `${d.label} ${d.minutes}`).join(', ') }) },
    days.map((d) => h('div', { class: 'week-day' },
      h('span', { class: 'week-value' }, d.minutes ? String(d.minutes) : ''),
      h('div', { class: 'week-bar-wrap' }, h('div', { class: 'week-bar', style: { height: `${(d.minutes / max) * 100}%` } })),
      h('span', { class: 'week-label' }, d.label))));
}

function badgesCard() {
  const earned = BADGES.filter((b) => store.hasBadge(b.id)).length;
  return h('div', { class: 'step-card' },
    h('h2', {}, t('badges.title')),
    h('p', { class: 'muted small' }, t('badges.count', { n: earned, total: BADGES.length })),
    h('ul', { class: 'badge-grid' }, BADGES.map((b) => {
      const has = store.hasBadge(b.id);
      return h('li', { class: `badge-tile${has ? ' earned' : ''}` },
        h('span', { class: 'badge-icon', 'aria-hidden': 'true' }, b.icon),
        h('b', {}, t(`badge.${b.id}.name`)),
        h('span', { class: 'small muted' }, t(`badge.${b.id}.desc`)),
        h('span', { class: 'visually-hidden' }, has ? t('badges.earned') : t('badges.locked')));
    })));
}

export function progressView(scope) {
  const total = store.totalMinutes();
  return h('div', { class: 'container' },
    h('h1', {}, t('progress.title')),
    h('div', { class: 'stats' },
      h('div', { class: 'stat' }, h('b', {}, `${store.streak()} 🔥`), h('span', {}, t('stat.streak'))),
      h('div', { class: 'stat' }, h('b', {}, total >= 60 ? t('unit.hours', { n: (total / 60).toFixed(1) }) : t('unit.min', { n: total })), h('span', {}, t('stat.total'))),
      h('div', { class: 'stat' }, h('b', {}, `${Object.keys(store.get().completed).length} · ${Object.keys(store.get().practiceDone).length}`), h('span', {}, t('stat.theoryPractical')))),
    h('div', { class: 'step-card' }, h('h2', {}, t('progress.week')), weekChart()),
    h('div', { class: 'step-card' },
      h('h2', {}, t('progress.courses')),
      COURSES.map((c) => {
        const p = courseProgress(c, store.isDone);
        const pp = practiceProgress(c, store.isPracticeDone);
        return h('a', { class: `progress-row c-${c.id}`, href: `#/course/${c.id}` },
          h('span', { 'aria-hidden': 'true' }, c.icon),
          h('span', { class: 'progress-name' }, c.name),
          h('div', { class: 'progress-bars' },
            h('div', { class: 'progress-line' }, h('span', { class: 'small' }, '📖'), h('div', { class: 'bar' }, h('div', { class: 'bar-fill', style: { width: `${p.pct}%` } })), h('span', { class: 'muted small' }, `${p.done}/${p.total}`)),
            h('div', { class: 'progress-line' }, h('span', { class: 'small' }, '🎯'), h('div', { class: 'bar' }, h('div', { class: 'bar-fill', style: { width: `${pp.pct}%` } })), h('span', { class: 'muted small' }, `${pp.done}/${pp.total}`))));
      })),
    badgesCard(),
    h('div', { class: 'step-card' },
      h('h2', {}, t('lang.title')),
      h('div', { class: 'segmented', role: 'group', 'aria-label': t('lang.title') },
        LANGUAGES.map((l) => h('button', {
          class: `seg${l.id === lang() ? ' on' : ''}`, lang: l.id,
          onClick: () => store.setSetting('lang', l.id),
        }, l.label)))),
    h('div', { class: 'step-card' },
      h('h2', {}, t('goal.title')),
      h('label', { class: 'inline' }, t('goal.perDay'),
        h('select', {
          class: 'select', 'aria-label': t('goal.select'),
          onChange: (e) => { store.setSetting('dailyGoal', +e.target.value); toast(t('goal.set', { n: e.target.value })); },
        }, [10, 15, 20, 30, 45, 60].map((m) => h('option', { value: m, selected: m === (store.setting('dailyGoal') || 20) }, t('unit.min', { n: m })))))),
    h('div', { class: 'step-card' }, stepBlock({ type: 'sapicker', title: t('progress.saTitle') }, scope)),
    h('div', { class: 'step-card' },
      h('h2', {}, t('backup.title')),
      h('p', { class: 'muted small' }, t('backup.intro')),
      h('div', { class: 'controls' },
        h('button', {
          class: 'btn btn-primary',
          onClick: () => {
            const url = URL.createObjectURL(new Blob([store.backup()], { type: 'application/json' }));
            const a = h('a', { href: url, download: `surtaal-progress-${dayKey()}.json` });
            document.body.append(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            toast(t('backup.saved'));
          },
        }, t('backup.save')),
        h('label', { class: 'btn' }, t('backup.restore'),
          h('input', {
            type: 'file', accept: '.json,application/json', class: 'visually-hidden',
            onChange: async (e) => {
              const file = e.target.files[0];
              e.target.value = '';
              if (!file) return;
              try {
                const text = await file.text();
                if (!confirm(t('backup.confirm'))) return;
                store.restore(text);
                toast(t('backup.restored'));
                location.hash = '#/';
              } catch (err) {
                toast(t(err.code || 'backup.invalid'));
              }
            },
          })))),
    h('div', { class: 'step-card' },
      h('h2', {}, t('reset.title')),
      h('p', { class: 'muted small' }, t('reset.intro')),
      h('button', {
        class: 'btn btn-danger',
        onClick: () => {
          if (confirm(t('reset.confirm'))) {
            store.reset();
            toast(t('reset.done'));
            location.hash = '#/';
          }
        },
      }, t('reset.button'))));
}
