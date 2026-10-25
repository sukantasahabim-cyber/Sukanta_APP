import { h, svg } from '../ui/dom.js';
import { tempoControl, toggleButton, checkbox } from '../ui/controls.js';
import { Looper } from '../audio/looper.js';
import { getCtx, click } from '../audio/engine.js';
import { pluck, strumChord, arpeggio } from '../audio/guitar.js';
import { listenPitch, micErrorMessage } from '../audio/mic.js';
import { CHORDS } from '../data/chords.js';
import { GUITAR_OPEN, GUITAR_STRING_NAMES, freqToMidi, midiName, midiToFreq, noteFromFreq } from '../music.js';

export function chordDiagram(ch) {
  const left = 26, top = 34, sg = 17, fg = 24, frets = 5;
  const base = ch.base || 1;
  const s = svg('svg', { viewBox: '0 0 130 178', class: 'chord-svg', role: 'img', 'aria-label': `${ch.full || ch.name} chord diagram` });
  for (let f = 0; f <= frets; f++) {
    s.append(svg('line', { x1: left, x2: left + 5 * sg, y1: top + f * fg, y2: top + f * fg, class: f === 0 && base === 1 ? 'nut' : 'fret' }));
  }
  for (let i = 0; i < 6; i++) {
    s.append(svg('line', { x1: left + i * sg, x2: left + i * sg, y1: top, y2: top + frets * fg, class: 'string' }));
  }
  if (base > 1) s.append(svg('text', { x: left - 8, y: top + fg * 0.5 + 4, class: 'basefret', 'text-anchor': 'end' }, `${base}fr`));
  ch.frets.forEach((f, i) => {
    const x = left + i * sg;
    if (f < 0) s.append(svg('text', { x, y: top - 9, class: 'marker', 'text-anchor': 'middle' }, '×'));
    else if (f === 0) s.append(svg('circle', { cx: x, cy: top - 13, r: 4.5, class: 'open' }));
  });
  const yOf = (fret) => top + (fret - base + 0.5) * fg;
  if (ch.barre) {
    const { fret, from, to } = ch.barre;
    s.append(svg('rect', { x: left + from * sg - 8, y: yOf(fret) - 8, width: (to - from) * sg + 16, height: 16, rx: 8, class: 'barre' }));
    s.append(svg('text', { x: left + from * sg, y: yOf(fret) + 4, class: 'finger', 'text-anchor': 'middle' }, '1'));
  }
  ch.frets.forEach((f, i) => {
    if (f <= 0) return;
    const b = ch.barre;
    if (b && f === b.fret && i >= b.from && i <= b.to && ch.fingers[i] === 1) return;
    const x = left + i * sg;
    s.append(svg('circle', { cx: x, cy: yOf(f), r: 7.5, class: 'dot' }));
    if (ch.fingers?.[i]) s.append(svg('text', { x, y: yOf(f) + 4, class: 'finger', 'text-anchor': 'middle' }, ch.fingers[i]));
  });
  GUITAR_STRING_NAMES.forEach((n, i) =>
    s.append(svg('text', { x: left + i * sg, y: top + frets * fg + 17, class: 'sname', 'text-anchor': 'middle' }, n)));
  return s;
}

export function chordCard(name, { showTip = true } = {}) {
  const ch = CHORDS[name];
  return h('div', { class: 'chord-card' },
    h('div', { class: 'chord-name' }, ch.name, h('small', {}, ch.full)),
    chordDiagram(ch),
    h('div', { class: 'chord-actions' },
      h('button', { class: 'btn btn-sm', onClick: () => strumChord(ch) }, '🎸 Strum'),
      h('button', { class: 'btn btn-sm btn-ghost', onClick: () => arpeggio(ch) }, 'String by string')),
    showTip && ch.tip && h('p', { class: 'chord-tip' }, ch.tip));
}

export const chords = (step) => h('div', { class: 'chord-grid' }, step.chords.map((c) => chordCard(c)));

export function strings(step) {
  return h('div', { class: 'widget' },
    h('div', { class: 'string-buttons' }, GUITAR_OPEN.map((midi, i) => h('button', {
      class: 'btn string-btn',
      onClick: () => pluck(midi, getCtx().currentTime + 0.01, { string: i, gain: 0.6 }),
    }, h('b', {}, `${6 - i}`), ` ${GUITAR_STRING_NAMES[i]}`, h('small', {}, `${midiName(midi)} · ${midiToFreq(midi).toFixed(1)} Hz`)))),
    h('button', {
      class: 'btn btn-ghost',
      onClick: () => {
        const t = getCtx().currentTime + 0.02;
        GUITAR_OPEN.forEach((m, i) => pluck(m, t + i * 0.6, { string: i, gain: 0.6 }));
      },
    }, '▶ Play all six'));
}

const SLOT_COUNT = ['1', '&', '2', '&', '3', '&', '4', '&', '5', '&', '6', '&'];
const ARROWS = { D: '↓', U: '↑', '-': '·' };

function patternView(pattern) {
  const slots = pattern.map((p, i) => h('div', { class: `slot${p === '-' ? ' miss' : ''}` },
    h('span', { class: 'slot-count' }, SLOT_COUNT[i % SLOT_COUNT.length]),
    h('span', { class: 'slot-arrow' }, ARROWS[p] || p)));
  return { el: h('div', { class: 'pattern' }, slots), slots };
}

// Strum one chord with a pattern of eighth notes ("D", "U", "-").
export function strum(step, scope) {
  let chordName = step.chord || step.chords[0];
  const pattern = step.pattern.split('');
  let bpm = step.bpm || 70;
  let clickOn = false;
  const { el: patternEl, slots } = patternView(pattern);
  const diagramBox = h('div', { class: 'mini-diagram' }, chordDiagram(CHORDS[chordName]));

  const looper = new Looper({
    length: () => pattern.length,
    duration: () => 30 / bpm,
    play: (i, t) => {
      const p = pattern[i];
      if (p === 'D' || p === 'U') strumChord(CHORDS[chordName], t, p);
      if (clickOn && i % 2 === 0) click(t, i === 0, 0.5);
    },
    onStep: (i) => slots.forEach((s, k) => s.classList.toggle('on', k === i)),
  });
  scope.onCleanup(() => looper.stop());

  const chordPicker = step.chords && h('div', { class: 'segmented', role: 'group', 'aria-label': 'Chord' },
    step.chords.map((c) => h('button', {
      class: `seg${c === chordName ? ' on' : ''}`,
      onClick: (e) => {
        chordName = c;
        diagramBox.replaceChildren(chordDiagram(CHORDS[c]));
        [...e.target.parentNode.children].forEach((b) => b.classList.toggle('on', b === e.target));
      },
    }, CHORDS[c].name)));

  return h('div', { class: 'widget' },
    h('div', { class: 'strum-layout' }, diagramBox, patternEl),
    chordPicker,
    h('div', { class: 'controls' },
      toggleButton({ onStart: () => looper.start(), onStop: () => { looper.stop(); slots.forEach((s) => s.classList.remove('on')); } }),
      checkbox('Beat click', clickOn, (v) => { clickOn = v; })),
    tempoControl({ value: bpm, min: 40, max: 160, onChange: (v) => { bpm = v; } }));
}

// Loop through a chord progression, one chord per bar.
export function progression(step, scope) {
  const list = step.chords;
  const pattern = (step.pattern || 'D-D-D-D-').split('');
  const bars = step.barsPerChord || 1;
  const barLen = pattern.length * bars;
  let bpm = step.bpm || 70;
  let clickOn = false;

  const { el: patternEl, slots } = patternView(pattern);
  const chips = list.map((c, i) => h('button', { class: 'chip', onClick: () => show(i) }, CHORDS[c].name));
  const current = h('div', { class: 'mini-diagram' });
  const nextLabel = h('div', { class: 'muted small' });

  function show(i) {
    current.replaceChildren(chordDiagram(CHORDS[list[i]]));
    chips.forEach((c, k) => c.classList.toggle('on', k === i));
    nextLabel.textContent = list.length > 1 ? `Next: ${CHORDS[list[(i + 1) % list.length]].name}` : '';
  }
  show(0);

  const looper = new Looper({
    length: () => list.length * barLen,
    duration: () => 30 / bpm,
    play: (i, t) => {
      const p = pattern[i % pattern.length];
      if (p === 'D' || p === 'U') strumChord(CHORDS[list[Math.floor(i / barLen)]], t, p);
      if (clickOn && i % 2 === 0) click(t, i % barLen === 0, 0.5);
    },
    onStep: (i) => {
      if (i % barLen === 0) show(Math.floor(i / barLen));
      const slot = i % pattern.length;
      slots.forEach((s, k) => s.classList.toggle('on', k === slot));
    },
  });
  scope.onCleanup(() => looper.stop());

  return h('div', { class: 'widget' },
    h('div', { class: 'chips' }, chips),
    h('div', { class: 'strum-layout' }, h('div', {}, current, nextLabel), patternEl),
    h('div', { class: 'controls' },
      toggleButton({ onStart: () => looper.start(), onStop: () => { looper.stop(); slots.forEach((s) => s.classList.remove('on')); } }),
      checkbox('Beat click', clickOn, (v) => { clickOn = v; })),
    tempoControl({ value: bpm, min: 40, max: 180, onChange: (v) => { bpm = v; } }));
}

// Guitar tab. Tokens: "string:fret", joined by "+" for notes played together, "-" for a rest.
export function parseTab(notes) {
  return notes.trim().split(/\s+/).map((tok) => (tok === '-' ? [] : tok.split('+').map((p) => {
    const [s, f] = p.split(':').map(Number);
    return { s, f };
  })));
}

export function tab(step, scope) {
  const cols = parseTab(step.notes);
  let bpm = step.bpm || 70;
  const colEls = cols.map((notes) => h('div', { class: 'tab-col' },
    [1, 2, 3, 4, 5, 6].map((s) => {
      const n = notes.find((x) => x.s === s);
      return h('span', { class: `tab-cell${n ? ' has' : ''}` }, n ? String(n.f) : '');
    })));
  const labels = h('div', { class: 'tab-col tab-labels' }, ['e', 'B', 'G', 'D', 'A', 'E'].map((l) => h('span', { class: 'tab-cell' }, l)));
  const scroller = h('div', { class: 'tab-scroll' }, colEls);

  const looper = new Looper({
    length: () => cols.length,
    duration: () => 60 / bpm,
    play: (i, t) => cols[i].forEach(({ s, f }) => pluck(GUITAR_OPEN[6 - s] + f, t, { string: 6 - s, gain: 0.55 })),
    onStep: (i) => {
      colEls.forEach((c, k) => c.classList.toggle('on', k === i));
      // Keep the playing column visible without scrolling the page.
      const c = colEls[i];
      if (c.offsetLeft < scroller.scrollLeft || c.offsetLeft + c.offsetWidth > scroller.scrollLeft + scroller.clientWidth) {
        scroller.scrollLeft = c.offsetLeft - scroller.clientWidth / 3;
      }
    },
  });
  scope.onCleanup(() => looper.stop());

  return h('div', { class: 'widget' },
    h('div', { class: 'tab-view' }, labels, scroller),
    h('div', { class: 'controls' },
      toggleButton({ onStart: () => looper.start(), onStop: () => { looper.stop(); colEls.forEach((c) => c.classList.remove('on')); } })),
    tempoControl({ value: bpm, min: 30, max: 200, onChange: (v) => { bpm = v; } }));
}

// Microphone tuner. Picks the nearest string automatically, or a string the learner taps.
export function tuner(step, scope) {
  let locked = null;
  let stop = null;
  const noteEl = h('div', { class: 'tuner-note' }, '–');
  const needle = h('div', { class: 'needle' });
  const status = h('div', { class: 'tuner-status' }, 'Tap "Start tuner" and play one string.');
  const freqEl = h('div', { class: 'muted small' }, '');
  const stringBtns = GUITAR_OPEN.map((midi, i) => h('button', {
    class: 'chip',
    onClick: () => {
      locked = locked === i ? null : i;
      stringBtns.forEach((b, k) => b.classList.toggle('locked', k === locked));
      pluck(midi, getCtx().currentTime + 0.01, { string: i, gain: 0.6 });
    },
  }, `${6 - i} ${GUITAR_STRING_NAMES[i]}`));

  const onPitch = (f) => {
    if (f < 0 || f > 1000) {
      noteEl.classList.add('dim');
      return;
    }
    noteEl.classList.remove('dim');
    const m = freqToMidi(f);
    const target = locked ?? GUITAR_OPEN.reduce((best, s, i) => (Math.abs(m - s) < Math.abs(m - GUITAR_OPEN[best]) ? i : best), 0);
    const cents = (m - GUITAR_OPEN[target]) * 100;
    stringBtns.forEach((b, k) => b.classList.toggle('on', k === target));
    noteEl.textContent = noteFromFreq(f).name;
    freqEl.textContent = `${f.toFixed(1)} Hz · target ${GUITAR_STRING_NAMES[target]} (${midiToFreq(GUITAR_OPEN[target]).toFixed(1)} Hz)`;
    const c = Math.max(-50, Math.min(50, cents));
    needle.style.transform = `rotate(${c * 0.9}deg)`;
    let msg; let cls;
    if (Math.abs(cents) <= 5) { msg = 'In tune ✓'; cls = 'good'; }
    else if (cents < 0) { msg = `Too low by ${Math.round(-cents)} cents — tighten (tune up)`; cls = 'warn'; }
    else { msg = `Too high by ${Math.round(cents)} cents — loosen (tune down)`; cls = 'warn'; }
    status.textContent = msg;
    status.className = `tuner-status ${cls}`;
  };

  const btn = toggleButton({
    startLabel: '🎤 Start tuner',
    stopLabel: '■ Stop tuner',
    onStart: async () => {
      try {
        stop = await listenPitch(onPitch);
        status.textContent = 'Listening… play one string at a time.';
        return true;
      } catch (err) {
        status.textContent = micErrorMessage(err);
        status.className = 'tuner-status bad';
        return false;
      }
    },
    onStop: () => { stop?.(); stop = null; },
  });
  scope.onCleanup(() => stop?.());

  return h('div', { class: 'widget tuner' },
    h('div', { class: 'gauge' }, h('div', { class: 'gauge-scale' }, h('span', {}, '♭'), h('span', {}, '0'), h('span', {}, '♯')), needle),
    noteEl, status, freqEl,
    h('div', { class: 'chips' }, stringBtns),
    h('p', { class: 'muted small' }, 'Tap a string to hear its reference note and lock the tuner to it.'),
    h('div', { class: 'controls' }, btn));
}
