// Staff notation: a melody written on a treble staff (in C, so Do = C), with
// each note's name underneath and a play button that sings it in the
// learner's key while the notes light up. Holds ("-") lengthen a note:
// 1 beat = quarter, 2 = half, 3 = dotted half, 4 = whole.
import { h, svg } from '../ui/dom.js';
import { swaraLabel } from '../ui/controls.js';
import { t } from '../i18n/i18n.js';
import { getCtx } from '../audio/engine.js';
import { playSwara } from '../audio/voice.js';
import { staffNotes } from '../data/staff.js';

const GAP = 10;              // space between staff lines
const TOP = 38;              // y of the top line (F5)
const BEAT = 34;             // horizontal room per beat
const LEFT = 64;             // room for clef and time signature
const BEATS_PER_LINE = 8;    // two bars of 4/4 per staff line

const yOf = (pos) => TOP + 4 * GAP - (pos - 2) * (GAP / 2);   // pos 2 = E4, the bottom line

// A stylised treble (G) clef curling around the G line.
const CLEF = 'M15 70 C9 70 8 63 14 61 C21 59 23 69 17 74 C10 79 3 72 5 64 C7 55 16 50 19 41 C21 33 18 26 15 28 C11 31 12 42 14 52 L18 86 C19 92 12 94 11 89';

function line(notes, from, to, withClef) {
  const width = LEFT + (to - from) * BEAT + 16;
  const s = svg('svg', { viewBox: `0 0 ${width} 132`, class: 'staff-svg', width, role: 'img', 'aria-hidden': 'true' });
  for (let i = 0; i < 5; i++) s.append(svg('line', { x1: 4, x2: width - 4, y1: TOP + i * GAP, y2: TOP + i * GAP, class: 'staff-line' }));
  s.append(svg('path', { d: CLEF, class: 'staff-clef' }), svg('circle', { cx: 12, cy: 89, r: 3, class: 'staff-clef-dot' }));
  if (withClef) {
    s.append(svg('text', { x: 40, y: TOP + 17, class: 'staff-time' }, '4'), svg('text', { x: 40, y: TOP + 37, class: 'staff-time' }, '4'));
  }
  s.append(svg('line', { x1: width - 4, x2: width - 4, y1: TOP, y2: TOP + 4 * GAP, class: 'staff-bar' }));
  const groups = [];
  for (const n of notes) {
    if (n.beat < from || n.beat >= to) continue;
    const x = LEFT + (n.beat - from) * BEAT + 8;
    const y = yOf(n.pos);
    const g = svg('g', { class: 'staff-note' });
    // Ledger lines for notes above or below the staff.
    for (let p = 0; p >= n.pos; p -= 2) g.append(svg('line', { x1: x - 9, x2: x + 9, y1: yOf(p), y2: yOf(p), class: 'staff-line' }));
    for (let p = 12; p <= n.pos; p += 2) g.append(svg('line', { x1: x - 9, x2: x + 9, y1: yOf(p), y2: yOf(p), class: 'staff-line' }));
    if (n.accidental) g.append(svg('text', { x: x - 17, y: y + 5, class: 'staff-acc' }, n.accidental));
    const hollow = n.beats >= 2;
    g.append(svg('ellipse', { cx: x, cy: y, rx: 6, ry: 4.4, transform: `rotate(-20 ${x} ${y})`, class: hollow ? 'staff-head hollow' : 'staff-head' }));
    if (n.beats < 4) {
      const up = n.pos < 6;
      const sx = up ? x + 5.6 : x - 5.6;
      g.append(svg('line', { x1: sx, x2: sx, y1: up ? y - 1 : y + 1, y2: up ? y - 32 : y + 32, class: 'staff-stem' }));
    }
    if (n.beats === 3) g.append(svg('circle', { cx: x + 11, cy: n.pos % 2 ? y : y - 4, r: 1.8, class: 'staff-dot' }));
    groups.push({ n, g });
    s.append(g);
  }
  // Bar lines after every four beats.
  for (let b = from + 4; b < to; b += 4) {
    const x = LEFT + (b - from) * BEAT - 4;
    s.append(svg('line', { x1: x, x2: x, y1: TOP, y2: TOP + 4 * GAP, class: 'staff-bar' }));
  }
  return { el: s, groups };
}

export function staff(step) {
  const notes = staffNotes(step.notes);
  const total = notes.reduce((n, x) => Math.max(n, x.beat + x.beats), 0);
  const lines = [];
  const all = [];
  for (let from = 0; from < total; from += BEATS_PER_LINE) {
    const l = line(notes, from, Math.min(total, from + BEATS_PER_LINE), from === 0);
    lines.push(l.el);
    all.push(...l.groups);
  }
  // Note names under the staff, in the learner's chosen note names.
  const names = h('div', { class: 'staff-names' }, notes.map((n) => h('span', { class: 'note-chip' }, swaraLabel(n.sw))));
  const chips = [...names.children];
  let timers = [];
  const stop = () => { timers.forEach(clearTimeout); timers = []; all.forEach(({ g }) => g.classList.remove('on')); chips.forEach((c) => c.classList.remove('on')); };
  const play = () => {
    stop();
    const beat = 60 / (step.bpm || 72);
    const t0 = getCtx().currentTime + 0.1;
    notes.forEach((n, i) => {
      playSwara(n.sw.semitone, t0 + n.beat * beat, n.beats * beat * 0.92);
      timers.push(setTimeout(() => {
        all.forEach(({ g, n: m }) => g.classList.toggle('on', m === n));
        chips.forEach((c, k) => c.classList.toggle('on', k === i));
      }, (n.beat * beat + 0.1) * 1000));
    });
    timers.push(setTimeout(stop, (total * beat + 0.4) * 1000));
  };
  return h('div', { class: 'widget staff' },
    h('div', { class: 'staff-lines' }, lines),
    names,
    h('div', { class: 'controls' },
      h('button', { class: 'btn btn-primary', type: 'button', onClick: play }, t('common.hearIt')),
      h('span', { class: 'small muted' }, t('staff.writtenInC'))));
}
