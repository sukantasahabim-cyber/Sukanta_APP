// Lehra player: a looping harmonium melody (one taal cycle) with optional
// tabla theka, the backdrop for practising solos and compositions.
import { h } from '../ui/dom.js';
import { tempoControl, toggleButton, checkbox, swaraLabel } from '../ui/controls.js';
import { Looper } from '../audio/looper.js';
import { playSwara } from '../audio/voice.js';
import { playBol } from '../audio/tabla.js';
import { TAALS, vibhagOf } from '../data/taals.js';
import { LEHRAS } from '../data/lehras.js';
import { parseSwara } from '../music.js';
import { t } from '../i18n/i18n.js';
import { taalName } from '../i18n/names.js';

export function lehra(step, scope) {
  let taalId = step.taal && LEHRAS[step.taal] ? step.taal : 'teentaal';
  let bpm = step.bpm || LEHRAS[taalId].bpm;
  let melodyOn = true;
  let tablaOn = true;
  let events = [];
  let beatEls = [];

  const grid = h('div', { class: 'lehra-grid' });
  const info = h('p', { class: 'muted small' });

  function build() {
    const taal = TAALS[taalId];
    const { beats, raag } = LEHRAS[taalId];
    events = beats.flatMap((notes, beat) => notes.map((note, sub) => ({ beat, sub, n: notes.length, note })));
    beatEls = beats.map((notes, b) => {
      const v = vibhagOf(taal, b);
      return h('div', { class: `lehra-beat${v.first ? ' vibhag-start' : ''}${v.mark === '0' ? ' khali' : ''}` },
        h('span', { class: 'beat-num' }, v.first ? `${b + 1} · ${v.mark}` : b + 1),
        h('span', { class: 'lehra-notes' }, notes.map((n) => (n === '-' ? h('span', { class: 'muted' }, '–') : swaraLabel(parseSwara(n))))));
    });
    grid.replaceChildren(...beatEls);
    info.textContent = t('lehra.info', { raag: t(`raag.${raag}`), taal: taalName(taalId, taal.name), n: taal.matras });
  }
  build();

  // How long a note sounds: until the next event that is not a hold.
  const noteLength = (i) => {
    let dur = 0;
    let k = i;
    do { dur += 60 / bpm / events[k].n; k = (k + 1) % events.length; } while (k !== i && events[k].note === '-');
    return dur;
  };

  const looper = new Looper({
    length: () => events.length,
    duration: (i) => 60 / bpm / events[i].n,
    play: (i, time) => {
      const e = events[i];
      if (melodyOn && e.note !== '-') playSwara(parseSwara(e.note).semitone, time, noteLength(i) * 0.95);
      if (tablaOn && e.sub === 0) {
        const bols = TAALS[taalId].bols[e.beat];
        bols.forEach((b, k) => { if (b !== '-') playBol(b, time + (k * 60) / bpm / bols.length, 0.8); });
      }
    },
    onStep: (i) => {
      const e = events[i];
      if (e && e.sub === 0) beatEls.forEach((el, k) => el.classList.toggle('on', k === e.beat));
    },
  });
  scope.onCleanup(() => looper.stop());

  const restart = () => {
    const was = looper.running;
    looper.stop();
    build();
    if (was) looper.start();
  };

  const select = step.choose !== false && h('select', {
    class: 'select', 'aria-label': t('taal.taal'),
    onChange: (e) => { taalId = e.target.value; restart(); },
  }, Object.keys(LEHRAS).map((id) => h('option', { value: id, selected: id === taalId }, `${taalName(id, TAALS[id].name)} (${TAALS[id].matras})`)));

  return h('div', { class: 'widget' },
    select, info, grid,
    h('div', { class: 'controls' },
      toggleButton({ onStart: () => looper.start(), onStop: () => { looper.stop(); beatEls.forEach((el) => el.classList.remove('on')); } }),
      checkbox(t('lehra.melody'), melodyOn, (v) => { melodyOn = v; }),
      checkbox(t('lehra.tabla'), tablaOn, (v) => { tablaOn = v; })),
    tempoControl({ value: bpm, min: 30, max: 200, onChange: (v) => { bpm = v; } }));
}
