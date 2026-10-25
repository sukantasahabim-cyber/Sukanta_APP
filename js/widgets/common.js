import { h, toast } from '../ui/dom.js';
import { tempoControl, toggleButton } from '../ui/controls.js';
import { Looper } from '../audio/looper.js';
import { click, chime } from '../audio/engine.js';
import { store } from '../store.js';
import { t } from '../i18n/i18n.js';

export const text = (step) => h('div', { class: 'prose', html: step.body });

export const tip = (step) =>
  h('div', { class: 'tip' }, h('span', { class: 'tip-icon', 'aria-hidden': 'true' }, '💡'), h('div', { class: 'prose', html: step.body }));

export function metronome(step, scope) {
  let bpm = step.bpm || 60;
  let beats = step.beats || 4;
  const dotsEl = h('div', { class: 'dots' });
  const drawDots = () => dotsEl.replaceChildren(
    ...Array.from({ length: beats }, (_, i) => h('span', { class: `dot${i === 0 ? ' accent' : ''}` })));
  drawDots();

  const looper = new Looper({
    length: () => beats,
    duration: () => 60 / bpm,
    play: (i, t) => click(t, i === 0),
    onStep: (i) => [...dotsEl.children].forEach((d, k) => d.classList.toggle('on', k === i)),
  });
  scope.onCleanup(() => looper.stop());

  const btn = toggleButton({
    onStart: () => looper.start(),
    onStop: () => { looper.stop(); [...dotsEl.children].forEach((d) => d.classList.remove('on')); },
  });

  const beatSelect = step.selectBeats && h('select', {
    class: 'select', 'aria-label': t('metro.beatsPerBar'),
    onChange: (e) => { beats = +e.target.value; drawDots(); },
  }, [2, 3, 4, 5, 6, 7, 8, 10, 12, 16].map((n) => h('option', { value: n, selected: n === beats }, t('metro.beats', { n }))));

  return h('div', { class: 'widget' },
    dotsEl,
    h('div', { class: 'controls' }, btn, beatSelect),
    tempoControl({ value: bpm, min: 30, max: 240, onChange: (v) => { bpm = v; } }));
}

const fmt = (sec) => {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

// Practice timer with a checklist. Time actually practised is added to today's log.
export function timer(step, scope) {
  let total = (step.minutes || 5) * 60;
  let banked = 0;          // seconds from earlier runs of this session
  let startedAt = null;    // Date.now() while running
  let interval = 0;

  const elapsed = () => banked + (startedAt ? (Date.now() - startedAt) / 1000 : 0);
  const display = h('div', { class: 'timer-display' }, fmt(total));
  const fill = h('div', { class: 'bar-fill' });

  const render = () => {
    display.textContent = fmt(total - elapsed());
    fill.style.width = `${Math.min(100, (elapsed() / total) * 100)}%`;
  };

  const logPractice = () => {
    const sec = elapsed();
    banked = 0;
    startedAt = null;
    if (sec >= 30) {
      const min = Math.max(1, Math.round(sec / 60));
      store.logMinutes(min);
      return min;
    }
    return 0;
  };

  const pause = () => {
    clearInterval(interval);
    if (startedAt) { banked += (Date.now() - startedAt) / 1000; startedAt = null; }
  };

  const btn = toggleButton({
    startLabel: t('timer.start'),
    stopLabel: t('timer.pause'),
    onStart: () => {
      if (elapsed() >= total) banked = 0;
      startedAt = Date.now();
      interval = setInterval(() => {
        render();
        if (elapsed() >= total) {
          pause();
          btn.setOn(false);
          const min = logPractice();
          render();
          chime();
          toast(t('timer.complete', { n: min }));
        }
      }, 250);
    },
    onStop: () => { pause(); render(); },
  });

  const finish = h('button', {
    class: 'btn btn-ghost',
    onClick: () => {
      pause();
      btn.setOn(false);
      const min = logPractice();
      render();
      toast(min ? t('timer.logged', { n: min }) : t('timer.tooShort'));
    },
  }, t('timer.log'));

  scope.onCleanup(() => { pause(); logPractice(); });

  const tasks = (step.tasks || []).map((task) =>
    h('label', { class: 'task' }, h('input', { type: 'checkbox' }), h('span', {}, task)));

  const minuteSelect = step.selectMinutes && h('select', {
    class: 'select', 'aria-label': t('timer.minutes'),
    onChange: (e) => { pause(); btn.setOn(false); logPractice(); total = +e.target.value * 60; render(); },
  }, [5, 10, 15, 20, 30, 45, 60].map((m) => h('option', { value: m, selected: m * 60 === total }, t('unit.min', { n: m }))));

  return h('div', { class: 'widget timer' },
    h('div', { class: 'timer-row' }, display, h('div', { class: 'bar' }, fill)),
    tasks.length ? h('div', { class: 'tasks' }, tasks) : null,
    h('div', { class: 'controls' }, btn, finish, minuteSelect));
}
