// Harmonium-like guide tone and a tanpura drone for singing practice.
import { getCtx, out } from './engine.js';
import { Looper } from './looper.js';
import { midiToFreq } from '../music.js';
import { store } from '../store.js';

export function playNote(midi, time, dur = 0.7, gain = 0.2) {
  const ctx = getCtx();
  const t = time ?? ctx.currentTime + 0.01;
  const f = midiToFreq(midi);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.04);
  g.gain.setValueAtTime(gain, t + Math.max(0.05, dur - 0.08));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.15);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = Math.min(4000, f * 6);
  lp.Q.value = 0.7;
  lp.connect(g).connect(out());
  for (const [type, mult, detune] of [['sawtooth', 1, 0], ['square', 1, 4], ['sawtooth', 2, -3]]) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = f * mult;
    o.detune.value = detune;
    const og = ctx.createGain();
    og.gain.value = mult === 1 ? 0.5 : 0.18;
    o.connect(og).connect(lp);
    o.start(t);
    o.stop(t + dur + 0.25);
  }
}

export const playSwara = (semitone, time, dur) => playNote(store.setting('saMidi') + semitone, time, dur);

const tanpuraWaves = new WeakMap();   // a PeriodicWave belongs to one context
function waveFor(ctx) {
  let tanpuraWave = tanpuraWaves.get(ctx);
  if (!tanpuraWave) {
    // Many strong upper harmonics imitate the buzzing "jawari" bridge.
    const n = 28;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);
    for (let k = 1; k < n; k++) imag[k] = (1 / k) * (k > 5 ? 1.6 : 1) * (k % 2 ? 1 : 0.8);
    tanpuraWave = ctx.createPeriodicWave(real, imag);
    tanpuraWaves.set(ctx, tanpuraWave);
  }
  return tanpuraWave;
}

function tanpuraPluck(midi, t, bus) {
  const ctx = getCtx();
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(3500, t);
  lp.frequency.exponentialRampToValueAtTime(900, t + 3.5);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.14, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);
  lp.connect(g).connect(bus);
  for (const detune of [0, 4]) {
    const o = ctx.createOscillator();
    o.setPeriodicWave(waveFor(ctx));
    o.frequency.value = midiToFreq(midi);
    o.detune.value = detune;
    o.connect(lp);
    o.start(t);
    o.stop(t + 4.6);
  }
}

// Four strings, classic tuning: Pa (lower octave), Sa, Sa, Sa (lower octave).
const TANPURA_STRINGS = [-5, 0, 0, -12];
const TANPURA_GAPS = [1.1, 1.1, 1.1, 1.7];

// A drone from time `from` to `until`, scheduled all at once (for rendering).
export function tanpuraDrone(from, until, saMidi, volume = 0.8) {
  const bus = getCtx().createGain();
  bus.gain.value = volume;
  bus.connect(out());
  for (let t = from, i = 0; t < until; t += TANPURA_GAPS[i % 4], i++) {
    tanpuraPluck(saMidi + TANPURA_STRINGS[i % 4], t, bus);
  }
}

export function createTanpura() {
  let looper = null;
  let bus = null;
  let volume = 0.8;
  return {
    get running() { return Boolean(looper); },
    start() {
      if (looper) return;
      const ctx = getCtx();
      bus = ctx.createGain();
      bus.gain.value = volume;
      bus.connect(out());
      const myBus = bus;
      looper = new Looper({
        length: () => 4,
        duration: (i) => TANPURA_GAPS[i],
        play: (i, t) => tanpuraPluck(store.setting('saMidi') + TANPURA_STRINGS[i], t, myBus),
      });
      looper.start();
    },
    stop() {
      if (!looper) return;
      looper.stop();
      looper = null;
      const ctx = getCtx();
      const old = bus;
      old.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
      setTimeout(() => old.disconnect(), 2000);
      bus = null;
    },
    setVolume(v) {
      volume = v;
      if (bus) bus.gain.setTargetAtTime(v, getCtx().currentTime, 0.05);
    },
  };
}
