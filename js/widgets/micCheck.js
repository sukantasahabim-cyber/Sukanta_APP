// Microphone check: measures the room's background noise and how loudly the
// instrument or voice reaches the microphone, then recommends a sensitivity.
import { h } from '../ui/dom.js';
import { toggleButton } from '../ui/controls.js';
import { startListening, listenErrorMessage, SENSITIVITY } from '../audio/listen.js';
import { store } from '../store.js';

const QUIET_SECONDS = 2;
const PLAY_SECONDS = 4;

const rmsOf = (chunk) => Math.sqrt(chunk.reduce((s, v) => s + v * v, 0) / chunk.length);
const db = (x) => Math.round(20 * Math.log10(Math.max(x, 1e-6)));
const percentile = (arr, p) => {
  const s = [...arr].sort((a, b) => a - b);
  return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : 0;
};

// Pure, so it can be unit tested: levels are RMS values of short chunks.
export function recommendSensitivity(quietLevels, playLevels) {
  const noise = percentile(quietLevels, 0.5);
  const signal = percentile(playLevels, 0.9);
  const snr = signal / Math.max(noise, 1e-6);
  if (signal < 0.008) {
    return { setting: 'quiet', ok: false, noise, signal, message: 'We can hardly hear you. Move the phone or laptop closer, or play louder. Quiet-room sensitivity will help.' };
  }
  if (snr < 4) {
    return { setting: 'noisy', ok: false, noise, signal, message: 'The room is almost as loud as your playing. Find a quieter place, switch off fans or TV, or move the microphone closer.' };
  }
  if (noise > 0.01) {
    return { setting: 'noisy', ok: true, noise, signal, message: 'We can hear you, but the room is a little noisy. Noisy-room sensitivity will ignore the background.' };
  }
  if (signal < 0.03) {
    return { setting: 'quiet', ok: true, noise, signal, message: 'We can hear you, a bit softly. Quiet-room sensitivity will catch soft strokes and notes.' };
  }
  return { setting: 'normal', ok: true, noise, signal, message: 'We can hear you clearly. You are ready for practical mode!' };
}

export function micCheck(step, scope) {
  const meter = h('div', { class: 'bar-fill level' });
  const phase = h('div', { class: 'ex-status' }, 'Press "Check microphone". Stay silent for 2 seconds, then play or sing for 4 seconds.');
  const result = h('div', { class: 'ex-result', hidden: true });
  const select = h('select', {
    class: 'select', 'aria-label': 'Microphone sensitivity',
    onChange: (e) => store.setSetting('micSensitivity', e.target.value),
  }, Object.entries(SENSITIVITY).map(([id, s]) => h('option', { value: id }, s.label)));
  const sync = () => { select.value = store.setting('micSensitivity') || 'normal'; };
  sync();
  scope.onCleanup(store.subscribe(sync));

  let session = null;
  let timer = 0;
  const finish = () => {
    clearTimeout(timer);
    session?.stop();
    session = null;
    meter.style.width = '0%';
  };
  scope.onCleanup(finish);

  const btn = toggleButton({
    startLabel: '🎙️ Check microphone',
    stopLabel: '■ Stop',
    onStart: async () => {
      const quiet = [];
      const play = [];
      let started = null;
      result.hidden = true;
      try {
        session = await startListening({
          onSamples: (chunk) => {
            const level = rmsOf(chunk);
            meter.style.width = `${Math.min(100, Math.max(0, (db(level) + 60) / 60) * 100)}%`;
            started ??= performance.now();
            const t = (performance.now() - started) / 1000;
            if (t < 0.3) return;  // let the microphone settle
            if (t < QUIET_SECONDS) {
              quiet.push(level);
              phase.textContent = '🤫 Stay silent…';
            } else if (t < QUIET_SECONDS + PLAY_SECONDS) {
              play.push(level);
              phase.textContent = `🎵 Now play or sing… ${Math.ceil(QUIET_SECONDS + PLAY_SECONDS - t)}`;
            }
          },
        });
      } catch (err) {
        phase.textContent = listenErrorMessage(err);
        phase.className = 'ex-status bad';
        return false;
      }
      phase.className = 'ex-status';
      timer = setTimeout(() => {
        finish();
        btn.setOn(false);
        const r = recommendSensitivity(quiet, play);
        phase.textContent = 'Done.';
        result.hidden = false;
        result.className = `ex-result ${r.ok ? 'pass' : 'fail'}`;
        result.replaceChildren(
          h('div', { class: 'ex-score' }, r.ok ? '✓ Microphone OK' : '⚠️ Needs attention'),
          h('p', {}, r.message),
          h('p', { class: 'muted small' }, `Background ${db(r.noise)} dB · your sound ${db(r.signal)} dB`),
          h('div', { class: 'controls' },
            h('button', {
              class: 'btn btn-primary',
              onClick: (e) => {
                store.setSetting('micSensitivity', r.setting);
                e.target.textContent = `✓ Using "${SENSITIVITY[r.setting].label}"`;
                e.target.disabled = true;
              },
            }, `Use "${SENSITIVITY[r.setting].label}"`)));
      }, (QUIET_SECONDS + PLAY_SECONDS + 0.4) * 1000);
      return true;
    },
    onStop: () => { finish(); phase.textContent = 'Stopped.'; },
  });

  return h('div', { class: 'widget mic-check' },
    h('div', { class: 'bar level-bar' }, meter),
    phase,
    h('div', { class: 'controls' }, btn, h('label', { class: 'inline' }, 'Sensitivity: ', select)),
    result);
}
