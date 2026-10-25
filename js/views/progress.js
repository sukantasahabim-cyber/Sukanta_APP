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
    h('div', { class: 'step-card' },
      h('h3', {}, 'Daily practice goal'),
      h('label', { class: 'inline' }, 'Minutes per day: ',
        h('select', {
          class: 'select', 'aria-label': 'Daily goal in minutes',
          onChange: (e) => { store.setSetting('dailyGoal', +e.target.value); toast(`Daily goal: ${e.target.value} minutes`); },
        }, [10, 15, 20, 30, 45, 60].map((m) => h('option', { value: m, selected: m === (store.setting('dailyGoal') || 20) }, `${m} min`))))),
    h('div', { class: 'step-card' }, stepBlock({ type: 'sapicker', title: 'Settings · Your Sa (used by tanpura, swaras and tabla tuning)' }, scope)),
    h('div', { class: 'step-card' },
      h('h3', {}, 'Back up your progress'),
      h('p', { class: 'muted small' }, 'Progress is stored only in this browser. Save it to a file to keep it safe or move it to another phone or computer.'),
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
            toast('Progress saved to a file');
          },
        }, '💾 Save progress to a file'),
        h('label', { class: 'btn' }, '📂 Restore from a file',
          h('input', {
            type: 'file', accept: '.json,application/json', class: 'visually-hidden',
            onChange: async (e) => {
              const file = e.target.files[0];
              e.target.value = '';
              if (!file) return;
              try {
                const text = await file.text();
                if (!confirm('Replace the progress on this device with the progress in this file?')) return;
                store.restore(text);
                toast('Progress restored ✓');
                location.hash = '#/';
              } catch (err) {
                toast(err.message);
              }
            },
          })))),
    h('div', { class: 'step-card' },
      h('h3', {}, 'Reset'),
      h('p', { class: 'muted small' }, 'Deletes everything on this device. Save a backup first if you may want it back.'),
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
