// Sync map: the exercise's grid as a timeline, with what was heard laid over
// it, so the learner sees exactly where they drifted from the music.
import { h } from '../ui/dom.js';
import { t } from '../i18n/i18n.js';
import { problemSpots } from '../analysis/sync.js';

const MARK = { ok: '✓', early: '◂', late: '▸', missed: '✕', sound: '≈' };

export function syncMap(model, extras, perBeat) {
  const n = model.cells.length;
  const at = (pos) => `${((pos + 0.5) / n) * 100}%`;
  const track = h('div', { class: 'sync-track', style: { minWidth: `${n * (perBeat > 1 ? 24 : 30)}px` } },
    // The music: one slot per grid position, beat starts marked.
    model.cells.map((c) => h('div', { class: `sync-slot ${c.status}${c.slot % perBeat === 0 ? ' beat' : ''}`, style: { left: `${(c.slot / n) * 100}%`, width: `${100 / n}%` } },
      h('span', { class: 'sync-label' }, c.slot % perBeat === 0 || perBeat > 1 ? c.label : ''),
      c.expected && h('span', { class: 'sync-want', 'aria-hidden': 'true' }),
      c.expected && h('span', { class: 'sync-mark', 'aria-hidden': 'true' }, MARK[c.status] || ''))),
    // What was played: a dot at the position it landed, off-centre when early or late.
    model.cells.filter((c) => c.expected && c.status !== 'missed').map((c) =>
      h('span', { class: `sync-dot ${c.status}`, style: { left: at(c.slot + c.shift) }, 'aria-hidden': 'true' })),
    extras.map((e) => h('span', { class: 'sync-dot extra', style: { left: at(e.pos) }, 'aria-hidden': 'true' })));

  const spots = problemSpots(model);
  // Missing and extra strokes are listed together; timing slips one by one, with how far off they were.
  const missed = spots.filter((c) => c.status === 'missed').map((c) => c.label);
  const sound = spots.filter((c) => c.status === 'sound').map((c) => c.label);
  const list = [];
  if (missed.length) list.push(t('sync.missed', { at: missed.join(', ') }));
  if (sound.length) list.push(t('sync.sound', { at: sound.join(', ') }));
  spots.forEach((c) => {
    if (c.status === 'early' || c.status === 'late') list.push(t(`sync.${c.status}`, { at: c.label, ms: Math.abs(c.offsetMs) }));
  });
  if (extras.length) list.push(t('sync.extra', { at: [...new Set(extras.map((e) => e.label))].join(', ') }));

  return h('div', { class: 'sync-map' },
    h('div', { class: 'sync-title' }, t('sync.title')),
    h('div', { class: 'sync-scroll', tabindex: '0', role: 'img', 'aria-label': list.length ? t('sync.aria', { list: list.join('; ') }) : t('sync.allIn') },
      track),
    h('div', { class: 'sync-key small muted' },
      h('span', {}, `${MARK.ok} ${t('sync.keyOk')}`), h('span', {}, `${MARK.early} ${t('sync.keyEarly')}`),
      h('span', {}, `${MARK.late} ${t('sync.keyLate')}`), h('span', {}, `${MARK.missed} ${t('sync.keyMissed')}`),
      sound.length > 0 && h('span', {}, `${MARK.sound} ${t('sync.keySound')}`),
      extras.length > 0 && h('span', {}, h('i', { class: 'sync-key-extra', 'aria-hidden': 'true' }), ` ${t('sync.keyExtra')}`)),
    list.length ? h('ul', { class: 'sync-list' }, list.map((l) => h('li', {}, l))) : h('p', { class: 'sync-ok' }, t('sync.allIn')));
}
