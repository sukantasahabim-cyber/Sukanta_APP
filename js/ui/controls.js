import { h } from './dom.js';
import { swaraFromOffset } from '../music.js';
import { t } from '../i18n/i18n.js';
import { swaraName } from '../i18n/names.js';
import { notation, noteName } from '../i18n/notation.js';

export function tempoControl({ value, min = 40, max = 200, onChange }) {
  const label = h('span', { class: 'tempo-value' }, t('ctl.bpm', { n: value }));
  const set = (v) => {
    v = Math.max(min, Math.min(max, Math.round(v)));
    input.value = v;
    label.textContent = t('ctl.bpm', { n: v });
    onChange(v);
  };
  const input = h('input', { type: 'range', min, max, value, 'aria-label': t('ctl.tempo'), onInput: (e) => set(+e.target.value) });
  return h('div', { class: 'tempo' },
    h('button', { class: 'btn btn-icon', 'aria-label': t('ctl.slower'), onClick: () => set(+input.value - 5) }, '−'),
    input,
    h('button', { class: 'btn btn-icon', 'aria-label': t('ctl.faster'), onClick: () => set(+input.value + 5) }, '+'),
    label);
}

// Play/stop toggle. onStart may return false (or a promise of false) to cancel.
export function toggleButton({ startLabel = t('ctl.play'), stopLabel = t('ctl.stop'), onStart, onStop, className = 'btn btn-primary' }) {
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
// In Do Re Mi or letter names the flat and sharp notes have names of their
// own, so only sargam marks them.
export function swaraLabel(sw) {
  const sargam = notation() === 'sargam';
  const cls = ['swara'];
  if (sargam && sw.komal) cls.push('komal');
  if (sargam && sw.tivra) cls.push('tivra');
  if (sw.octave > 0) cls.push('taar');
  if (sw.octave < 0) cls.push('mandra');
  const octave = sw.octave > 0 ? t('swara.upper') : sw.octave < 0 ? t('swara.lower') : '';
  return h('span', { class: cls.join(' '), title: `${swaraWord(sw)}${octave ? ` (${octave})` : ''}` }, noteName(sw, swaraName));
}

// "komal Re", "tivra Ma", "Ga" — or "Ra", "Fi", "Mi" / "D♭", "F♯", "E".
export const swaraWord = (sw) => {
  if (notation() !== 'sargam') return noteName(sw, swaraName);
  const name = swaraName(sw.name);
  return sw.komal ? t('swara.komal', { name }) : sw.tivra ? t('swara.tivra', { name }) : name;
};

export const swaraText = (semis) => swaraWord(swaraFromOffset(semis));
