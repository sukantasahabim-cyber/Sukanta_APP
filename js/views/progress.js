import { h, toast } from '../ui/dom.js';
import { store, dayKey } from '../store.js';
import { COURSES, courseProgress, practiceProgress } from '../data/courses.js';
import { stepBlock } from '../widgets/index.js';

function weekChart() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ label: d.toLocaleDateString(undefined, { weekday: 'short' }), minutes: store.minutesOn(dayKey(d)) });
  }
  const max = Math.max(30, ...days.map((d) => d.minutes));
  return h('div', { class: 'week-chart', role: 'img', 'aria-label': `Practice minutes for the last 7 days: ${days.map((d) => `${d.label} ${d.minutes}`).join(', ')}` },
    days.map((d) => h('div', { class: 'week-day' },
      h('span', { class: 'week-value' }, d.minutes ? String(d.minutes) : ''),
      h('div', { class: 'week-bar-wrap' }, h('div', { class: 'week-bar', style: { height: `${(d.minutes / max) * 100}%` } })),
      h('span', { class: 'week-label' }, d.label))));
}

export function progressView(scope) {
  const total = store.totalMinutes();
  return h('div', { class: 'container' },
    h('h1', {}, 'Your progress'),
    h('div', { class: 'stats' },
      h('div', { class: 'stat' }, h('b', {}, `${store.streak()} 🔥`), h('span', {}, 'day streak')),
      h('div', { class: 'stat' }, h('b', {}, total >= 60 ? `${(total / 60).toFixed(1)} h` : `${total} min`), h('span', {}, 'total practice')),
      h('div', { class: 'stat' }, h('b', {}, `${Object.keys(store.get().completed).length} · ${Object.keys(store.get().practiceDone).length}`), h('span', {}, 'theory · practical'))),
    h('div', { class: 'step-card' }, h('h3', {}, 'Last 7 days (minutes)'), weekChart()),
    h('div', { class: 'step-card' },
      h('h3', {}, 'Courses'),
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
    h('div', { class: 'step-card' }, stepBlock({ type: 'sapicker', title: 'Settings · Your Sa (used by tanpura, swaras and tabla tuning)' }, scope)),
    h('div', { class: 'step-card' },
      h('h3', {}, 'Reset'),
      h('p', { class: 'muted small' }, 'Progress is stored only on this device.'),
      h('button', {
        class: 'btn btn-danger',
        onClick: () => {
          if (confirm('Delete all progress, practice history and settings on this device?')) {
            store.reset();
            toast('Progress reset');
            location.hash = '#/';
          }
        },
      }, 'Reset all progress')));
}
