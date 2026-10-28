import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SIDES, palmFacing, HandSides, HandHistory, strikeAt, landingTime, zoneOf, placeDrums,
  handStroke, strokeOf, checkStroke, techniqueOf, CameraStrikes, ClockLink, sameLanding, landingsOf,
} from '../js/analysis/handstrikes.js';

// A synthetic right hand in its own frame (cm): wrist at the origin, fingers
// along +y, the back of the hand +z, thumb towards -x; fingertips curl down
// a little as they rest.
const RIGHT_HAND = [
  [0, 0, 0],
  [-2, 1.5, -0.5], [-3.5, 3.5, -0.5], [-4.5, 5.5, -0.8], [-5.2, 7, -1],
  [-2.4, 9, 0], [-2.6, 12.5, 0], [-2.7, 14.5, -0.5], [-2.8, 16, -1.5],
  [-0.6, 9.5, 0], [-0.6, 13.3, 0], [-0.6, 15.6, -0.6], [-0.6, 17.2, -1.6],
  [1.2, 9, 0], [1.3, 12.4, 0], [1.4, 14.5, -0.5], [1.5, 16, -1.5],
  [2.8, 8, 0], [3.1, 10.6, 0], [3.3, 12.2, -0.4], [3.4, 13.5, -1.2],
];
const JOINTS = { thumb: [1, 2, 3, 4], index: [5, 6, 7, 8], middle: [9, 10, 11, 12], ring: [13, 14, 15, 16], little: [17, 18, 19, 20] };

// World (cm): X to the learner's right, Y away from them, Z up; the table is Z = 0.
// lift: radians each finger is raised at its knuckle; raise: cm the whole hand is lifted;
// back: cm the hand sits nearer the learner than usual.
function handAt(side, { lift = {}, raise = 0, back = 0 } = {}) {
  const pts = RIGHT_HAND.map((p) => [...p]);
  for (const [finger, a] of Object.entries(lift)) {
    const [knuckle, ...rest] = JOINTS[finger];
    const o = pts[knuckle];
    for (const i of rest) {
      const dy = pts[i][1] - o[1];
      const dz = pts[i][2] - o[2];
      pts[i][1] = o[1] + dy * Math.cos(a) - dz * Math.sin(a);
      pts[i][2] = o[2] + dy * Math.sin(a) + dz * Math.cos(a);
    }
  }
  const mirror = side === 'left' ? -1 : 1;
  return pts.map(([x, y, z]) => [mirror * 12 + mirror * x, y - back, 3 + z + raise]);
}

const sub = (a, b) => a.map((v, i) => v - b[i]);
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };

// Cameras: standing in front of the learner and facing them (the usual way),
// or looking straight down from above.
const CAMERAS = {
  front: { at: [0, 55, 15], look: [0, 8, 0], right: [-1, 0, 0] },
  above: { at: [0, 8, 60], look: [0, 8, 0], right: [1, 0, 0] },
};
const ASPECT = 4 / 3;
function project(world, cam) {
  const f = unit(sub(cam.look, cam.at));
  const d = cross(f, cam.right);
  const c = world.map((p) => { const v = sub(p, cam.at); return [dot(v, cam.right), dot(v, d), dot(v, f)]; });
  const zw = c[0][2];
  return c.map(([x, y, z]) => [0.5 + 0.9 * x / z, 0.5 + 0.9 * ASPECT * y / z, 0.9 * (z - zw) / zw]);
}

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// How far a finger (radians) or a hand (cm) is raised at time t for strokes
// landing at `at`: up over 120 ms, held, down in the last 50 ms, a small
// bounce after an open stroke.
function rise(t, at, top, bounce = 0.2) {
  if (t < at - 300 || t > at + 200) return 0;
  if (t < at - 180) return top * (t - (at - 300)) / 120;
  if (t < at - 50) return top;
  if (t <= at) return top * (at - t) / 50;
  if (t < at + 60) return top * bounce * (t - at) / 60;
  return top * bounce * Math.max(0, 1 - (t - at - 60) / 100);
}

// Frames at 30 a second for a list of strokes:
// { at (ms), right: { fingers: [...] } | { flat: true }, left: …, back }.
function film(strokes, { camera = 'front', seconds = 3, noise = 0.002, seed = 1, labels, phase = 0 } = {}) {
  const rand = rng(seed);
  const frames = [];
  for (let t = phase; t < seconds * 1000; t += 1000 / 30) {
    const hands = SIDES.map((side) => {
      const pose = { lift: {}, raise: 0, back: 0 };
      for (const s of strokes) {
        const how = s[side];
        if (!how) continue;
        if (Math.abs(t - s.at) < 400) pose.back = s.back || 0;
        if (how.flat) pose.raise = Math.max(pose.raise, rise(t, s.at, 4, 0));
        for (const f of how.fingers || []) pose.lift[f] = Math.max(pose.lift[f] || 0, rise(t, s.at, 0.45, 0.2));
      }
      const points = project(handAt(side, pose), CAMERAS[camera])
        .map(([x, y, z]) => [x + noise * (rand() * 2 - 1), y + noise * (rand() * 2 - 1), z + 2 * noise * (rand() * 2 - 1)]);
      const label = labels ? labels[side] : side === 'right' ? 'Right' : 'Left';
      return { points, label };
    });
    frames.push({ time: t, hands: rand() < 0.5 ? hands : hands.reverse() });
  }
  return frames;
}

function watch(frames) {
  const sides = new HandSides();
  const history = new HandHistory(10000);
  for (const f of frames) history.push(f.time, sides.assign(f.hands, ASPECT), ASPECT);
  return { history, sides };
}

const what = (strike) => SIDES.filter((s) => strike[s]).map((s) => `${s}:${strike[s].flat ? 'flat' : [...strike[s].fingers].sort().join('+')}`).join(' ');

test('the back of each hand faces the camera, and its build tells right from left', () => {
  for (const camera of Object.keys(CAMERAS)) {
    for (const side of SIDES) {
      const facing = palmFacing(project(handAt(side), CAMERAS[camera]), ASPECT);
      assert.equal(facing.looksLike, side, `${camera} ${side}`);
      assert.ok(facing.back[2] < 0 || facing.back[1] < 0, 'faces up or towards the camera');
    }
  }
});

test('left and right are found wherever the camera stands, even when the tracker mislabels', () => {
  for (const camera of Object.keys(CAMERAS)) {
    const frames = film([], { camera, seconds: 1 });
    const { history } = watch(frames);
    const last = history.latest;
    // The learner's right hand is at world X = +12: on the picture's left for
    // a camera facing them, on its right for one above.
    const rightX = last.hands.right.points[0][0];
    const leftX = last.hands.left.points[0][0];
    assert.ok(camera === 'front' ? rightX < leftX : rightX > leftX, camera);
  }
  // Both labelled "Right": the camera in front decides by place.
  const { history } = watch(film([], { seconds: 1, labels: { right: 'Right', left: 'Right' } }));
  assert.ok(history.latest.hands.right.points[0][0] < history.latest.hands.left.points[0][0]);
  // The learner can swap them.
  const sides = new HandSides();
  sides.swap = true;
  const [frame] = film([], { seconds: 0.04 });
  const out = sides.assign(frame.hands, ASPECT);
  assert.ok(out.right[0][0] > out.left[0][0]);
});

const LESSON = [
  { at: 600, right: { fingers: ['index'] }, want: 'right:index', bol: 'Na' },
  { at: 1300, right: { fingers: ['middle', 'ring'] }, want: 'right:middle+ring', bol: 'Ti' },
  { at: 2000, left: { fingers: ['index', 'middle'] }, want: 'left:index+middle', bol: 'Ge' },
  { at: 2700, left: { flat: true }, want: 'left:flat', bol: 'Ke' },
  { at: 3400, right: { fingers: ['index'] }, left: { fingers: ['middle', 'index'] }, want: 'right:index left:index+middle', bol: 'Dha' },
  { at: 4100, right: { fingers: ['ring'] }, want: 'right:ring', bol: 'Ti' },
  { at: 4800, left: { fingers: ['thumb'] }, want: 'left:thumb', bol: null },
];

test('each stroke is put down to the right hand and fingers, from in front and from above', () => {
  for (const camera of Object.keys(CAMERAS)) {
    for (const seed of [1, 2, 3]) {
      const { history } = watch(film(LESSON, { camera, seconds: 5.5, seed }));
      for (const s of LESSON) {
        // The microphone's time for the hit is a little off.
        const strike = strikeAt(history, s.at + (seed - 2) * 20);
        assert.equal(what(strike), s.want, `${camera} seed ${seed} at ${s.at}`);
        assert.equal(strokeOf(strike).bol, s.bol, `${camera} at ${s.at}`);
      }
    }
  }
});

test('a quick stroke on the other hand just before does not make it "both"', () => {
  const strokes = [
    { at: 800, left: { fingers: ['index', 'middle'] } },
    { at: 1050, right: { fingers: ['index'] } },
    { at: 1300, left: { fingers: ['index', 'middle'] } },
    { at: 1550, right: { fingers: ['middle', 'ring'] } },
  ];
  for (const camera of Object.keys(CAMERAS)) {
    const { history } = watch(film(strokes, { camera, seconds: 2 }));
    assert.deepEqual(strokes.map((s) => strikeAt(history, s.at).sides.join()), ['left', 'right', 'left', 'right'], camera);
  }
});

test('one stroke heard twice is one stroke; the same finger striking again is two', () => {
  const strokes = [
    { at: 600, right: { fingers: ['index'] } },
    { at: 1000, right: { fingers: ['index'] } },
    { at: 1700, left: { flat: true } },
  ];
  const { history } = watch(film(strokes, { seconds: 2.2 }));
  let last = {};
  const hear = (at) => {
    const strike = strikeAt(history, at);
    const repeat = sameLanding(history, strike, last);
    if (!repeat) last = { ...last, ...landingsOf(strike) };
    return repeat;
  };
  // The microphone hears each landing, then its ringing once more 110 ms later.
  assert.deepEqual([600, 710, 1000, 1110, 1700, 1810].map(hear), [false, true, false, true, false, true]);
});

test('resting hands and no camera view give no stroke', () => {
  const { history } = watch(film([], { seconds: 2 }));
  for (const at of [500, 1000, 1500]) {
    const strike = strikeAt(history, at);
    assert.equal(strike.seen, true);
    assert.deepEqual(strike.sides, []);
  }
  assert.equal(strikeAt(new HandHistory(), 1000).seen, false);
});

test('drums under the resting hands: where the index lands picks Na, Tin or Tu', () => {
  for (const camera of Object.keys(CAMERAS)) {
    const rest = film([], { camera, seconds: 0.1, noise: 0 });
    const { history: still } = watch(rest);
    const drums = placeDrums(still.latest.hands.right.points, still.latest.hands.left.points, ASPECT);
    assert.equal(zoneOf(still.latest.hands.right.points[8], drums.dayan), 'kinar', camera);
    const strokes = [
      { at: 500, right: { fingers: ['index'] }, bol: 'Na' },
      { at: 1300, right: { fingers: ['index'] }, back: 3.5, bol: 'Tin' },
      { at: 2100, right: { fingers: ['index'] }, back: 7, bol: 'Tu' },
      { at: 2900, right: { fingers: ['index'] }, left: { fingers: ['index', 'middle'] }, back: 3.5, bol: 'Dhin' },
    ];
    const { history } = watch(film(strokes, { camera, seconds: 3.4 }));
    assert.deepEqual(strokes.map((s) => strokeOf(strikeAt(history, s.at), drums).bol), strokes.map((s) => s.bol), camera);
  }
});

test('strokes are checked against how the bol is played', () => {
  const stroke = (right, left) => strokeOf({ right, left }, null);
  const finger = (...fingers) => ({ fingers, flat: false, contact: {} });
  const flat = { fingers: ['index', 'middle', 'ring', 'little'], flat: true, contact: {} };
  assert.equal(checkStroke('Na', stroke(finger('index'), null)).ok, true);
  assert.deepEqual(checkStroke('Na', stroke(finger('middle', 'ring'), null)), { ok: false, problem: 'how', side: 'right', need: 'index' });
  assert.equal(checkStroke('Ti', stroke(finger('middle', 'ring'), null)).ok, true);
  assert.deepEqual(checkStroke('Dha', stroke(finger('index'), null)), { ok: false, problem: 'hands', need: ['right', 'left'] });
  assert.equal(checkStroke('Dha', stroke(finger('index'), finger('middle'))).ok, true);
  assert.deepEqual(checkStroke('Ke', stroke(null, finger('index', 'middle'))), { ok: false, problem: 'how', side: 'left', need: 'flat' });
  assert.equal(checkStroke('Ke', stroke(null, flat)).ok, true);
  assert.equal(checkStroke('X', stroke(null, flat)).ok, true);
  // Where on the drum counts only once the drums are placed.
  const tin = { right: { bol: 'Tin', how: 'index', zone: 'sur' }, left: null };
  assert.equal(checkStroke('Na', tin).ok, true);
  assert.deepEqual(checkStroke('Na', tin, { zones: true }), { ok: false, problem: 'zone', side: 'right', need: 'kinar' });
  assert.equal(techniqueOf('Dhin').right.zone, 'sur');
  assert.deepEqual(handStroke(finger('thumb'), 'right'), { bol: null, how: 'thumb' });
  assert.deepEqual(checkStroke('Na', stroke(finger('thumb'), null)), { ok: false, problem: 'how', side: 'right', need: 'index' });
  assert.deepEqual(stroke(finger('index'), flat).parts, ['Na', 'Ke']);
});

test('the camera alone spots a sharp stroke, but not hands settling slowly', () => {
  const strokes = [{ at: 600, right: { fingers: ['index'] } }, { at: 1400, left: { flat: true } }];
  // Whatever moments the camera happens to take its pictures at.
  for (const phase of [0, 7, 14, 21, 28]) {
    const frames = film(strokes, { seconds: 2.2, phase });
    // The left hand then sinks slowly by 5 cm over a second.
    const slow = film([], { seconds: 1.2, seed: 9 }).map((f, i) => ({
      time: 2200 + f.time,
      hands: f.hands.map((h) => (h.label === 'Left' ? { ...h, points: h.points.map(([x, y, z]) => [x, y + 0.004 * Math.min(i, 30), z]) } : h)),
    }));
    const sides = new HandSides();
    const history = new HandHistory(10000);
    const cam = new CameraStrikes();
    const found = [];
    for (const f of [...frames, ...slow]) {
      history.push(f.time, sides.assign(f.hands, ASPECT), ASPECT);
      found.push(...cam.update(history));
    }
    assert.equal(found.length, 2, `phase ${phase}: ${JSON.stringify(found)}`);
    assert.ok(Math.abs(found[0].time - 600) <= 70 && found[0].side === 'right', `phase ${phase}`);
    assert.ok(Math.abs(found[1].time - 1400) <= 70 && found[1].side === 'left', `phase ${phase}`);
    assert.ok(Math.abs(landingTime(strikeAt(history, 610)) - 600) <= 34);
  }
});

test('microphone times are put on the camera clock and corrected by what the camera saw', () => {
  const link = new ClockLink({ inputDelay: 20 });
  // The page hears each piece of sound 5–30 ms after it was stamped; the
  // camera clock runs 1000 s ahead of the audio clock.
  for (let k = 0; k < 200; k++) link.heard(k * 0.005, 1e6 + k * 5 + 5 + (k % 7) * 4);
  assert.ok(Math.abs(link.toCamera(0.5) - (1e6 + 500 + 5 - 20)) < 1e-6);
  // Strokes really land 35 ms before the guess: it learns that.
  const landed = link.toCamera(0.5) - 35;
  for (let k = 0; k < 30; k++) link.learn(0.5, landed + (k % 2 ? 5 : -5));
  assert.ok(Math.abs(link.toCamera(0.5) - (1e6 + 500 + 5 - 20 - 35)) < 6);
});
