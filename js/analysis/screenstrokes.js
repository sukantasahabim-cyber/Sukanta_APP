// The on-screen tabla's rules, apart from drawing and sound (those are in
// widgets/screentabla.js): which stroke each touch makes, as on a real tabla.
//
//   Dayan (right drum): the rim (kinar) → Na; the open skin (sur) → Tin;
//   the black centre (syahi) → Tu. A finger kept on the skin damps the
//   sound, as on a real drum (Tu then becomes Ra). Two fingers landing
//   together in the centre → Ti. A finger resting nearer the centre while
//   another strikes further out (the ring finger, in Na and Tin) only goes
//   with that stroke.
//   Bayan (left drum): the open skin → Ge; the black spot, or a flat hand
//   (three fingers or more at once) → Ke. The edge nearest the player is
//   where the heel of the hand rests: touching it makes no sound, and
//   sliding it up, towards the middle, raises the pitch of a ringing Ge, as
//   pressing the skin does. (Any finger kept on the bayan does the same.)
//   Both drums together → Dha (Na + Ge) or Dhin (Tin + Ge).
//
// The glass feels every touch, so what a real tabla ignores is ignored here
// too: a palm resting on the screen is silent, the drums' shells do not
// sound, and a fingertip bouncing on the glass is still one stroke. The
// fingers of one stroke may land a moment apart; the stroke sounds once,
// when they are all down, and is reported a moment later, when it is clear
// whether the finger stayed and what the other hand did.

// Shares of a drum head's radius: the syahi, the sur, and how far beyond the
// head a touch still counts as the rim (further out is the shell).
export const ZONES = { syahi: 0.42, sur: 0.8, edge: 1.08 };
const BAYAN_EDGE = 1.04;
// The bayan's syahi sits towards the player (down the screen); below it,
// the heel of the hand rests.
export const BAYAN_SYAHI = { dy: 0.3, r: 0.36 };
export const HEEL = 0.68;
export const GATHER = 30;     // ms the fingers of one stroke may land apart before it sounds
export const HOLD = 120;      // ms after the touch at which a finger still on the dayan damps it (a quick tap on glass lasts less)
export const TOGETHER = 50;   // ms within which strokes on the two drums are one (Dha)
export const BOUNCE = 110;    // ms in which a finger landing again on the same spot is the same stroke
const BOUNCE_REACH = 0.2;     // …that spot, as a share of the drum's radius
export const FLAT = 3;        // fingers landing together on the bayan: a flat hand
export const BEND = 0.35;     // how far (×) the bayan rises with the heel slid across its radius
const RING = 2600;            // ms a Ge rings, for bending it

// Where the two drums sit on a screen `width` × `height` (CSS px): the
// bayan on the left, a little bigger, the dayan on the right. On a tall
// screen (a phone held upright) they sit on a slant, one above the other,
// so they can be bigger (`tall`).
export function drumLayout(width, height) {
  if (height > width * 1.15) {
    const r = Math.min(width * 0.34, height * 0.24);
    return {
      tall: true,
      bayan: { cx: width * 0.42, cy: height * 0.7, r },
      dayan: { cx: width * 0.58, cy: height * 0.3, r: r * 0.8 },
    };
  }
  const r = Math.min(width * 0.2, height * 0.4);
  return {
    tall: false,
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
    if (r > (drum === 'dayan' ? ZONES.edge : BAYAN_EDGE)) continue;
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
// receives each finished stroke: { bol, hand, parts, ids (its touches),
// at (ms of the first touch), time (the caller's clock, from down()), closed }.
export class TouchStrokes {
  constructor({ play, report, now = () => performance.now(), later = (fn, ms) => setTimeout(fn, ms) }) {
    Object.assign(this, { play, report, now, later });
    this.touches = new Map();  // id → { drum, zone, x, y0, y, radius, down, group }
    this.groups = [];
    this.ringing = [];         // { voice, until } of Ge strokes, for bending
  }

  // A finger touched `where` ({ drum, zone }) at x, y on the screen; `radius`
  // is that drum's. `palm`: the touch is as big as a palm. `time`: the
  // caller's clock at the touch, passed on in reports. Returns what the touch
  // became: 'stroke' (it begins one), 'joined' (another finger of a stroke
  // just begun), 'rest' (a resting hand: silent) or 'bounce' (the stroke
  // before, again: silent).
  down(id, where, { velocity = 0.9, palm = false, x = 0, y = 0, radius = 1, time = null } = {}) {
    const at = this.now();
    const touch = { ...where, id, x, y0: y, y, radius, down: true };
    this.touches.set(id, touch);
    // A hand resting on the drum (the heel's place on the bayan, or a whole
    // palm anywhere) is silent, as on a real tabla; on the bayan it bends Ge.
    if (where.zone === 'heel' || palm) return 'rest';
    // A fingertip that bounced on the glass and landed again on the same spot.
    const bounced = this.groups.some((g) => g.drum === where.drum && at - g.at < BOUNCE
      && g.fingers.every((f) => !f.down)
      && g.fingers.some((f) => !f.cancelled && Math.hypot(f.x - x, f.y0 - y) < BOUNCE_REACH * radius));
    if (bounced) return 'bounce';
    // A stroke whose touches were all taken back takes no more fingers.
    let group = this.groups.find((g) => g.drum === where.drum && !g.silent && at - g.at < TOGETHER);
    if (group) {
      touch.group = group;
      group.fingers.push(touch);
      if (group.sounded) this.late(group, touch);
      return 'joined';
    }
    group = { drum: where.drum, at, time, fingers: [touch], velocity, voices: [], sounded: false, closed: false, done: false };
    touch.group = group;
    this.groups = this.groups.filter((g) => at - g.at < 2000);
    this.groups.push(group);
    this.later(() => this.strike(group), GATHER);
    this.later(() => this.settle(group), HOLD);
    this.later(() => this.finish(group), HOLD + TOGETHER + 10);
    return 'stroke';
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

  // The phone took a touch back (it judged it a palm, say): it never counts.
  cancel(id) {
    const touch = this.touches.get(id);
    if (touch) touch.cancelled = true;
    this.up(id);
  }

  // The stroke sounds once its fingers are down. On the dayan two fingers in
  // the centre make Ti; otherwise the finger furthest out strikes (one
  // resting nearer the centre goes with it). On the bayan the black spot or
  // a flat hand make Ke.
  strike(group) {
    const fingers = group.fingers.filter((f) => !f.cancelled);
    if (!fingers.length) { group.silent = true; return; }
    if (group.drum === 'dayan') {
      const centre = fingers.filter((f) => f.zone === 'syahi');
      group.lead = centre.length >= 2 ? centre
        : [fingers.find((f) => f.zone === 'kinar') || fingers.find((f) => f.zone === 'sur') || fingers[0]];
      group.bol = centre.length >= 2 ? 'Ti' : DAYAN_BOL[group.lead[0].zone];
    } else {
      group.bol = fingers.some((f) => f.zone === 'syahi') || fingers.length >= FLAT ? 'Ke' : 'Ge';
    }
    group.closed = group.bol === 'Ti' || group.bol === 'Ke';
    group.voices = this.sound(group.bol, group.velocity);
    group.sounded = true;
  }

  sound(bol, velocity) {
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

  // A finger landing just after its stroke sounded changes it, as it would
  // on a real drum: a second finger in the centre makes Ti, a third on the
  // bayan makes the flat Ke.
  late(group, touch) {
    const swap = (bol) => {
      // The first sound stops at once, so the stroke is heard once.
      group.voices.forEach((v) => v.damp(undefined, 0.005));
      group.bol = bol;
      group.closed = true;
      group.voices = this.sound(bol, group.velocity);
    };
    if (group.drum === 'dayan' && group.bol === 'Tu' && touch.zone === 'syahi') {
      group.lead.push(touch);
      swap('Ti');
    } else if (group.drum === 'bayan' && group.bol === 'Ge' && group.fingers.filter((f) => !f.cancelled).length >= FLAT) {
      swap('Ke');
    }
  }

  // The finger that struck the dayan, still on its skin, damps it (one only
  // resting beside it, as the ring finger does in Na, does not).
  settle(group) {
    if (group.drum !== 'dayan' || !group.sounded || group.closed) return;
    if (!group.lead.some((f) => f.down && !f.cancelled)) return;
    group.voices.forEach((v) => v.damp());
    group.closed = true;
    if (group.bol === 'Tu') group.bol = 'Ra';
  }

  finish(group) {
    group.done = true;
    if (group.reported || group.silent) return;
    const other = this.groups.find((g) => g !== group && g.drum !== group.drum && !g.reported && !g.silent && Math.abs(g.at - group.at) < TOGETHER);
    // The other hand's stroke is not settled yet: it will report both.
    if (other && !other.done) return;
    group.reported = true;
    const ids = (g) => g.fingers.map((f) => f.id);
    if (other) {
      other.reported = true;
      const [d, b] = group.drum === 'dayan' ? [group, other] : [other, group];
      this.report({ bol: bothBol(d.bol, b.bol), hand: 'both', parts: [d.bol, b.bol], ids: [...ids(d), ...ids(b)], at: Math.min(d.at, b.at), time: d.at <= b.at ? d.time : b.time, closed: d.closed });
      return;
    }
    this.report({ bol: group.bol, hand: group.drum === 'dayan' ? 'right' : 'left', parts: [group.bol], ids: ids(group), at: group.at, time: group.time, closed: group.closed });
  }
}
