// Plucked-string guitar using the Karplus-Strong algorithm.
import { getCtx, out } from './engine.js';
import { midiToFreq, GUITAR_OPEN } from '../music.js';
import { renderString } from './ks.js';

const cache = new Map();

function stringBuffer(ctx, freq) {
  const key = freq.toFixed(2);
  if (cache.has(key)) return cache.get(key);
  const data = renderString(freq, ctx.sampleRate);
  const buf = ctx.createBuffer(1, data.length, ctx.sampleRate);
  buf.copyToChannel(data, 0);
  cache.set(key, buf);
  return buf;
}

// Last voice per string, so re-plucking a string damps its previous note.
const voices = new Array(6).fill(null);

export function pluck(midi, time, { string = null, gain = 0.5 } = {}) {
  const ctx = getCtx();
  const t = time ?? ctx.currentTime + 0.01;
  if (string != null && voices[string]) {
    const old = voices[string];
    old.g.gain.setTargetAtTime(0, t, 0.015);
    try { old.src.stop(t + 0.2); } catch { /* already stopped */ }
  }
  const src = ctx.createBufferSource();
  src.buffer = stringBuffer(ctx, midiToFreq(midi));
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 4500;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(lp).connect(g).connect(out());
  src.start(t);
  if (string != null) voices[string] = { src, g };
}

const chordNotes = (chord) =>
  chord.frets.map((f, i) => (f < 0 ? null : { string: i, midi: GUITAR_OPEN[i] + f })).filter(Boolean);

// Down strum: low to high. Up strum: high to low, mostly the treble strings.
export function strumChord(chord, time, dir = 'D', { spread = 0.016, gain = 0.32 } = {}) {
  const t = time ?? getCtx().currentTime + 0.02;
  let notes = chordNotes(chord);
  if (dir === 'U') notes = notes.reverse().slice(0, Math.max(3, notes.length - 2));
  notes.forEach((n, k) => pluck(n.midi, t + k * spread, { string: n.string, gain: dir === 'U' ? gain * 0.8 : gain }));
}

export function arpeggio(chord, gap = 0.4) {
  const t = getCtx().currentTime + 0.02;
  chordNotes(chord).forEach((n, k) => pluck(n.midi, t + k * gap, { string: n.string, gain: 0.5 }));
}
