// Instruments for the Music Studio. Each plays one note at AudioContext time
// `time` for `dur` seconds; all reach the context through getCtx()/out(), so
// they also render offline (see renderOffline in engine.js).
import { getCtx, out, toneHit, noiseHit } from './engine.js';
import { playNote } from './voice.js';
import { pluck } from './guitar.js';
import { midiToFreq } from '../music.js';

// Bansuri-like flute: a soft, breathy tone with gentle vibrato.
function flute(midi, time, dur, gain) {
  const ctx = getCtx();
  const f = midiToFreq(midi);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(gain, time + 0.07);
  g.gain.setValueAtTime(gain, time + Math.max(0.08, dur - 0.06));
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur + 0.12);
  g.connect(out());
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.value = f;
  const o2 = ctx.createOscillator();
  o2.type = 'triangle';
  o2.frequency.value = f * 2;
  const g2 = ctx.createGain();
  g2.gain.value = 0.12;
  // Vibrato that blooms after the attack.
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 5.2;
  const depth = ctx.createGain();
  depth.gain.setValueAtTime(0, time);
  depth.gain.linearRampToValueAtTime(f * 0.006, time + Math.min(0.5, dur));
  lfo.connect(depth);
  depth.connect(o.frequency);
  depth.connect(o2.frequency);
  o.connect(g);
  o2.connect(g2).connect(g);
  for (const osc of [o, o2, lfo]) { osc.start(time); osc.stop(time + dur + 0.2); }
  noiseHit(time, { freq: 2500, q: 0.7, type: 'bandpass', gain: gain * 0.5, attack: 0.01, decay: 0.08 });
}

// Bells: a struck, ringing tone with inharmonic partials.
function bells(midi, time, dur, gain) {
  const f = midiToFreq(midi);
  const ring = Math.max(0.8, dur + 0.6);
  toneHit(time, { freq: f, gain, decay: ring });
  toneHit(time, { freq: f * 2.76, gain: gain * 0.35, decay: ring * 0.4 });
  toneHit(time, { freq: f * 5.4, gain: gain * 0.12, decay: ring * 0.2 });
}

export function playInstrument(kind, midi, time, dur, volume = 1) {
  switch (kind) {
    case 'bansuri': return flute(midi, time, dur, 0.2 * volume);
    case 'sitar': return pluck(midi, time, { gain: 0.5 * volume });
    case 'bells': return bells(midi, time, dur, 0.22 * volume);
    default: return playNote(midi, time, dur, 0.18 * volume);
  }
}
