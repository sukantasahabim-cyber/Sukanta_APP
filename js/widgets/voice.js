import { h } from '../ui/dom.js';
import { tempoControl, toggleButton, checkbox, swaraLabel } from '../ui/controls.js';
import { Looper } from '../audio/looper.js';
import { getCtx, click, chime } from '../audio/engine.js';
import { playNote, playSwara, createTanpura } from '../audio/voice.js';
import { playBol } from '../audio/tabla.js';
import { listenPitch, micErrorMessage } from '../audio/mic.js';
import { TAALS } from '../data/taals.js';
import { store } from '../store.js';
import { parseSwara, tokenize, freqToMidi, midiName, noteFromFreq, swaraFromOffset } from '../music.js';

const saLabel = () => `Sa = ${midiName(store.setting('saMidi'))}`;

// Small live "Sa = X" label that follows the settings.
function saBadge(scope) {
  const el = h('span', { class: 'badge' }, saLabel());
  scope.onCleanup(store.subscribe(() => { el.textContent = saLabel(); }));
  return el;
}

function tanpuraToggle(scope, { label = '🎶 Tanpura' } = {}) {
  const tanpura = createTanpura();
  scope.onCleanup(() => tanpura.stop());
  return toggleButton({
    startLabel: `${label} on`,
    stopLabel: `${label} off`,
    className: 'btn',
    onStart: () => tanpura.start(),
    onStop: () => tanpura.stop(),
  });
}

export function drone(step, scope) {
  const tanpura = createTanpura();
  scope.onCleanup(() => tanpura.stop());
  return h('div', { class: 'widget drone' },
    h('div', { class: 'drone-head' }, h('span', { class: 'drone-icon', 'aria-hidden': 'true' }, '🪕'), h('div', {}, h('b', {}, 'Tanpura'), h('div', {}, saBadge(scope)))),
    h('div', { class: 'controls' },
      toggleButton({ startLabel: '▶ Start tanpura', stopLabel: '■ Stop tanpura', onStart: () => tanpura.start(), onStop: () => tanpura.stop() })),
    h('label', { class: 'slider' }, 'Volume',
      h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: 0.8, onInput: (e) => tanpura.setVolume(+e.target.value) })),
    h('p', { class: 'muted small' }, 'Change your Sa in "Choose your Sa" or in Progress → Settings.'));
}

const PRESETS = [
  { label: 'Male voice', midi: 49 },
  { label: 'Female voice', midi: 56 },
  { label: 'Child', midi: 60 },
];

export function saPicker(step, scope) {
  const select = h('select', {
    class: 'select', 'aria-label': 'Sa note',
    onChange: (e) => setSa(+e.target.value),
  }, Array.from({ length: 22 }, (_, k) => 43 + k).map((m) => h('option', { value: m }, midiName(m))));

  const presetBtns = PRESETS.map((p) => h('button', { class: 'chip', onClick: () => { setSa(p.midi); hear(); } }, `${p.label} · ${midiName(p.midi)}`));

  const sync = () => {
    const sa = store.setting('saMidi');
    select.value = String(sa);
    presetBtns.forEach((b, i) => b.classList.toggle('on', PRESETS[i].midi === sa));
  };
  const setSa = (m) => store.setSetting('saMidi', m);
  scope.onCleanup(store.subscribe(sync));
  sync();

  const hear = () => playNote(store.setting('saMidi'), getCtx().currentTime + 0.02, 1.4);
  const hearScale = () => {
    const t = getCtx().currentTime + 0.02;
    [0, 2, 4, 5, 7, 9, 11, 12].forEach((s, i) => playSwara(s, t + i * 0.45, 0.4));
  };

  return h('div', { class: 'widget' },
    h('div', { class: 'chips' }, presetBtns),
    h('div', { class: 'controls' },
      h('label', { class: 'inline' }, 'Sa: ', select),
      h('button', { class: 'btn', onClick: hear }, '🔊 Hear Sa'),
      h('button', { class: 'btn btn-ghost', onClick: hearScale }, 'Hear the scale')),
    h('p', { class: 'muted small' }, 'Pick a preset, then sing along. If the high notes strain, choose a lower Sa; if the low notes disappear, choose a higher one.'));
}

export function keyboard(step) {
  const notes = tokenize(step.notes || "S R G M P D N S'").map(parseSwara).filter(Boolean);
  return h('div', { class: 'swara-keys' }, notes.map((sw) => {
    const key = h('button', {
      class: `swara-key${sw.komal || sw.tivra ? ' alt' : ''}`,
      onClick: () => {
        playSwara(sw.semitone, getCtx().currentTime + 0.02, 0.9);
        key.classList.remove('flash');
        void key.offsetWidth;
        key.classList.add('flash');
      },
    }, swaraLabel(sw), h('small', { class: 'key-note' }, midiName(store.setting('saMidi') + sw.semitone)));
    return key;
  }));
}

// Plays a sargam line with a guide tone, optional tanpura and optional tabla theka.
export function sargam(step, scope) {
  const tokens = tokenize(step.notes);
  const parsed = tokens.map((t) => (t === '-' ? null : parseSwara(t)));
  let bpm = step.bpm || 60;
  let guide = true;
  let tablaOn = Boolean(step.tabla);
  let clickOn = false;

  const chips = tokens.map((t, i) => h('span', { class: `note-chip${t === '-' ? ' hold' : ''}` }, parsed[i] ? swaraLabel(parsed[i]) : '–'));
  const groupSize = step.group || 0;
  const rows = [];
  if (groupSize) {
    for (let i = 0; i < chips.length; i += groupSize) rows.push(h('div', { class: 'note-group' }, chips.slice(i, i + groupSize)));
  } else {
    rows.push(h('div', { class: 'note-group' }, chips));
  }

  const looper = new Looper({
    length: () => tokens.length,
    duration: () => 60 / bpm,
    play: (i, t) => {
      const beat = 60 / bpm;
      const sw = parsed[i];
      if (sw && guide) {
        let holds = 1;
        while (tokens[i + holds] === '-') holds++;
        playSwara(sw.semitone, t, holds * beat * 0.92);
      }
      if (tablaOn && step.tabla) {
        const taal = TAALS[step.tabla];
        const subs = taal.bols[i % taal.bols.length];
        subs.forEach((b, k) => playBol(b, t + (k * beat) / subs.length, 0.75));
      } else if (clickOn) {
        click(t, i === 0, 0.5);
      }
    },
    onStep: (i) => chips.forEach((c, k) => c.classList.toggle('on', k === i)),
  });
  scope.onCleanup(() => looper.stop());

  return h('div', { class: 'widget' },
    h('div', { class: 'notes' }, rows),
    h('div', { class: 'controls' },
      toggleButton({ onStart: () => looper.start(), onStop: () => { looper.stop(); chips.forEach((c) => c.classList.remove('on')); } }),
      tanpuraToggle(scope),
      saBadge(scope)),
    h('div', { class: 'controls' },
      checkbox('Guide notes', guide, (v) => { guide = v; }),
      step.tabla
        ? checkbox(`Tabla (${TAALS[step.tabla].name})`, tablaOn, (v) => { tablaOn = v; })
        : checkbox('Beat click', clickOn, (v) => { clickOn = v; })),
    tempoControl({ value: bpm, min: 30, max: 200, onChange: (v) => { bpm = v; } }));
}

// Live pitch monitor for the voice: shows the swara you are singing relative to Sa.
export function voiceMeter(step, scope) {
  let stop = null;
  const swaraEl = h('div', { class: 'tuner-note' }, '–');
  const detail = h('div', { class: 'muted' }, '');
  const needle = h('div', { class: 'needle' });
  const status = h('div', { class: 'tuner-status' }, 'Tap "Start" and sing any note.');

  const onPitch = (f) => {
    if (f < 0 || f > 1500) { swaraEl.classList.add('dim'); return; }
    swaraEl.classList.remove('dim');
    const off = freqToMidi(f) - store.setting('saMidi');
    const sw = swaraFromOffset(off);
    swaraEl.replaceChildren(swaraLabel(sw));
    const note = noteFromFreq(f);
    detail.textContent = `${note.name}${note.octave} · ${f.toFixed(1)} Hz`;
    needle.style.transform = `rotate(${sw.cents * 0.9}deg)`;
    status.textContent = Math.abs(sw.cents) <= 10 ? 'Right in tune ✓' : sw.cents < 0 ? `${-sw.cents} cents low` : `${sw.cents} cents high`;
    status.className = `tuner-status ${Math.abs(sw.cents) <= 10 ? 'good' : 'warn'}`;
  };

  scope.onCleanup(() => stop?.());
  return h('div', { class: 'widget tuner' },
    h('div', { class: 'gauge' }, h('div', { class: 'gauge-scale' }, h('span', {}, 'low'), h('span', {}, '0'), h('span', {}, 'high')), needle),
    swaraEl, detail, status,
    h('div', { class: 'controls' },
      toggleButton({
        startLabel: '🎤 Start',
        stopLabel: '■ Stop',
        onStart: async () => {
          try { stop = await listenPitch(onPitch); return true; } catch (err) {
            status.textContent = micErrorMessage(err);
            status.className = 'tuner-status bad';
            return false;
          }
        },
        onStop: () => { stop?.(); stop = null; },
      }),
      saBadge(scope)));
}

// Guided breathing: inhale, hold, exhale, with an expanding circle.
export function breath(step, scope) {
  const phases = [
    { label: 'Breathe in', secs: step.inhale || 4, scale: 1 },
    { label: 'Hold', secs: step.hold || 4, scale: 1 },
    { label: 'Breathe out — sss…', secs: step.exhale || 8, scale: 0.45 },
  ].filter((p) => p.secs > 0);
  const rounds = step.rounds || 5;
  const circle = h('div', { class: 'breath-circle' });
  const label = h('div', { class: 'breath-label' }, 'Ready');
  const count = h('div', { class: 'breath-count' }, '');
  const roundEl = h('div', { class: 'muted small' }, `${rounds} rounds`);
  let timer = 0;

  const stopBreath = () => {
    clearTimeout(timer);
    circle.style.transitionDuration = '0.6s';
    circle.style.transform = 'scale(0.45)';
    label.textContent = 'Ready';
    count.textContent = '';
  };

  const run = (round, phase, left) => {
    const p = phases[phase];
    if (left === p.secs) {
      label.textContent = p.label;
      circle.style.transitionDuration = `${p.secs}s`;
      circle.style.transform = `scale(${p.scale})`;
      roundEl.textContent = `Round ${round + 1} of ${rounds}`;
    }
    count.textContent = String(left);
    timer = setTimeout(() => {
      if (left > 1) return run(round, phase, left - 1);
      if (phase + 1 < phases.length) return run(round, phase + 1, phases[phase + 1].secs);
      if (round + 1 < rounds) return run(round + 1, 0, phases[0].secs);
      stopBreath();
      label.textContent = 'Well done!';
      btn.setOn(false);
      chime();
    }, 1000);
  };

  const btn = toggleButton({
    startLabel: '▶ Begin',
    onStart: () => run(0, 0, phases[0].secs),
    onStop: stopBreath,
  });
  scope.onCleanup(() => clearTimeout(timer));

  return h('div', { class: 'widget breath' },
    h('div', { class: 'breath-stage' }, circle, h('div', { class: 'breath-text' }, label, count)),
    roundEl,
    h('div', { class: 'controls' }, btn));
}
