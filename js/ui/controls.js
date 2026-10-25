import { h } from './dom.js';
import { swaraFromOffset } from '../music.js';

export function tempoControl({ value, min = 40, max = 200, onChange }) {
  const label = h('span', { class: 'tempo-value' }, `${value} BPM`);
  const set = (v) => {
    v = Math.max(min, Math.min(max, Math.round(v)));
    input.value = v;
    label.textContent = `${v} BPM`;
    onChange(v);
  };
  const input = h('input', { type: 'range', min, max, value, 'aria-label': 'Tempo', onInput: (e) => set(+e.target.value) });
  return h('div', { class: 'tempo' },
    h('button', { class: 'btn btn-icon', 'aria-label': 'Slower', onClick: () => set(+input.value - 5) }, '−'),
    input,
    h('button', { class: 'btn btn-icon', 'aria-label': 'Faster', onClick: () => set(+input.value + 5) }, '+'),
    label);
}

// Play/stop toggle. onStart may return false (or a promise of false) to cancel.
export function toggleButton({ startLabel = '▶ Play', stopLabel = '■ Stop', onStart, onStop, className = 'btn btn-primary' }) {
  const btn = h('button', { class: className }, startLabel);
  let on = false;
  const set = (value) => {
    on = value;
    btn.textContent = on ? stopLabel : startLabel;
    btn.classList.toggle('active', on);
  };
  btn.addEventListener('click', async () => {
    if (on) {
      set(false);
      onStop();
    } else {
      btn.disabled = true;
      try {
        if ((await onStart()) !== false) set(true);
      } finally {
        btn.disabled = false;
      }
    }
  });
  btn.setOn = set;
  return btn;
}

export function checkbox(label, checked, onChange) {
  return h('label', { class: 'check' },
    h('input', { type: 'checkbox', checked, onChange: (e) => onChange(e.target.checked) }),
    h('span', {}, label));
}

// Renders a swara with traditional marks: komal underlined, tivra ticked,
// dot above for the upper octave and below for the lower octave.
export function swaraLabel(sw) {
  const cls = ['swara'];
  if (sw.komal) cls.push('komal');
  if (sw.tivra) cls.push('tivra');
  if (sw.octave > 0) cls.push('taar');
  if (sw.octave < 0) cls.push('mandra');
  const title = `${sw.komal ? 'komal ' : sw.tivra ? 'tivra ' : ''}${sw.name}${sw.octave > 0 ? ' (upper octave)' : sw.octave < 0 ? ' (lower octave)' : ''}`;
  return h('span', { class: cls.join(' '), title }, sw.name);
}

export const swaraText = (semis) => {
  const sw = swaraFromOffset(semis);
  return `${sw.komal ? 'komal ' : sw.tivra ? 'tivra ' : ''}${sw.name}`;
};
