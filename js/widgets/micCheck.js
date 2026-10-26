// Microphone check: measures the room's background noise and how loudly the
// instrument or voice reaches the microphone, then recommends a sensitivity.
import { h } from '../ui/dom.js';
import { toggleButton } from '../ui/controls.js';
import { startListening, listenErrorMessage, SENSITIVITY } from '../audio/listen.js';
import { store } from '../store.js';
import { t } from '../i18n/i18n.js';

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
    return { setting: 'quiet', ok: false, noise, signal, message: 'micCheck.tooQuiet' };
  }
  if (snr < 4) {
    return { setting: 'noisy', ok: false, noise, signal, message: 'micCheck.tooNoisy' };
  }
  if (noise > 0.01) {
    return { setting: 'noisy', ok: true, noise, signal, message: 'micCheck.noisy' };
  }
  if (signal < 0.03) {
    return { setting: 'quiet', ok: true, noise, signal, message: 'micCheck.soft' };
  }
  return { setting: 'normal', ok: true, noise, signal, message: 'micCheck.clear' };
}

export function micCheck(step, scope) {
  const meter = h('div', { class: 'bar-fill level' });
  const phase = h('div', { class: 'ex-status' }, t('micCheck.intro'));
  const result = h('div', { class: 'ex-result', hidden: true });
  const select = h('select', {
    class: 'select', 'aria-label': t('micCheck.sensitivity'),
    onChange: (e) => store.setSetting('micSensitivity', e.target.value),
  }, Object.entries(SENSITIVITY).map(([id, s]) => h('option', { value: id }, t(s.label))));
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
    startLabel: t('micCheck.start'),
    stopLabel: t('ctl.stop'),
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
            const elapsed = (performance.now() - started) / 1000;
            if (elapsed < 0.3) return;  // let the microphone settle
            if (elapsed < QUIET_SECONDS) {
              quiet.push(level);
              phase.textContent = t('micCheck.silent');
            } else if (elapsed < QUIET_SECONDS + PLAY_SECONDS) {
              play.push(level);
              phase.textContent = t('micCheck.play', { n: Math.ceil(QUIET_SECONDS + PLAY_SECONDS - elapsed) });
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
        phase.textContent = t('micCheck.done');
        result.hidden = false;
        result.className = `ex-result ${r.ok ? 'pass' : 'fail'}`;
        result.replaceChildren(
          h('div', { class: 'ex-score' }, r.ok ? t('micCheck.ok') : t('micCheck.attention')),
          h('p', {}, t(r.message)),
          h('p', { class: 'muted small' }, t('micCheck.levels', { noise: db(r.noise), signal: db(r.signal) })),
          h('div', { class: 'controls' },
            h('button', {
              class: 'btn btn-primary',
              onClick: (e) => {
                store.setSetting('micSensitivity', r.setting);
                e.target.textContent = t('micCheck.using', { name: t(SENSITIVITY[r.setting].label) });
                e.target.disabled = true;
              },
            }, t('micCheck.use', { name: t(SENSITIVITY[r.setting].label) }))));
      }, (QUIET_SECONDS + PLAY_SECONDS + 0.4) * 1000);
      return true;
    },
    onStop: () => { finish(); phase.textContent = t('micCheck.stopped'); },
  });

  return h('div', { class: 'widget mic-check' },
    h('div', { class: 'bar level-bar' }, meter),
    phase,
    h('div', { class: 'controls' }, btn, h('label', { class: 'inline' }, t('micCheck.sensitivityLabel'), select)),
    result);
}
