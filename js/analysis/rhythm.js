// Scores played onsets against a grid of expected strokes.
//
// slots: array of booleans, one per grid position (true = a stroke is expected).
// slotDur: nominal seconds per grid position.
// onsets: onset times in seconds.
//
// The grid is fitted to what was played (start time and tempo), so a
// constant delay from the microphone, or a slightly different tempo, does not
// count against the learner; each stroke is then judged by how far it is from
// its fitted grid position.
import { median } from './notes.js';

function fitLine(pairs) {
  const n = pairs.length;
  const mk = pairs.reduce((s, [k]) => s + k, 0) / n;
  const mt = pairs.reduce((s, [, t]) => s + t, 0) / n;
  let num = 0;
  let den = 0;
  for (const [k, t] of pairs) {
    num += (k - mk) * (t - mt);
    den += (k - mk) ** 2;
  }
  const b = den ? num / den : NaN;
  return { a: mt - b * mk, b };
}

export function alignRhythm(onsets, slots, slotDur) {
  const firstSlot = slots.indexOf(true);
  if (!onsets.length || firstSlot < 0) return { assign: new Map(), a: 0, b: slotDur };
  let a = onsets[0] - firstSlot * slotDur;
  let b = slotDur;
  let assign = new Map();
  for (let iter = 0; iter < 4; iter++) {
    assign = new Map();
    onsets.forEach((t, i) => {
      const k = Math.round((t - a) / b);
      if (k < 0 || k >= slots.length || !slots[k]) return;
      const prev = assign.get(k);
      if (prev === undefined || Math.abs(t - (a + b * k)) < Math.abs(onsets[prev] - (a + b * k))) assign.set(k, i);
    });
    const pairs = [...assign].map(([k, i]) => [k, onsets[i]]);
    const distinct = new Set(pairs.map(([k]) => k)).size;
    if (distinct >= 3) {
      const fit = fitLine(pairs);
      b = Math.min(1.25 * slotDur, Math.max(0.8 * slotDur, fit.b));
      a = median(pairs.map(([k, t]) => t - b * k));
    } else if (pairs.length) {
      a = median(pairs.map(([k, t]) => t - b * k));
    }
  }
  return { assign, a, b };
}

// Returns one result per expected stroke plus the extra (unexpected) onsets.
export function scoreRhythm(onsets, slots, slotDur) {
  const { assign, a, b } = alignRhythm(onsets, slots, slotDur);
  const tolerance = Math.max(0.06, 0.12 * b);
  const results = [];
  slots.forEach((expected, k) => {
    if (!expected) return;
    const i = assign.get(k);
    if (i === undefined) {
      results.push({ slot: k, status: 'missed' });
      return;
    }
    const offset = onsets[i] - (a + b * k);
    const status = Math.abs(offset) <= tolerance ? 'ok' : offset < 0 ? 'early' : 'late';
    results.push({ slot: k, status, offset, onset: i });
  });
  const used = new Set(assign.values());
  const extras = onsets.map((t, i) => i).filter((i) => !used.has(i));
  return { results, extras, slotDur: b, tempoRatio: slotDur / b };
}
