// "Table Tabla": turns hits on any surface (a table, a box, the lap) into
// tabla strokes, for learners who have no tabla yet. One microphone cannot
// tell where a hit landed, but it can hear what kind of hit it was: a sharp
// fingertip tap (right hand → dayan), a deep palm thump (left hand → bayan)
// or both at once (Dha, Dhin). The learner teaches the app their own three
// hits once; every new hit is matched to the nearest of them.
import { magnitudeSpectrum, pow2 } from './fft.js';
import { FAMILY_OF } from './strokes.js';

export const HANDS = ['right', 'left', 'both'];

// Which hand(s) play each bol.
const HAND_OF_FAMILY = { both: 'both', bayan: 'left', slap: 'left', dayan: 'right', closed: 'right' };
export const handOf = (bol) => HAND_OF_FAMILY[FAMILY_OF[bol.toLowerCase()]] || null;

// Seconds of sound before and after the start of a hit that describe it.
export const HIT_BEFORE = 0.003;
export const HIT_AFTER = 0.024;
export const hitSize = (sr) => pow2(sr * (HIT_BEFORE + HIT_AFTER));

const BANDS = { low: [40, 300], mid: [300, 2000], high: [2000, 9000] };

// Describes one hit from `samples`, which start HIT_BEFORE seconds before it.
// The shape (how much bass, how much treble, where the sound's centre lies)
// does not depend on how hard the hit was; `level` does.
export function hitFeatures(samples, sr) {
  const size = hitSize(sr);
  const mag = magnitudeSpectrum(samples, 0, size);
  const energy = { low: 0, mid: 0, high: 0 };
  let num = 0;
  let den = 0;
  for (let k = 1; k < mag.length; k++) {
    const f = (k * sr) / size;
    const e = mag[k] * mag[k];
    for (const [band, [lo, hi]] of Object.entries(BANDS)) if (f >= lo && f < hi) energy[band] += e;
    if (f >= BANDS.low[0] && f < BANDS.high[1]) { num += f * e; den += e; }
  }
  const total = energy.low + energy.mid + energy.high || 1e-12;
  let sum = 0;
  for (let i = 0; i < size; i++) sum += (samples[i] ?? 0) ** 2;
  return {
    vector: [
      Math.log10(energy.low / total + 1e-3),
      Math.log10(energy.high / total + 1e-3),
      Math.log10(Math.max(50, den ? num / den : 50)),
    ],
    level: Math.sqrt(sum / size),
  };
}

// Smallest spread allowed per feature, so a few very similar examples do not
// make a class impossibly narrow.
const MIN_SPREAD = [0.12, 0.12, 0.04];

// Starting points before the learner teaches their own hits: a bright
// fingertip tap, a deep palm thump, and the two together.
export const DEFAULT_EXAMPLES = {
  right: [[-1.95, -0.05, 3.5]],
  left: [[-0.02, -2.9, 2.05]],
  both: [[-0.06, -1.0, 2.65]],
};

const mean = (rows, j) => rows.reduce((a, r) => a + r[j], 0) / rows.length;

// Nearest-centre matching, with each feature scaled by how much the
// learner's own examples vary.
export class HitClassifier {
  constructor(examples = DEFAULT_EXAMPLES) {
    this.centres = {};
    const spreads = [0, 0, 0];
    let n = 0;
    for (const hand of HANDS) {
      const rows = examples[hand]?.length ? examples[hand] : DEFAULT_EXAMPLES[hand];
      const c = [0, 1, 2].map((j) => mean(rows, j));
      this.centres[hand] = c;
      for (const r of rows) { for (let j = 0; j < 3; j++) spreads[j] += (r[j] - c[j]) ** 2; n++; }
    }
    this.spread = spreads.map((s, j) => Math.max(MIN_SPREAD[j], Math.sqrt(s / Math.max(1, n - HANDS.length))));
  }

  distance(vector, hand) {
    return this.centres[hand].reduce((a, c, j) => a + ((vector[j] - c) / this.spread[j]) ** 2, 0);
  }

  // The hand(s) the hit sounds like, and how sure that is (the gap to the
  // next-best answer; above about 1 is clear).
  classify(vector) {
    const ranked = HANDS.map((hand) => ({ hand, d: this.distance(vector, hand) })).sort((a, b) => a.d - b.d);
    return { hand: ranked[0].hand, margin: Math.sqrt(ranked[1].d) - Math.sqrt(ranked[0].d) };
  }
}

// How well the learner's examples can be told apart: each example is
// classified by a classifier trained on all the others. 1 means perfectly.
export function checkExamples(examples) {
  let right = 0;
  let total = 0;
  for (const hand of HANDS) {
    examples[hand].forEach((vector, i) => {
      const others = { ...examples, [hand]: examples[hand].filter((_, k) => k !== i) };
      if (new HitClassifier(others).classify(vector).hand === hand) right++;
      total++;
    });
  }
  return total ? right / total : 0;
}

// Finds hits as they happen. It watches two things in short frames: plain
// energy, because a palm thump on a table is mostly bass, and the energy of
// the signal's changes (a cheap high-pass), which catches a light fingertip
// tap even while the previous thump is still booming. A hit is a sudden jump
// in either, well above the background. Short frames keep the delay low.
class Rise {
  constructor({ rise, floorRatio, minEnergy }) {
    Object.assign(this, { rise, floorRatio, minEnergy });
    this.history = [];
    this.floor = null;
  }

  // Compared with the frames before the last two, so a hit that builds up over
  // a few milliseconds still counts as sudden.
  jumped(e) {
    const h = this.history;
    const before = h.slice(0, Math.max(1, h.length - 2));
    const recent = h.length ? before.reduce((a, b) => a + b, 0) / before.length : e;
    if (this.floor === null) this.floor = e;
    this.floor = e < this.floor ? 0.8 * this.floor + 0.2 * e : 0.999 * this.floor + 0.001 * e;
    h.push(e);
    if (h.length > 10) h.shift();
    return e > this.minEnergy && e > this.rise * recent && e > this.floorRatio * this.floor;
  }
}

export class HitDetector {
  constructor(sampleRate, { frame = 128, rise = 4, floorRatio = 12, minEnergy = 1e-6, minGap = 0.07 } = {}) {
    this.frame = frame;
    this.minGapFrames = Math.max(1, Math.round((minGap * sampleRate) / frame));
    this.plain = new Rise({ rise, floorRatio, minEnergy });
    this.sharp = new Rise({ rise: rise * 0.75, floorRatio, minEnergy: minEnergy / 4 });
    this.pos = 0;
    this.prev = 0;
    this.acc = 0;
    this.accSharp = 0;
    this.count = 0;
    this.sinceLast = Infinity;
  }

  // Feed samples; returns the absolute sample indices of new hits.
  push(chunk) {
    const hits = [];
    for (let i = 0; i < chunk.length; i++) {
      const d = chunk[i] - this.prev;
      this.prev = chunk[i];
      this.acc += chunk[i] * chunk[i];
      this.accSharp += d * d;
      if (++this.count === this.frame) {
        const plain = this.plain.jumped(this.acc / this.frame);
        const sharp = this.sharp.jumped(this.accSharp / this.frame);
        this.sinceLast++;
        if ((plain || sharp) && this.sinceLast >= this.minGapFrames) {
          this.sinceLast = 0;
          hits.push(this.pos + i + 1 - this.frame);
        }
        this.acc = 0;
        this.accSharp = 0;
        this.count = 0;
      }
    }
    this.pos += chunk.length;
    return hits;
  }
}

// The strokes of a taal's theka in playing order, with when each falls (in
// beats from sam). A matra holding several bols shares its beat equally;
// "-" holds the previous sound and is not played.
export function thekaStrokes(taal) {
  const strokes = [];
  taal.bols.forEach((matra, m) => {
    matra.forEach((bol, k) => {
      if (bol !== '-') strokes.push({ bol, matra: m, sub: k, beat: m + k / matra.length });
    });
  });
  return strokes;
}

// The strokes of a practical exercise ("Dha Dha Ti Ta", `perBeat` strokes to
// a beat), in the same form as thekaStrokes. "X" means any stroke.
export function exerciseStrokes(bols, perBeat = 1) {
  const tokens = bols.trim().split(/\s+/);
  return {
    strokes: tokens.map((bol, k) => ({ bol, matra: Math.floor(k / perBeat), sub: k % perBeat, beat: k / perBeat })).filter((s) => s.bol !== '-'),
    cycleBeats: tokens.length / perBeat,
  };
}

// Follows a learner playing a stroke sequence over and over and says which
// stroke each hit was meant to be. With a beat (`beatSeconds` and the time
// of the first stroke, `start`), a hit belongs to the expected stroke nearest
// in time, and any strokes skipped on the way count as missed. Without a
// beat, hits simply take the strokes in order.
export class StrokeFollower {
  constructor(strokes, { cycleBeats, beatSeconds = null, start = null }) {
    Object.assign(this, { strokes, cycleBeats, beatSeconds, start });
    this.next = 0;  // counts strokes across cycles
  }

  at(k) {
    const n = this.strokes.length;
    const stroke = this.strokes[k % n];
    return { ...stroke, index: k % n, cycle: Math.floor(k / n), position: Math.floor(k / n) * this.cycleBeats + stroke.beat };
  }

  // Returns { stroke, offset (seconds, + = late; null without a beat), missed: [strokes] }.
  hit(time) {
    let k = this.next;
    const missed = [];
    if (this.beatSeconds && this.start !== null) {
      const p = (time - this.start) / this.beatSeconds;
      while (Math.abs(this.at(k + 1).position - p) < Math.abs(this.at(k).position - p)) missed.push(this.at(k++));
    }
    const stroke = this.at(k);
    this.next = k + 1;
    const offset = this.beatSeconds && this.start !== null ? time - (this.start + stroke.position * this.beatSeconds) : null;
    return { stroke, offset, missed };
  }

  // Strokes whose moment has passed without a hit (beat mode only).
  overdue(now, grace) {
    const missed = [];
    if (!this.beatSeconds || this.start === null) return missed;
    while (this.start + this.at(this.next).position * this.beatSeconds + grace < now) missed.push(this.at(this.next++));
    return missed;
  }
}

// How far off the beat still counts as on time.
export const timingTolerance = (beatSeconds) => Math.min(0.12, Math.max(0.05, 0.15 * beatSeconds));
