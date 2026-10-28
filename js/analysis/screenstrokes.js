// The on-screen tabla's rules, apart from drawing and sound (those are in
// widgets/screentabla.js): which stroke each touch makes, as on a real tabla.
//
//   Dayan (right drum): the rim (kinar) → Na; the open skin (sur) → Tin;
//   the black centre (syahi) → Tu. A finger left on the skin damps the
//   sound, as on a real drum (Tu then becomes Ra). Two fingers landing
//   together in the centre → Ti.
//   Bayan (left drum): the open skin → Ge; the black spot, or a flat hand
//   (three fingers or more at once, or a palm) → Ke. The edge nearest the
//   player is where the heel of the hand rests: touching it makes no sound,
//   and sliding it up, towards the middle, raises the pitch of a ringing Ge,
//   as pressing the skin does. (Any finger kept on the bayan does the same.)
//   Both drums together → Dha (Na + Ge) or Dhin (Tin + Ge).
//
// Every touch sounds at once; the stroke is reported a moment later, when it
// is clear whether the finger stayed and what the other hand did.

// Shares of a drum head's radius: the syahi, the sur, and how far beyond the
// head a touch still counts (as the rim).
export const ZONES = { syahi: 0.42, sur: 0.8, edge: 1.18 };
// The bayan's syahi sits towards the player (down the screen); below it,
// the heel of the hand rests.
export const BAYAN_SYAHI = { dy: 0.3, r: 0.36 };
export const HEEL = 0.68;
export const HOLD = 60;       // ms a finger must stay on the dayan to damp it
export const TOGETHER = 50;   // ms within which touches make one stroke
export const FLAT = 3;        // fingers landing together on the bayan: a flat hand
export const BEND = 0.35;     // how far (×) the bayan rises with the heel slid across its radius
const RING = 2600;            // ms a Ge rings, for bending it

// Where the two drums sit on a screen `width` × `height` (CSS px): the
// bayan on the left, a little bigger, the dayan on the right. On a tall
// screen (a phone held upright) they sit on a slant, one above the other,
// so they can be bigger.
export function drumLayout(width, height) {
  if (height > width * 1.15) {
    const r = Math.min(width * 0.34, height * 0.24);
    return {
      bayan: { cx: width * 0.42, cy: height * 0.7, r },
      dayan: { cx: width * 0.58, cy: height * 0.3, r: r * 0.8 },
    };
  }
  const r = Math.min(width * 0.2, height * 0.4);
  return {
    bayan: { cx: width * 0.27, cy: height * 0.52, r },
    dayan: { cx: width * 0.745, cy: height * 0.5, r: r * 0.8 },
  };
}

// The drum and zone under a point, or null off the drums.
export function zoneAt(layout, x, y) {
  for (const drum of ['dayan', 'bayan']) {
    const d = layout[drum];
    const dx = (x - d.cx) / d.r;
    const dy = (y - d.cy) / d.r;
    const r = Math.hypot(dx, dy);
    if (r > ZONES.edge) continue;
    if (drum === 'dayan') return { drum, zone: r < ZONES.syahi ? 'syahi' : r < ZONES.sur ? 'sur' : 'kinar' };
    if (Math.hypot(dx, dy - BAYAN_SYAHI.dy) < BAYAN_SYAHI.r) return { drum, zone: 'syahi' };
    return { drum, zone: dy > HEEL ? 'heel' : 'maidan' };
  }
  return null;
}

const DAYAN_BOL = { kinar: 'Na', sur: 'Tin', syahi: 'Tu' };

// The bol of the two drums struck together.
export function bothBol(dayan, bayan) {
  if (bayan === 'Ge' && dayan === 'Na') return 'Dha';
  if (bayan === 'Ge' && dayan === 'Tin') return 'Dhin';
  return `${dayan}+${bayan}`;
}

// Bols written differently that are played the same way.
const SAME = { ta: 'na', te: 'ti', re: 'ra', tun: 'tu', ghe: 'ge', ga: 'ge', ka: 'ke', ki: 'ke', kat: 'ke', dhi: 'dhin' };
export const plainBol = (bol) => SAME[bol.toLowerCase()] || bol.toLowerCase();
export const sameBol = (want, got) => want === 'X' || (!!got && plainBol(want) === plainBol(got));

// Turns touches into strokes. play(bol, velocity) sounds a bol at once and
// returns its voices ({ damp(), bend(rate) }; may be empty); report(stroke)
// receives each finished stroke: { bol, hand, parts, at (ms of the first
// touch), time (the caller's clock, from down()), closed }.
export class TouchStrokes {
  constructor({ play, report, now = () => performance.now(), later = (fn, ms) => setTimeout(fn, ms) }) {
    Object.assign(this, { play, report, now, later });
    this.touches = new Map();  // id → { drum, zone, y0, y, radius, group }
    this.groups = [];
    this.ringing = [];         // { voice, until } of Ge strokes, for bending
  }

  // A finger touched `where` ({ drum, zone }). `palm`: the touch is as big as
  // a palm. `y` and `radius`: its height on screen and the drum's radius (for
  // bending). `time`: the caller's clock at the touch, passed on in reports.
  down(id, where, { velocity = 0.9, palm = false, y = 0, radius = 1, time = null } = {}) {
    const at = this.now();
    const touch = { ...where, y0: y, y, radius, down: true };
    this.touches.set(id, touch);
    // The heel of the hand resting on the bayan: silent; it only bends.
    if (where.zone === 'heel') return;
    let group = this.groups.find((g) => g.drum === where.drum && !g.done && at - g.at < TOGETHER);
    if (group) {
      touch.group = group;
      group.ids.add(id);
      this.join(group, touch, velocity, palm);
      return;
    }
    let bol = where.drum === 'dayan' ? DAYAN_BOL[where.zone] : where.zone === 'syahi' || palm ? 'Ke' : 'Ge';
    group = { drum: where.drum, zone: where.zone, at, time, ids: new Set([id]), bol, velocity, closed: bol === 'Ke', done: false };
    group.voices = this.sound(group, bol, velocity);
    touch.group = group;
    this.groups = this.groups.filter((g) => at - g.at < 2000);
    this.groups.push(group);
    this.later(() => this.settle(group), HOLD);
    this.later(() => this.finish(group), HOLD + TOGETHER + 10);
  }

  // Slides a finger. On the bayan it bends a ringing Ge.
  move(id, y) {
    const touch = this.touches.get(id);
    if (!touch) return;
    touch.y = y;
    if (touch.drum === 'bayan') this.bend();
  }

  up(id) {
    const touch = this.touches.get(id);
    if (!touch) return;
    touch.down = false;
    this.touches.delete(id);
    if (touch.drum === 'bayan') this.bend();
  }

  sound(group, bol, velocity) {
    const voices = this.play(bol, velocity) || [];
    if (bol === 'Ge') {
      const until = this.now() + RING;
      voices.forEach((voice) => this.ringing.push({ voice, until }));
      const rise = this.rise();
      if (rise > 1) voices.forEach((v) => v.bend(rise));
    }
    return voices;
  }

  // How high the bayan is pressed: the heel slid furthest up the drum.
  rise() {
    let most = 0;
    for (const t of this.touches.values()) {
      if (t.drum === 'bayan' && t.down) most = Math.max(most, Math.min(1, Math.max(0, (t.y0 - t.y) / t.radius)));
    }
    return 1 + BEND * most;
  }

  bend() {
    const at = this.now();
    this.ringing = this.ringing.filter((r) => r.until > at);
    const rate = this.rise();
    this.ringing.forEach((r) => r.voice.bend(rate));
  }

  // Another finger joined a stroke just begun on the same drum.
  join(group, touch, velocity, palm) {
    if (group.drum === 'dayan' && group.bol === 'Tu' && touch.zone === 'syahi') {
      // Two fingers in the centre: the closed stroke Ti.
      group.voices.forEach((v) => v.damp());
      group.bol = 'Ti';
      group.closed = true;
      group.voices = this.sound(group, 'Ti', velocity);
    } else if (group.drum === 'bayan' && group.bol === 'Ge' && (group.ids.size >= FLAT || palm)) {
      // A flat hand: the slap Ke.
      group.voices.forEach((v) => v.damp());
      group.bol = 'Ke';
      group.closed = true;
      group.voices = this.sound(group, 'Ke', velocity);
    }
  }

  // A finger still on the dayan's skin damps it.
  settle(group) {
    if (group.drum !== 'dayan' || group.closed) return;
    if (![...group.ids].some((id) => this.touches.get(id)?.down)) return;
    group.voices.forEach((v) => v.damp());
    group.closed = true;
    if (group.bol === 'Tu') group.bol = 'Ra';
  }

  finish(group) {
    group.done = true;
    if (group.reported) return;
    const other = this.groups.find((g) => g !== group && g.drum !== group.drum && !g.reported && Math.abs(g.at - group.at) < TOGETHER);
    // The other hand's stroke is not settled yet: it will report both.
    if (other && !other.done) return;
    group.reported = true;
    if (other) {
      other.reported = true;
      const [d, b] = group.drum === 'dayan' ? [group, other] : [other, group];
      this.report({ bol: bothBol(d.bol, b.bol), hand: 'both', parts: [d.bol, b.bol], at: Math.min(d.at, b.at), time: d.at <= b.at ? d.time : b.time, closed: d.closed });
      return;
    }
    this.report({ bol: group.bol, hand: group.drum === 'dayan' ? 'right' : 'left', parts: [group.bol], at: group.at, time: group.time, closed: group.closed });
  }
}
