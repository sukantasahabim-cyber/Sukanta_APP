// Chord recognition by pitch-class profile ("chroma"): the spectrum of a strum
// is folded into the 12 note names and compared with each chord's profile.
// Chord profiles are made by synthesising the chord and analysing it the same
// way, so string overtones are part of the expected profile.
import { magnitudeSpectrum } from './fft.js';
import { renderString } from '../audio/ks.js';
import { midiToFreq } from '../music.js';

const pc = (midi) => ((Math.round(midi) % 12) + 12) % 12;

function normalise(v) {
  const len = Math.hypot(...v) || 1;
  return v.map((x) => x / len);
}

function chromaFrame(samples, sr, start, maxFreq) {
  const size = sr > 30000 ? 8192 : 4096;
  const mag = magnitudeSpectrum(samples, start, size);
  const c = new Array(12).fill(0);
  const k0 = Math.max(1, Math.ceil((70 * size) / sr));
  const k1 = Math.floor((maxFreq * size) / sr);
  for (let k = k0; k <= k1; k++) {
    if (mag[k] > mag[k - 1] && mag[k] >= mag[k + 1]) {
      c[pc(69 + 12 * Math.log2((k * sr) / size / 440))] += mag[k];
    }
  }
  return c;
}

// Analyses 60–430 ms after the strum: `samples` must reach onset + 0.45 s.
// Returns the full profile plus a bass profile (lowest strings), which tells
// apart chords that share most notes but not their root, like Em and C.
export const STRUM_SECONDS = 0.45;
export function strumChroma(samples, sr, onset = 0) {
  const full = new Array(12).fill(0);
  const bass = new Array(12).fill(0);
  for (const t of [0.06, 0.16, 0.26]) {
    const start = onset + Math.round(t * sr);
    normalise(chromaFrame(samples, sr, start, 1600)).forEach((v, i) => { full[i] += v; });
    normalise(chromaFrame(samples, sr, start, 270)).forEach((v, i) => { bass[i] += v; });
  }
  return { full: normalise(full), bass: normalise(bass) };
}

const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
const BASS_WEIGHT = 0.3;
export const similarity = (a, b) => (1 - BASS_WEIGHT) * dot(a.full, b.full) + BASS_WEIGHT * dot(a.bass, b.bass);

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

const profiles = new Map();
export function chordProfile(midis, sr) {
  const key = `${sr}:${midis.join(',')}`;
  if (!profiles.has(key)) {
    const rand = seeded(7);
    const mix = new Float32Array(Math.round(sr * 0.75));
    midis.forEach((m, k) => {
      const s = renderString(midiToFreq(m), sr, 0.75, rand);
      const off = Math.round(k * 0.016 * sr);
      for (let i = 0; i + off < mix.length; i++) mix[i + off] += 0.3 * s[i];
    });
    profiles.set(key, strumChroma(mix, sr));
  }
  return profiles.get(key);
}

const pitchClasses = (midis) => new Set(midis.map(pc));
// Chords whose notes are a subset of each other (E, E5, E7) are "related":
// confusing them is a small slip, not a different chord.
function related(a, b) {
  const A = pitchClasses(a);
  const B = pitchClasses(b);
  return [...A].every((p) => B.has(p)) || [...B].every((p) => A.has(p));
}

// candidates: [{ name, label, midis }]. Decides whether the strum was the target
// chord and reports the closest chord that was heard.
export function judgeChord(chroma, targetName, candidates, sr) {
  const scored = candidates
    .map((c) => ({ ...c, score: similarity(chroma, chordProfile(c.midis, sr)) }))
    .sort((a, b) => b.score - a.score);
  const target = scored.find((c) => c.name === targetName);
  const rivals = scored.filter((c) => !related(c.midis, target.midis));
  const rival = rivals.length ? rivals[0].score : 0;
  // A small margin: near-ties go the learner's way.
  const ok = target.score >= 0.7 && target.score >= rival - 0.01;
  const heard = ok ? target : scored[0];
  return { ok, heard: heard.label, score: target.score };
}
