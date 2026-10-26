import { h } from '../ui/dom.js';
import { tempoControl, toggleButton, checkbox } from '../ui/controls.js';
import { Looper } from '../audio/looper.js';
import { getCtx, click } from '../audio/engine.js';
import { playBol, clap, wave, fingerTap } from '../audio/tabla.js';
import { TAALS, vibhagOf } from '../data/taals.js';
import { tokenize } from '../music.js';
import { t } from '../i18n/i18n.js';
import { bolName, taalName } from '../i18n/names.js';

const flash = (el) => {
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
};

export function bols(step) {
  return h('div', { class: 'bol-grid' }, step.bols.map((b) => {
    const card = h('div', { class: 'bol-card' },
      h('div', { class: 'bol-head' },
        h('span', { class: 'bol-name' }, bolName(b.bol)),
        b.hand && h('span', { class: 'bol-hand' }, b.hand)),
      b.how && h('p', { class: 'bol-how' }, b.how),
      h('button', {
        class: 'btn btn-sm',
        onClick: () => { playBol(b.bol, getCtx().currentTime + 0.02); flash(card); },
      }, t('common.hearIt')));
    return card;
  }));
}

const SPEED_KEYS = { 1: 'laya.thah', 2: 'laya.dugun', 4: 'laya.chaugun' };

// A looping bol phrase, optionally switchable between layakari speeds.
export function sequence(step, scope) {
  const strokes = tokenize(step.bols);
  let bpm = step.bpm || 60;
  let perBeat = step.perBeat || (step.speeds ? step.speeds[0] : 1);
  let clickOn = step.click ?? true;

  const chips = strokes.map((s) => h('span', { class: `stroke${s === '-' ? ' rest' : ''}` }, bolName(s)));
  const groupSize = step.group || 4;
  const groups = [];
  for (let i = 0; i < chips.length; i += groupSize) {
    groups.push(h('div', { class: 'stroke-group' }, chips.slice(i, i + groupSize)));
  }

  const looper = new Looper({
    length: () => strokes.length,
    duration: () => 60 / bpm / perBeat,
    play: (i, t) => {
      if (strokes[i] !== '-') playBol(strokes[i], t);
      if (clickOn && i % perBeat === 0) click(t, i === 0, 0.6);
    },
    onStep: (i) => chips.forEach((c, k) => c.classList.toggle('on', k === i)),
  });
  scope.onCleanup(() => looper.stop());

  const btn = toggleButton({
    onStart: () => looper.start(),
    onStop: () => { looper.stop(); chips.forEach((c) => c.classList.remove('on')); },
  });

  const speedButtons = step.speeds && h('div', { class: 'segmented', role: 'group', 'aria-label': t('laya.speed') },
    step.speeds.map((s) => h('button', {
      class: `seg${s === perBeat ? ' on' : ''}`,
      onClick: (e) => {
        perBeat = s;
        [...e.target.parentNode.children].forEach((b) => b.classList.toggle('on', b === e.target));
      },
    }, SPEED_KEYS[s] ? t(SPEED_KEYS[s]) : `${s}×`)));

  return h('div', { class: 'widget' },
    h('div', { class: 'strokes' }, groups),
    speedButtons,
    h('div', { class: 'controls' }, btn, checkbox(t('common.beatClick'), clickOn, (v) => { clickOn = v; })),
    tempoControl({ value: bpm, onChange: (v) => { bpm = v; } }));
}

// Taal player: shows the theka grid and plays it on tabla, or counts it with hand sounds.
export function theka(step, scope) {
  let taalId = step.taal;
  let bpm = step.bpm || TAALS[taalId].bpm;
  let mode = step.mode || 'tabla';
  let events = [];
  let beatEls = [];

  const grid = h('div', { class: 'taal-grid' });
  const info = h('p', { class: 'muted small' });

  function build() {
    const taal = TAALS[taalId];
    events = taal.bols.flatMap((subs, beat) => subs.map((bol, sub) => ({ beat, sub, n: subs.length, bol })));
    beatEls = [];
    const vibhagEls = [];
    let start = 0;
    taal.vibhags.forEach((size, v) => {
      const mark = taal.marks[v];
      const beats = [];
      for (let b = start; b < start + size; b++) {
        const el = h('div', { class: 'beat' },
          h('span', { class: 'beat-num' }, b + 1),
          h('span', { class: 'beat-bol' }, taal.bols[b].map(bolName).join('')),
          b === start && h('span', { class: 'beat-hand', title: mark === '0' ? t('taal.wave') : t('taal.clap') }, mark === '0' ? '👋' : '👏'));
        beatEls.push(el);
        beats.push(el);
      }
      vibhagEls.push(h('div', { class: `vibhag${mark === '0' ? ' khali' : ''}` },
        h('span', { class: 'vibhag-mark' }, mark), h('div', { class: 'vibhag-beats' }, beats)));
      start += size;
    });
    grid.replaceChildren(...vibhagEls);
    info.textContent = t('taal.info', { name: taalName(taalId, taal.name), n: taal.matras, parts: taal.vibhags.join(' + '), use: taal.use });
  }
  build();

  const looper = new Looper({
    length: () => events.length,
    duration: (i) => 60 / bpm / events[i].n,
    play: (i, t) => {
      const e = events[i];
      if (mode === 'tabla') {
        if (e.bol !== '-') playBol(e.bol, t);
      } else if (e.sub === 0) {
        const v = vibhagOf(TAALS[taalId], e.beat);
        if (!v.first) fingerTap(t);
        else if (v.mark === '0') wave(t);
        else clap(t);
      }
    },
    onStep: (i) => {
      const e = events[i];
      if (e && e.sub === 0) beatEls.forEach((el, k) => el.classList.toggle('on', k === e.beat));
    },
  });
  scope.onCleanup(() => looper.stop());

  const btn = toggleButton({
    onStart: () => looper.start(),
    onStop: () => { looper.stop(); beatEls.forEach((el) => el.classList.remove('on')); },
  });

  const restart = () => {
    const wasRunning = looper.running;
    looper.stop();
    build();
    if (wasRunning) looper.start();
  };

  const taalSelect = step.choose && h('select', {
    class: 'select', 'aria-label': t('taal.taal'),
    onChange: (e) => { taalId = e.target.value; restart(); },
  }, Object.entries(TAALS).map(([id, taal]) => h('option', { value: id, selected: id === taalId }, `${taalName(id, taal.name)} (${taal.matras})`)));

  const modeSwitch = h('div', { class: 'segmented', role: 'group', 'aria-label': t('taal.sound') },
    [['tabla', t('taal.modeTabla')], ['hands', t('taal.modeHands')]].map(([id, label]) => h('button', {
      class: `seg${id === mode ? ' on' : ''}`,
      onClick: (e) => {
        mode = id;
        [...e.target.parentNode.children].forEach((b) => b.classList.toggle('on', b === e.target));
      },
    }, label)));

  return h('div', { class: 'widget' },
    taalSelect, grid, info, modeSwitch,
    h('div', { class: 'controls' }, btn),
    tempoControl({ value: bpm, min: 30, max: 240, onChange: (v) => { bpm = v; } }));
}
