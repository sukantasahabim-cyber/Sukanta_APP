// Camera Tabla: which hand and which finger made each stroke, from the hand
// landmarks a camera sees. A microphone cannot tell an index finger from a
// middle finger on a table, but a camera can: the finger that was raised a
// moment before a hit and came down at that moment made it. The microphone
// still says exactly when the hit happened.
//
// Points are MediaPipe hand landmarks: 21 per hand, x and y across the camera
// picture (0–1, not mirrored) and z, the depth relative to the wrist on about
// the same scale as x (smaller is nearer the camera).

export const SIDES = ['right', 'left'];
export const FINGERS = ['thumb', 'index', 'middle', 'ring', 'little'];
export const TIPS = { thumb: 4, index: 8, middle: 12, ring: 16, little: 20 };
const PALM = [0, 5, 9, 13, 17];
const PALM_SPANS = [[0, 5], [0, 17], [5, 17], [0, 9], [5, 13], [9, 17]];
// Lines between the points, for drawing a hand.
export const HAND_LINES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
];

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// The way the back of the hand faces. When tabla is played the palms face
// the drums, so the back of each hand faces up and towards a camera standing
// in front of (or above) the hands: up the picture and/or nearer the camera.
// The palm's own direction (index knuckle × little knuckle, from the wrist)
// points to the palm side for a right hand and the back for a left hand,
// which also tells the two hands apart.
export function palmFacing(points, aspect = 4 / 3) {
  const p = (i) => [points[i][0] * aspect, points[i][1], points[i][2] * aspect];
  const n = unit(cross(sub(p(5), p(0)), sub(p(17), p(0))));
  const right = n[1] + n[2] > 0;
  return { back: right ? [-n[0], -n[1], -n[2]] : n, looksLike: right ? 'right' : 'left' };
}

// Heights of each fingertip above the palm, in palm lengths (wrist to middle
// knuckle, about 9 cm), measured along the back of the hand's direction, and
// what shows of the whole hand rising: its movement up the picture
// (`across`) and how big it looks (`span`, which grows as it nears a camera
// above it). `back` (the direction) and `size` (the palm length) are
// smoothed over time by HandHistory, so jitter in single frames does not look
// like movement.
export const palmLength = (points, aspect) => Math.hypot((points[9][0] - points[0][0]) * aspect, points[9][1] - points[0][1], (points[9][2] - points[0][2]) * aspect) || 1e-3;

export function describeHand(points, aspect, back, size = palmLength(points, aspect)) {
  const p = points.map(([x, y, z]) => [x * aspect, y, z * aspect]);
  const palm = [0, 1, 2].map((j) => PALM.reduce((a, i) => a + p[i][j], 0) / PALM.length);
  const heights = {};
  for (const f of FINGERS) heights[f] = dot(sub(p[TIPS[f]], palm), back) / size;
  const across = (palm[0] * back[0] + palm[1] * back[1]) / size;
  const span = Math.log(PALM_SPANS.reduce((a, [i, j]) => a + Math.hypot(p[i][0] - p[j][0], p[i][1] - p[j][1]), 0) / PALM_SPANS.length);
  return { points, size, heights, across, span };
}

// A hand about 5 palm lengths from a camera looking down on it looks a fifth
// bigger for every palm length it rises; seen from the side it barely grows.
const NEARER = 4;

// Which of the hands in a picture is the learner's right and which the left.
// Clues: the tracker's label, the hand's build (palmFacing) and where the
// hands are; tabla is played with the right hand on the right. A camera in
// front of the learner (the usual way, so they can see the screen) shows
// their right hand on the left of its picture; one behind or above them on
// the right. Which way round it is gets learned from the hands themselves.
export class HandSides {
  constructor() {
    this.facing = 0;     // > 0: camera in front of the learner; < 0: behind
    this.midline = null; // x between the hands when both were last seen
    this.swap = false;   // the learner said left and right are the wrong way round
  }

  // hands: [{ points, label: 'Left' | 'Right' }] → { right, left } (points or null)
  assign(hands, aspect = 4 / 3) {
    const out = { right: null, left: null };
    const known = hands.slice(0, 2).map((h) => {
      const built = palmFacing(h.points, aspect).looksLike;
      const said = h.label?.toLowerCase();
      return { ...h, x: h.points[0][0], side: said === built ? built : null, guess: said || built };
    }).sort((a, b) => a.x - b.x);
    if (known.length === 2) {
      const [a, b] = known;
      if (a.side && b.side && a.side !== b.side) this.facing = clamp(this.facing + (a.side === 'right' ? 1 : -1), -30, 30);
      this.midline = (a.x + b.x) / 2;
      const [r, l] = this.facing >= 0 ? [a, b] : [b, a];
      out.right = r.points;
      out.left = l.points;
    } else if (known.length === 1) {
      const [a] = known;
      let side = a.guess;
      if (this.midline !== null && Math.abs(this.facing) >= 5) side = (a.x < this.midline) === (this.facing > 0) ? 'right' : 'left';
      out[side] = a.points;
    }
    return this.swap ? { right: out.left, left: out.right } : out;
  }
}

// The last few seconds of hands, described frame by frame.
export class HandHistory {
  constructor(keep = 3000) {
    this.keep = keep;
    this.frames = [];
    this.back = { right: null, left: null };
    this.size = { right: null, left: null };
    this.span = { right: null, left: null };
  }

  // time in ms; hands = { right, left } points (from HandSides.assign).
  push(time, hands, aspect = 4 / 3) {
    const entry = { time, aspect, hands: {} };
    for (const side of SIDES) {
      const points = hands[side];
      if (!points) { entry.hands[side] = null; continue; }
      const now = palmFacing(points, aspect).back;
      const prev = this.back[side];
      this.back[side] = prev ? unit(prev.map((v, j) => 0.8 * v + 0.2 * now[j])) : now;
      const size = palmLength(points, aspect);
      this.size[side] = this.size[side] ? 0.9 * this.size[side] + 0.1 * size : size;
      const hand = describeHand(points, aspect, this.back[side], this.size[side]);
      // How much bigger the hand looks than it has lately (a light average of
      // the last frames against a slow one).
      const span = this.span[side] || { fast: hand.span, slow: hand.span };
      span.fast = 0.5 * span.fast + 0.5 * hand.span;
      span.slow = 0.97 * span.slow + 0.03 * hand.span;
      this.span[side] = span;
      hand.palmHeight = hand.across - this.back[side][2] * NEARER * (span.fast - span.slow);
      entry.hands[side] = hand;
    }
    this.frames.push(entry);
    while (this.frames[0].time < time - this.keep) this.frames.shift();
    return entry;
  }

  get latest() { return this.frames[this.frames.length - 1] || null; }

  between(t0, t1) { return this.frames.filter((f) => f.time >= t0 && f.time <= t1); }
}

export const STRIKE = {
  before: [-200, -20], // ms around the hit while the striking finger is still raised…
  around: [-50, 70],   // …and while it lands
  settle: 150,         // ms after the hit by which it has come to rest
  minDrop: 0.15,       // how far (in palm lengths) it must come down
  share: 0.6,          // fingers coming down at least this share of the most did so together
  together: 0.4,       // both hands count when the quieter moved this share of the busier
};

// How one hand moved into a hit: how far each finger and the palm came down.
function handMove(side, pre, at, o) {
  const before = pre.map((f) => f.hands[side]).filter(Boolean);
  const during = at.filter((f) => f.hands[side]);
  if (before.length < 2 || !during.length) return null;
  const drops = {};
  const contact = {};
  for (const f of FINGERS) {
    const high = Math.max(...before.map((h) => h.heights[f]));
    let low = Infinity;
    for (const fr of during) {
      const h = fr.hands[side];
      if (h.heights[f] < low) { low = h.heights[f]; contact[f] = { time: fr.time, point: h.points[TIPS[f]] }; }
    }
    drops[f] = high - low;
  }
  const palmLow = during.reduce((a, fr) => (fr.hands[side].palmHeight < a.hands[side].palmHeight ? fr : a));
  contact.palm = { time: palmLow.time, point: null };
  const palmDrop = Math.max(...before.map((h) => h.palmHeight)) - palmLow.hands[side].palmHeight;
  const fingers = FINGERS.slice(1);
  const top = Math.max(...fingers.map((f) => drops[f]));
  const move = { active: false, activity: Math.max(top, palmDrop, drops.thumb), drops, palmDrop, contact, flat: false, fingers: [] };
  if (move.activity < o.minDrop) return move;
  move.active = true;
  if (palmDrop >= o.minDrop && palmDrop >= Math.max(top, drops.thumb)) {
    move.flat = true;
    move.fingers = fingers;
  } else {
    move.fingers = fingers.filter((f) => drops[f] >= Math.max(o.minDrop, o.share * top)).sort((a, b) => drops[b] - drops[a]);
    if (!move.fingers.length) move.fingers = ['thumb'];
  }
  return move;
}

// What the hands did at `time` (ms, camera clock). `seen` is false when the
// camera had no view of either hand then; `sides` lists the hands that struck.
export function strikeAt(history, time, opts = {}) {
  const o = { ...STRIKE, ...opts };
  const pre = history.between(time + o.before[0], time + o.before[1]);
  const at = history.between(time + o.around[0], time + o.around[1]);
  const moves = { right: handMove('right', pre, at, o), left: handMove('left', pre, at, o) };
  let sides = SIDES.filter((s) => moves[s]?.active);
  if (sides.length === 2) {
    const [r, l] = [moves.right.activity, moves.left.activity];
    if (Math.min(r, l) < o.together * Math.max(r, l)) sides = [r >= l ? 'right' : 'left'];
  }
  // Where each striking finger (or palm) came to rest: its lowest point from
  // just before the hit to a little after. Until a picture after that point
  // has arrived it may still be on its way down (not `settled`).
  let settled = true;
  for (const side of sides) {
    const move = moves[side];
    const part = leadOf(move);
    const read = heightOf(part);
    const frames = history.between(time + o.around[0], time + o.settle).filter((f) => f.hands[side]);
    const low = frames.reduce((a, f) => (read(f.hands[side]) < read(a.hands[side]) ? f : a));
    const lowest = read(low.hands[side]);
    // It arrived when it first came close to where it rests (before any bounce).
    const near = lowest + 0.15 * Math.max(o.minDrop, move.drops[part] ?? move.palmDrop);
    const arrived = frames.find((f) => read(f.hands[side]) <= near) || low;
    move.landing = { part, time: arrived.time, low: lowest, point: part === 'palm' ? null : low.hands[side].points[TIPS[part]] };
    if (low === frames[frames.length - 1] && low === history.latest && history.latest.time < time + o.settle) settled = false;
  }
  return {
    time,
    seen: SIDES.some((s) => moves[s] !== null),
    // The camera has pictures from before the hit to after it (it may have
    // only just started, or stalled).
    covered: pre.length >= 2 && at.length > 0,
    sides,
    settled,
    right: sides.includes('right') ? moves.right : null,
    left: sides.includes('left') ? moves.left : null,
    moves,
  };
}

// What came down in one hand's move: its lead finger, or 'palm' for a flat
// hand; and how to read that part's height from a frame.
export const leadOf = (move) => (move.flat ? 'palm' : move.fingers[0]);
export const heightOf = (part) => (part === 'palm' ? (h) => h.palmHeight : (h) => h.heights[part]);

// True when a new strike is the same landing as `last` (per side: { part,
// time, low }) heard twice: the same finger has not been raised again since.
export function sameLanding(history, strike, last, minDrop = STRIKE.minDrop) {
  return strike.sides.length > 0 && strike.sides.every((side) => {
    const prev = last[side];
    const now = strike[side].landing;
    if (!prev || !now || prev.part !== now.part) return false;
    const read = heightOf(prev.part);
    const since = history.between(prev.time, now.time).map((f) => f.hands[side]).filter(Boolean).map(read);
    return Math.max(prev.low, ...since) - prev.low < minDrop;
  });
}

// Where each hand of a strike landed, for sameLanding next time.
export function landingsOf(strike) {
  const out = {};
  for (const side of strike.sides) if (strike[side].landing) out[side] = strike[side].landing;
  return out;
}

// When a striking finger landed, for checking the clocks (null if unclear).
export function landingTime(strike) {
  const side = strike.sides[0];
  const move = side && strike[side];
  if (!move || move.flat || move.fingers[0] === 'thumb') return null;
  return move.landing?.time ?? null;
}

// ---------- The drums ----------

// The rings of the dayan, as a share of its radius: the syahi (black centre),
// the sur or maidan (open skin) and the kinar (rim).
export const RINGS = { syahi: 0.45, sur: 0.8 };

// Where on a drum a point (x, y in the picture) lies: 'syahi', 'sur' or
// 'kinar' (anything beyond the sur counts as the rim).
export function zoneOf(point, drum) {
  if (!point || !drum) return null;
  const r = Math.hypot((point[0] - drum.x) / drum.rx, (point[1] - drum.y) / drum.ry);
  return r <= RINGS.syahi ? 'syahi' : r <= RINGS.sur ? 'sur' : 'kinar';
}

// How flat a circle lying on the table looks to the camera: the palm is
// about 1.15 times as long as it is wide, so a shorter-looking palm means
// the camera looks along the table.
function squashOf(points, aspect) {
  const d = (i, j) => Math.hypot((points[i][0] - points[j][0]) * aspect, points[i][1] - points[j][1]);
  return clamp(d(0, 9) / (d(5, 17) * 1.15 || 1), 0.3, 1);
}

// Drums drawn under the hands as they rest on the table, in picture
// coordinates (x, y, and radii rx as a share of the width, ry of the height).
// The dayan reaches from the heel of the right hand to the tip of its index
// finger, so the resting index finger is on the kinar, ready for Na; the
// bayan lies under the left hand.
export function placeDrums(right, left, aspect = 4 / 3) {
  const drum = (points, from, to, scale, reach) => {
    const s = squashOf(points, aspect);
    const dx = (points[to][0] - points[from][0]) * aspect;
    const dy = points[to][1] - points[from][1];
    const radius = scale * Math.hypot(dx, dy / s);
    return { x: points[from][0] + reach * (points[to][0] - points[from][0]), y: points[from][1] + reach * dy, rx: radius / aspect, ry: radius * s };
  };
  return {
    dayan: right ? drum(right, 0, 8, 0.5, 0.5) : null,
    bayan: left ? drum(left, 0, 12, 0.6, 0.55) : null,
  };
}

// ---------- Strokes ----------

const DAYAN_BOL = { kinar: 'Na', sur: 'Tin', syahi: 'Tu' };
const BOTH_BOL = { Na: 'Dha', Tin: 'Dhin' };

// The stroke one hand made: { bol (null for a thumb), how, zone }.
// how: 'index', 'middle', 'ring', 'little', 'thumb', 'flat' or 'fingers'.
export function handStroke(move, side, drums) {
  if (!move) return null;
  const lead = move.fingers[0];
  if (side === 'left') {
    if (move.flat) return { bol: 'Ke', how: 'flat' };
    if (lead === 'thumb') return { bol: null, how: 'thumb' };
    return { bol: 'Ge', how: 'fingers' };
  }
  if (move.flat) return { bol: 'Ti', how: 'flat' };
  if (lead === 'thumb') return { bol: null, how: 'thumb' };
  if (lead === 'index') {
    const zone = zoneOf((move.landing || move.contact.index)?.point, drums?.dayan);
    return { bol: DAYAN_BOL[zone] || 'Na', how: 'index', zone };
  }
  return { bol: 'Ti', how: lead };
}

// The bol a strike plays: { bol, parts (bols to sound), right, left }.
// Both hands together make Dha or Dhin; other pairs sound both parts.
export function strokeOf(strike, drums) {
  const right = handStroke(strike.right, 'right', drums);
  const left = handStroke(strike.left, 'left', drums);
  if (right?.bol && left?.bol) {
    const both = left.bol === 'Ge' ? BOTH_BOL[right.bol] : null;
    return { bol: both || `${right.bol}+${left.bol}`, parts: both ? [both] : [right.bol, left.bol], right, left };
  }
  const one = right?.bol ? right : left?.bol ? left : null;
  return { bol: one?.bol || null, parts: one ? [one.bol] : [], right, left };
}

// How each bol is played, as the lessons teach it.
const NA = { how: 'index', zone: 'kinar' };
const TIN = { how: 'index', zone: 'sur' };
const TU = { how: 'index', zone: 'syahi' };
const GE = { how: 'fingers' };
const KE = { how: 'flat' };
const TECHNIQUE = {
  na: { right: NA }, ta: { right: NA }, tin: { right: TIN }, tu: { right: TU }, tun: { right: TU },
  ra: { right: { how: 'index' } }, re: { right: { how: 'index' } },
  ti: { right: { how: 'middle' } }, te: { right: { how: 'middle' } },
  ge: { left: GE }, ghe: { left: GE }, ga: { left: GE },
  ke: { left: KE }, ka: { left: KE }, ki: { left: KE }, kat: { left: KE },
  dha: { right: NA, left: GE }, dhin: { right: TIN, left: GE }, dhi: { right: TIN, left: GE },
};
export const techniqueOf = (bol) => TECHNIQUE[bol.toLowerCase()] || null;

const HOW_FITS = {
  index: (how) => how === 'index',
  middle: (how) => ['middle', 'ring', 'little', 'flat'].includes(how),
  fingers: (how) => how === 'fingers',
  flat: (how) => how === 'flat',
};

// Compares a stroke (strokeOf) with the bol it should have been:
// { ok, problem: 'hands' | 'how' | 'zone', side, need }. Where on the drum
// is only checked when `zones` (the drums are placed).
export function checkStroke(want, got, { zones = false } = {}) {
  const tech = techniqueOf(want);
  if (!tech) return { ok: true };
  const needSides = SIDES.filter((s) => tech[s]);
  const gotSides = SIDES.filter((s) => got[s]);
  if (needSides.join() !== gotSides.join()) return { ok: false, problem: 'hands', need: needSides };
  for (const side of needSides) {
    if (!HOW_FITS[tech[side].how](got[side].how)) return { ok: false, problem: 'how', side, need: tech[side].how };
  }
  const zone = tech.right?.zone;
  if (zones && zone && got.right.zone && got.right.zone !== zone) return { ok: false, problem: 'zone', side: 'right', need: zone };
  return { ok: true };
}

// ---------- Strokes the microphone missed ----------

// Spots strokes from the picture alone, for hits too soft to hear: a finger
// (or the whole hand) that drops by a good margin, quickly (from most of its
// height to its lowest point within `fast` ms), and stops. Call after each
// HandHistory.push; returns [{ time, side }] for the frame before the newest,
// once the newest shows the drop has ended.
export class CameraStrikes {
  constructor({ drop = 0.3, within = 300, fast = 110, gap = 150 } = {}) {
    Object.assign(this, { drop, within, fast, gap });
    this.last = { right: -Infinity, left: -Infinity };
  }

  update(history) {
    const f = history.frames;
    if (f.length < 3) return [];
    const [a, b, c] = f.slice(-3);
    const found = [];
    for (const side of SIDES) {
      const [ha, hb, hc] = [a.hands[side], b.hands[side], c.hands[side]];
      if (!ha || !hb || !hc || b.time - this.last[side] < this.gap) continue;
      const pre = history.between(b.time - this.within, b.time).filter((x) => x.hands[side]);
      const reads = [...FINGERS.slice(1).map((g) => (h) => h.heights[g]), (h) => h.palmHeight];
      const landed = reads.some((m) => {
        const low = m(hb);
        if (low > m(ha) || low > m(hc)) return false;
        const peak = Math.max(...pre.map((x) => m(x.hands[side])));
        if (peak - low < this.drop) return false;
        // The last moment it was still high up: it must have come down fast.
        const high = pre.filter((x) => m(x.hands[side]) >= low + 0.7 * (peak - low)).pop();
        return b.time - high.time <= this.fast;
      });
      if (landed) {
        found.push({ time: b.time, side });
        this.last[side] = b.time;
      }
    }
    return found;
  }
}

// ---------- Clocks ----------

// Puts microphone times (AudioContext seconds) on the camera's clock
// (performance.now() milliseconds). It starts from when sound reaches the
// page and corrects itself from strokes the camera saw land.
export class ClockLink {
  constructor({ inputDelay = 20 } = {}) {
    this.arrivals = [];
    this.base = null;
    this.shift = -inputDelay;
    this.learned = 0;
  }

  // For each piece of microphone sound: the AudioContext time of its last
  // sample and performance.now() when it reached the page. The quickest
  // arrivals are the truest.
  heard(audioTime, now) {
    this.arrivals.push({ now, gap: now - audioTime * 1000 });
    while (this.arrivals.length && this.arrivals[0].now < now - 3000) this.arrivals.shift();
    this.base = Math.min(...this.arrivals.map((a) => a.gap));
  }

  toCamera(audioTime) { return audioTime * 1000 + (this.base ?? 0) + this.shift; }

  // The other way round: a camera time (ms) on the microphone's clock (s).
  toAudio(ms) { return (ms - (this.base ?? 0) - this.shift) / 1000; }

  // A stroke heard at audioTime that the camera saw land at `landed` ms.
  // The first few corrections are bold (the camera's delay is not known at
  // first); later ones only fine-tune.
  learn(audioTime, landed) {
    const miss = landed - this.toCamera(audioTime);
    const rate = this.learned < 3 ? 0.6 : 0.2;
    this.shift = clamp(this.shift + rate * clamp(miss, -120, 120), -300, 300);
    this.learned++;
  }
}
