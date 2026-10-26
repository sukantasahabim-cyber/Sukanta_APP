// Synthesised tabla strokes. The dayan is tuned to the learner's Sa.
import { toneHit, noiseHit } from './engine.js';
import { store } from '../store.js';
import { midiToFreq } from '../music.js';

const BAYAN_FREQ = 98;

function dayanFreq() {
  const sa = store.setting('saMidi');
  return midiToFreq(60 + (((sa % 12) + 12) % 12));
}

// Basic strokes. Compound bols (Dha, Dhin) are built from these.
const STROKES = {
  // Na / Ta: ringing stroke on the kinar (rim), rich in harmonics.
  na(t, f, v) {
    toneHit(t, { freq: f, gain: 0.45 * v, decay: 0.7 });
    toneHit(t, { freq: f * 2, gain: 0.22 * v, decay: 0.45 });
    toneHit(t, { freq: f * 3, gain: 0.12 * v, decay: 0.3 });
    toneHit(t, { freq: f * 4, gain: 0.06 * v, decay: 0.2 });
    noiseHit(t, { freq: 4500, q: 0.8, gain: 0.25 * v, decay: 0.02 });
  },
  // Tin: softer, rounder ring on the sur.
  tin(t, f, v) {
    toneHit(t, { freq: f, gain: 0.42 * v, decay: 1.1 });
    toneHit(t, { freq: f * 2, gain: 0.1 * v, decay: 0.5 });
    noiseHit(t, { freq: 2500, q: 1, gain: 0.1 * v, decay: 0.015 });
  },
  // Tu: open, deep tone from the syahi.
  tu(t, f, v) {
    toneHit(t, { freq: f, gain: 0.5 * v, decay: 1.4, attack: 0.006 });
    toneHit(t, { freq: f * 2, gain: 0.06 * v, decay: 0.6 });
    noiseHit(t, { freq: 900, q: 1, gain: 0.12 * v, decay: 0.02 });
  },
  // Ti / Te: closed, dry stroke on the syahi.
  ti(t, f, v) {
    noiseHit(t, { freq: 1800, q: 1.5, gain: 0.6 * v, decay: 0.045 });
    toneHit(t, { freq: f * 1.5, gain: 0.12 * v, decay: 0.06 });
  },
  ra(t, f, v) {
    noiseHit(t, { freq: 2200, q: 1.5, gain: 0.3 * v, decay: 0.04 });
    toneHit(t, { freq: f * 1.6, gain: 0.08 * v, decay: 0.05 });
  },
  // Ge: resonant bass with the characteristic upward glide.
  ge(t, _f, v) {
    toneHit(t, { freq: BAYAN_FREQ * 0.85, bendTo: BAYAN_FREQ * 1.08, bendTime: 0.18, gain: 0.75 * v, decay: 0.9, attack: 0.005 });
    toneHit(t, { freq: BAYAN_FREQ * 2, gain: 0.12 * v, decay: 0.35 });
    noiseHit(t, { freq: 600, q: 1, gain: 0.18 * v, decay: 0.03 });
  },
  // Ke / Ka: flat-hand slap on the bayan, no ring.
  ke(t, _f, v) {
    noiseHit(t, { freq: 350, q: 0.9, gain: 0.85 * v, decay: 0.07 });
    toneHit(t, { freq: 75, gain: 0.2 * v, decay: 0.08 });
  },
};

const BOL_MAP = {
  na: ['na'], ta: ['na'], tin: ['tin'], tu: ['tu'], tun: ['tu'],
  ti: ['ti'], te: ['ti'], ra: ['ra'], re: ['ra'],
  ge: ['ge'], ghe: ['ge'], ga: ['ge'],
  ke: ['ke'], ka: ['ke'], ki: ['ke'], kat: ['ke'],
  dha: ['na', 'ge'], dhin: ['tin', 'ge'], dhi: ['tin', 'ge'],
};

export const isKnownBol = (bol) => bol.toLowerCase() in BOL_MAP;

// The basic strokes a bol is made of (e.g. Dha → Na on the dayan + Ge on the bayan).
export const bolStrokes = (bol) => BOL_MAP[bol.toLowerCase()] || [];

export function playBol(bol, time, velocity = 1) {
  const parts = BOL_MAP[bol.toLowerCase()];
  if (!parts) return;
  const f = dayanFreq();
  parts.forEach((p) => STROKES[p](time, f, velocity));
}

// Hand-counting sounds for learning taal: clap (taali), wave (khali), finger tap.
export function clap(t) {
  noiseHit(t, { freq: 1400, q: 0.7, gain: 0.5, decay: 0.09 });
  noiseHit(t + 0.012, { freq: 1100, q: 0.7, gain: 0.35, decay: 0.07 });
}
export function wave(t) {
  noiseHit(t, { freq: 700, q: 0.4, type: 'lowpass', gain: 0.14, attack: 0.08, decay: 0.25 });
}
export function fingerTap(t) {
  noiseHit(t, { freq: 2500, q: 2, gain: 0.12, decay: 0.02 });
}
