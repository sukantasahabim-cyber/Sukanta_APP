import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  hitFeatures, hitSize, HIT_BEFORE, HitClassifier, checkExamples, HitDetector,
  handOf, thekaStrokes, StrokeFollower, timingTolerance,
} from '../js/analysis/tablehits.js';
import { TAALS } from '../js/data/taals.js';

// Synthetic hits on a table: a fingertip tap is a bright click with short
// ringing of the table top; a palm thump is a deep, longer thud.
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function damped(out, at, sr, { freq, decay, gain, phase = 0 }) {
  for (let i = 0; i < sr * decay * 6 && at + i < out.length; i++) out[at + i] += gain * Math.exp(-i / (sr * decay)) * Math.sin(2 * Math.PI * freq * i / sr + phase);
}
function burst(out, at, sr, { decay, gain, rand, bright = true }) {
  let prev = 0;
  for (let i = 0; i < sr * decay * 6 && at + i < out.length; i++) {
    const n = rand() * 2 - 1;
    out[at + i] += gain * Math.exp(-i / (sr * decay)) * (bright ? n - prev : 0.5 * (n + prev));
    prev = n;
  }
}
const HIT = {
  right(out, at, sr, rand, level) {
    burst(out, at, sr, { decay: 0.0015 + 0.001 * rand(), gain: 0.6 * level, rand });
    for (let r = 0; r < 3; r++) damped(out, at, sr, { freq: 1500 + 3500 * rand(), decay: 0.006 + 0.01 * rand(), gain: (0.15 + 0.15 * rand()) * level, phase: rand() * 6 });
    damped(out, at, sr, { freq: 120 + 60 * rand(), decay: 0.01, gain: 0.04 * level });
  },
  left(out, at, sr, rand, level) {
    damped(out, at, sr, { freq: 70 + 90 * rand(), decay: 0.035 + 0.04 * rand(), gain: 0.8 * level });
    damped(out, at, sr, { freq: 250 + 200 * rand(), decay: 0.015, gain: 0.15 * level });
    burst(out, at, sr, { decay: 0.002, gain: 0.08 * level, rand, bright: false });
  },
  both(out, at, sr, rand, level) {
    HIT.left(out, at, sr, rand, level);
    HIT.right(out, at + Math.round(sr * 0.004 * rand()), sr, rand, level);
  },
};
const noise = (out, rand, gain) => { for (let i = 0; i < out.length; i++) out[i] += gain * (rand() * 2 - 1); };

function examples(sr, perHand, rand) {
  const out = {};
  for (const hand of Object.keys(HIT)) {
    out[hand] = Array.from({ length: perHand }, () => {
      const buf = new Float32Array(Math.round(sr * 0.15));
      noise(buf, rand, 0.003);
      const at = Math.round(sr * 0.05);
      HIT[hand](buf, at, sr, rand, 0.3 + 0.7 * rand());
      const start = at - Math.round(sr * HIT_BEFORE);
      return hitFeatures(buf.subarray(start, start + hitSize(sr)), sr).vector;
    });
  }
  return out;
}

test('which hand plays each bol', () => {
  assert.equal(handOf('Dha'), 'both');
  assert.equal(handOf('Dhin'), 'both');
  for (const bol of ['Ge', 'Ga', 'Ke', 'Ki', 'Kat']) assert.equal(handOf(bol), 'left', bol);
  for (const bol of ['Na', 'Ta', 'Tin', 'Tu', 'Ti', 'Ra', 'Te']) assert.equal(handOf(bol), 'right', bol);
  assert.equal(handOf('-'), null);
});

test('after four examples of each, hits are told apart', () => {
  for (const sr of [44100, 48000]) {
    const rand = rng(sr);
    const train = examples(sr, 4, rand);
    const fresh = examples(sr, 10, rand);
    const clf = new HitClassifier(train);
    let right = 0;
    let total = 0;
    for (const [hand, rows] of Object.entries(fresh)) {
      for (const v of rows) { total++; if (clf.classify(v).hand === hand) right++; }
    }
    assert.ok(right / total >= 0.95, `${sr} Hz: ${right}/${total}`);
    assert.equal(checkExamples(train), 1);
  }
});

test('three kinds of hit that sound alike are flagged', () => {
  const rand = rng(5);
  const taps = examples(48000, 12, rand).right;
  const same = { right: taps.slice(0, 4), left: taps.slice(4, 8), both: taps.slice(8, 12) };
  assert.ok(checkExamples(same) < 0.75, String(checkExamples(same)));
});

test('loudness does not change which hand a hit sounds like', () => {
  const sr = 48000;
  const vectors = [0.2, 1].map((level) => {
    const buf = new Float32Array(sr * 0.1);
    HIT.left(buf, Math.round(sr * 0.02), sr, rng(9), level);
    const start = Math.round(sr * 0.02) - Math.round(sr * HIT_BEFORE);
    return hitFeatures(buf.subarray(start, start + hitSize(sr)), sr);
  });
  vectors[0].vector.forEach((v, j) => assert.ok(Math.abs(v - vectors[1].vector[j]) < 1e-6));
  assert.ok(vectors[1].level > 4 * vectors[0].level);
});

test('hits are found the moment they happen, even fast and soft ones', () => {
  for (const sr of [44100, 48000]) {
    const rand = rng(11);
    const buf = new Float32Array(sr * 10);
    noise(buf, rand, 0.004);
    const truth = [];
    for (let t = 0.5; t < 9.5; t += 0.12 + 0.35 * rand()) {
      const at = Math.round(t * sr);
      HIT[['right', 'left', 'both'][Math.floor(rand() * 3)]](buf, at, sr, rand, 0.25 + 0.75 * rand());
      truth.push(at);
    }
    const detector = new HitDetector(sr);
    const found = [];
    for (let i = 0; i < buf.length; i += 256) found.push(...detector.push(buf.subarray(i, i + 256)));
    const matched = truth.filter((at) => found.some((f) => Math.abs(f - at) < sr * 0.01)).length;
    assert.ok(matched >= truth.length - 1, `${sr} Hz: found ${matched} of ${truth.length}`);
    assert.ok(found.length <= truth.length, `${found.length} detections for ${truth.length} hits`);
  }
});

test('background noise alone is not a hit', () => {
  const sr = 48000;
  const buf = new Float32Array(sr * 5);
  noise(buf, rng(2), 0.01);
  const detector = new HitDetector(sr);
  const found = [];
  for (let i = 0; i < buf.length; i += 256) found.push(...detector.push(buf.subarray(i, i + 256)));
  assert.equal(found.length, 0);
});

test('a theka becomes strokes in playing order', () => {
  const teentaal = thekaStrokes(TAALS.teentaal);
  assert.equal(teentaal.length, 16);
  assert.deepEqual(teentaal.slice(0, 3).map((s) => [s.bol, s.beat]), [['Dha', 0], ['Dhin', 1], ['Dhin', 2]]);
  const ektaal = thekaStrokes(TAALS.ektaal);
  const tirakita = ektaal.filter((s) => s.matra === 3);
  assert.deepEqual(tirakita.map((s) => [s.bol, s.beat]), [['Ti', 3], ['Ra', 3.25], ['Ki', 3.5], ['Ta', 3.75]]);
  const jhoomra = thekaStrokes(TAALS.jhoomra);
  assert.deepEqual(jhoomra.filter((s) => s.matra === 1).map((s) => [s.bol, s.beat]), [['Dha', 1.5]]);
});

test('without a beat, hits take the strokes in order and wrap round', () => {
  const strokes = thekaStrokes(TAALS.dadra);
  const f = new StrokeFollower(strokes, { cycleBeats: 6 });
  const got = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => f.hit(i * 0.4));
  assert.deepEqual(got.map((g) => g.stroke.bol), ['Dha', 'Dhi', 'Na', 'Dha', 'Ti', 'Na', 'Dha', 'Dhi']);
  assert.equal(got[6].stroke.cycle, 1);
  assert.ok(got.every((g) => g.offset === null && g.missed.length === 0));
});

test('with a beat, timing is measured and skipped strokes count as missed', () => {
  const strokes = thekaStrokes(TAALS.keherwa);
  const f = new StrokeFollower(strokes, { cycleBeats: 8, beatSeconds: 0.5, start: 10 });
  const first = f.hit(10.03);
  assert.equal(first.stroke.bol, 'Dha');
  assert.ok(Math.abs(first.offset - 0.03) < 1e-9);
  // The learner leaves out the 2nd and 3rd strokes and plays the 4th a little early.
  const fourth = f.hit(11.46);
  assert.equal(fourth.stroke.bol, 'Ti');
  assert.deepEqual(fourth.missed.map((s) => s.bol), ['Ge', 'Na']);
  assert.ok(Math.abs(fourth.offset + 0.04) < 1e-9);
  // Two beats pass in silence: both strokes are overdue.
  assert.deepEqual(f.overdue(12.9, 0.1).map((s) => s.bol), ['Na', 'Ka']);
  assert.ok(timingTolerance(0.5) <= 0.12 && timingTolerance(0.2) >= 0.05);
});

test('a practical exercise becomes strokes too', async () => {
  const { exerciseStrokes } = await import('../js/analysis/tablehits.js');
  const { strokes, cycleBeats } = exerciseStrokes('Dha - Ti Ta Na Na', 2);
  assert.equal(cycleBeats, 3);
  assert.deepEqual(strokes.map((s) => [s.bol, s.beat]), [['Dha', 0], ['Ti', 1], ['Ta', 1.5], ['Na', 2], ['Na', 2.5]]);
});
