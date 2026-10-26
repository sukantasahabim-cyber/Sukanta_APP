// Sing with your own track: play an audio file from this device (it is never
// uploaded), optionally reduce the original vocals, and watch your voice on a
// live pitch line against the swaras of your Sa.
import { h, toast } from '../ui/dom.js';
import { toggleButton, checkbox, swaraLabel } from '../ui/controls.js';
import { t } from '../i18n/i18n.js';
import { getCtx, out } from '../audio/engine.js';
import { startListening, listenErrorMessage, playTake } from '../audio/listen.js';
import { freqToMidi, midiName, parseSwara } from '../music.js';
import { store } from '../store.js';
import { voiceStats } from '../analysis/singalong.js';

const VOICE_RANGE = { minFreq: 70, maxFreq: 1100 };
const WINDOW_SECONDS = 8;
const GRID = ['S', 'r', 'R', 'g', 'G', 'M', 'm', 'P', 'd', 'D', 'n', 'N', "S'"];


export function ownTrackView(scope) {
  let buffer = null;
  let fileName = '';
  let source = null;        // playing AudioBufferSourceNode
  let startedAt = 0;        // ctx time when position 0 would have played
  let offset = 0;           // seconds into the track where playback starts
  let reduceVocals = false;
  let volume = 0.8;
  let scoreOn = true;
  let session = null;
  let heard = [];
  let raf = 0;
  let lastTake = null;
  let stopTake = null;
  let practiceStart = 0;

  const sa = () => store.setting('saMidi');
  const position = () => (source ? getCtx().currentTime - startedAt : offset);

  // ---------- File ----------
  const fileLabel = h('span', { class: 'small muted' }, t('track.none'));
  const fileInput = h('input', {
    type: 'file', accept: 'audio/*', class: 'visually-hidden',
    onChange: async (e) => {
      const file = e.target.files[0];
      e.target.value = '';
      if (!file) return;
      stop();
      fileLabel.textContent = t('track.loading');
      try {
        buffer = await getCtx().decodeAudioData(await file.arrayBuffer());
      } catch {
        buffer = null;
        fileLabel.textContent = t('track.none');
        toast(t('track.badFile'));
        return;
      }
      fileName = file.name;
      offset = 0;
      fileLabel.textContent = `${file.name} · ${fmt(buffer.duration)}`;
      seek.max = String(Math.floor(buffer.duration));
      seek.value = '0';
      lyricsBox.value = store.trackLyrics(fileName);
      playBtn.disabled = false;
      stereoNote.hidden = buffer.numberOfChannels > 1;
      draw();
    },
  });

  // ---------- Audio graph ----------
  const trackGain = getCtx().createGain();
  trackGain.gain.value = volume;
  trackGain.connect(out());

  // Karaoke trick: vocals are usually mixed equally into both channels, so
  // left minus right removes much of them (and keeps the instruments panned aside).
  function connect(src) {
    const ctx = getCtx();
    if (!reduceVocals || buffer.numberOfChannels < 2) { src.connect(trackGain); return; }
    const split = ctx.createChannelSplitter(2);
    const invert = ctx.createGain();
    invert.gain.value = -1;
    const mix = ctx.createGain();
    src.connect(split);
    split.connect(mix, 0);
    split.connect(invert, 1).connect(mix);
    mix.connect(trackGain);
  }

  function playFrom(at) {
    const ctx = getCtx();
    source?.stop();
    source = ctx.createBufferSource();
    source.buffer = buffer;
    connect(source);
    const when = ctx.currentTime + 0.05;
    source.start(when, at);
    startedAt = when - at;
    const mine = source;
    source.onended = () => { if (source === mine && getCtx().currentTime - startedAt >= buffer.duration - 0.2) finish(); };
  }

  async function start() {
    if (!buffer) { toast(t('track.pickFirst')); return false; }
    heard = [];
    result.hidden = true;
    stopTake?.();
    if (scoreOn) {
      try {
        session = await startListening({
          pitchRange: VOICE_RANGE,
          onPitch: (f, time) => heard.push({ t: time - session.latency, off: f < 0 ? null : freqToMidi(f) - sa() }),
        });
      } catch (err) {
        toast(listenErrorMessage(err));
        return false;
      }
    }
    if (offset >= buffer.duration - 0.5) offset = 0;
    playFrom(offset);
    practiceStart = performance.now();
    const frame = () => { draw(); seek.value = String(Math.floor(position())); timeLabel.textContent = `${fmt(position())} / ${fmt(buffer.duration)}`; raf = requestAnimationFrame(frame); };
    raf = requestAnimationFrame(frame);
    return true;
  }

  function stop() {
    cancelAnimationFrame(raf);
    if (source) {
      offset = Math.min(position(), buffer ? buffer.duration : 0);
      const s = source;
      source = null;
      try { s.stop(); } catch { /* already stopped */ }
    }
    if (session) {
      if ((performance.now() - practiceStart) / 1000 > 2) lastTake = session.take();
      session.stop();
      session = null;
    }
    if (practiceStart) store.logSeconds((performance.now() - practiceStart) / 1000);
    practiceStart = 0;
    playBtn.setOn?.(false);
  }

  function finish() {
    const hadMic = Boolean(session);
    stop();
    offset = 0;
    if (hadMic) showResults();
  }

  function showResults() {
    const s = voiceStats(heard);
    result.hidden = false;
    if (!s) {
      result.className = 'ex-result fail';
      result.replaceChildren(h('p', {}, t('sing.noVoice')));
      return;
    }
    result.className = `ex-result ${s.inTune >= 60 ? 'pass' : 'fail'}`;
    result.replaceChildren(
      h('div', { class: 'ex-score' }, t('track.steady', { n: s.inTune })),
      h('p', {}, t('track.range', { low: midiName(sa() + s.low), high: midiName(sa() + s.high), n: s.high - s.low })),
      h('p', {}, s.inTune >= 75 ? t('track.tipGood') : s.inTune >= 50 ? t('track.tipOk') : t('track.tipLow')),
      lastTake && h('button', {
        class: 'btn',
        onClick: (e) => {
          if (stopTake) { stopTake(); return; }
          e.target.textContent = t('ex.stopPlayback');
          stopTake = playTake(lastTake, () => { stopTake = null; e.target.textContent = t('ex.hearAttempt'); });
        },
      }, t('ex.hearAttempt')));
  }

  scope.onCleanup(() => { stopTake?.(); stop(); trackGain.disconnect(); });

  // ---------- Pitch line ----------
  const canvas = h('canvas', { class: 'pitch-roll', role: 'img', 'aria-label': t('track.canvasLabel') });
  const g = canvas.getContext('2d');
  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const hgt = canvas.clientHeight;
    if (!w) return;
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(hgt * dpr); }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, hgt);
    const cs = getComputedStyle(canvas);
    const c = (n) => cs.getPropertyValue(n).trim();
    const left = 34;
    const rowH = hgt / 13.5;
    const y = (semi) => hgt - (semi + 0.75) * rowH;
    g.font = '600 12px system-ui, sans-serif';
    g.textBaseline = 'middle';
    GRID.forEach((tok) => {
      const sw = parseSwara(tok);
      const strong = !sw.komal && !sw.tivra;
      g.fillStyle = c('--surface-2');
      if (strong) g.fillRect(left, y(sw.semitone) - rowH * 0.42, w - left, rowH * 0.84);
      g.fillStyle = strong ? c('--muted') : c('--border');
      g.fillText(swaraLabel(sw).textContent + (sw.octave > 0 ? "'" : ''), 4, y(sw.semitone));
    });
    // The voice, folded into one octave above Sa, over the last few seconds.
    const now = getCtx().currentTime - (getCtx().outputLatency || 0);
    const x = (time) => w - 12 - (now - time) * ((w - left - 12) / WINDOW_SECONDS);
    g.lineWidth = 2.5;
    g.lineCap = 'round';
    let prev = null;
    for (let i = Math.max(0, heard.length - 600); i < heard.length; i++) {
      const f = heard[i];
      const px = x(f.t);
      if (f.off == null || px < left) { prev = null; continue; }
      const folded = ((f.off % 12) + 12) % 12;
      const near = Math.abs(folded - Math.round(folded)) * 100 <= 25;
      const py = y(folded > 11.5 ? folded - 12 : folded);
      if (prev && f.t - prev.t < 0.12 && Math.abs(py - prev.py) < rowH * 3) {
        g.strokeStyle = near ? c('--good') : c('--text');
        g.beginPath();
        g.moveTo(prev.px, prev.py);
        g.lineTo(px, py);
        g.stroke();
      }
      prev = { t: f.t, px, py };
    }
  }

  // ---------- Controls ----------
  const playBtn = toggleButton({ onStart: start, onStop: () => { const hadMic = Boolean(session); stop(); if (hadMic) showResults(); } });
  playBtn.disabled = true;
  const timeLabel = h('span', { class: 'small muted' }, '0:00');
  const seek = h('input', {
    type: 'range', class: 'seek', min: 0, max: 0, value: 0, step: 1, 'aria-label': t('track.position'),
    onInput: (e) => { offset = Number(e.target.value); if (source) playFrom(offset); timeLabel.textContent = fmt(offset); },
  });
  const keyLabel = h('span', { class: 'badge' }, t('sa.badge', { note: midiName(sa()) }));
  const setKey = (d) => {
    const v = Math.max(43, Math.min(72, sa() + d));
    store.setSetting('saMidi', v);
    keyLabel.textContent = t('sa.badge', { note: midiName(v) });
  };
  const stereoNote = h('p', { class: 'small muted', hidden: true }, t('track.mono'));
  const lyricsBox = h('textarea', {
    class: 'input lyrics-paste', rows: 6, placeholder: t('track.lyricsHint'), 'aria-label': t('track.lyrics'),
    onInput: (e) => { if (fileName) store.setTrackLyrics(fileName, e.target.value); },
  });
  const result = h('div', { class: 'ex-result', hidden: true });

  return h('div', { class: 'container c-singing' },
    h('a', { class: 'back', href: '#/sing' }, t('sing.backToSongs')),
    h('h1', {}, `🎧 ${t('track.title')}`),
    h('p', { class: 'muted' }, t('track.intro')),
    h('p', { class: 'small privacy-note' }, `🔒 ${t('track.private')}`),
    h('div', { class: 'step-card' },
      h('div', { class: 'controls' },
        h('label', { class: 'btn btn-primary' }, `📂 ${t('track.choose')}`, fileInput),
        fileLabel),
      canvas,
      h('div', { class: 'roll-legend small muted' },
        h('span', {}, h('i', { class: 'dot hit' }), t('track.legendSteady')),
        h('span', {}, h('i', { class: 'dot you' }), t('sing.legendYou'))),
      h('div', { class: 'controls' }, playBtn, timeLabel),
      seek,
      h('div', { class: 'controls' },
        checkbox(t('sing.score'), scoreOn, (v) => { scoreOn = v; }),
        checkbox(t('track.reduceVocals'), reduceVocals, (v) => { reduceVocals = v; if (source) playFrom(position()); })),
      stereoNote,
      h('label', { class: 'field' }, h('span', { class: 'small' }, t('track.volume')),
        h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: volume, onInput: (e) => { volume = Number(e.target.value); trackGain.gain.setTargetAtTime(volume, getCtx().currentTime, 0.05); } })),
      h('div', { class: 'controls' },
        h('span', { class: 'small' }, t('sing.key')),
        h('button', { class: 'btn btn-sm', 'aria-label': t('sing.keyDown'), onClick: () => setKey(-1) }, '−'),
        keyLabel,
        h('button', { class: 'btn btn-sm', 'aria-label': t('sing.keyUp'), onClick: () => setKey(1) }, '+'),
        h('span', { class: 'small muted' }, t('track.keyHint'))),
      h('p', { class: 'small muted' }, `🎧 ${t('track.headphones')}`),
      result),
    h('div', { class: 'step-card' },
      h('h2', {}, t('sing.lyrics')),
      h('p', { class: 'small muted' }, t('track.lyricsNote')),
      lyricsBox));
}

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
