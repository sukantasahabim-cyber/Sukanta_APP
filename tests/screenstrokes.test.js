import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drumLayout, zoneAt, TouchStrokes, sameBol, bothBol, BEND } from '../js/analysis/screenstrokes.js';

// A pretend clock and sound: every bol played becomes a voice that remembers
// whether it was damped and how far it was bent.
function rig() {
  let now = 0;
  let timers = [];
  const played = [];
  const reports = [];
  const strokes = new TouchStrokes({
    now: () => now,
    later: (fn, ms) => timers.push({ at: now + ms, fn }),
    play: (bol) => {
      const voice = { bol, damped: false, rate: 1, damp() { this.damped = true; }, bend(r) { this.rate = r; } };
      played.push(voice);
      return [voice];
    },
    report: (s) => reports.push(s),
  });
  const wait = (ms) => {
    const end = now + ms;
    for (;;) {
      timers.sort((a, b) => a.at - b.at);
      if (!timers.length || timers[0].at > end) break;
      const next = timers.shift();
      now = next.at;
      next.fn();
    }
    now = end;
  };
  const dayan = (zone) => ({ drum: 'dayan', zone });
  const bayan = (zone) => ({ drum: 'bayan', zone });
  return { strokes, played, reports, wait, dayan, bayan };
}

test('the drums sit side by side, and every part of them is a zone', () => {
  const layout = drumLayout(800, 400);
  const { dayan: d, bayan: b } = layout;
  assert.ok(b.r > d.r && b.cx < d.cx);
  assert.deepEqual(zoneAt(layout, d.cx, d.cy), { drum: 'dayan', zone: 'syahi' });
  assert.equal(zoneAt(layout, d.cx + 0.6 * d.r, d.cy).zone, 'sur');
  assert.equal(zoneAt(layout, d.cx, d.cy - 0.95 * d.r).zone, 'kinar');
  assert.equal(zoneAt(layout, d.cx - 1.1 * d.r, d.cy).zone, 'kinar');
  assert.equal(zoneAt(layout, d.cx, d.cy + 1.3 * d.r), null);
  assert.deepEqual(zoneAt(layout, b.cx, b.cy + 0.3 * b.r), { drum: 'bayan', zone: 'syahi' });
  assert.deepEqual(zoneAt(layout, b.cx, b.cy - 0.6 * b.r), { drum: 'bayan', zone: 'maidan' });
  assert.deepEqual(zoneAt(layout, b.cx + 0.2 * b.r, b.cy + 0.85 * b.r), { drum: 'bayan', zone: 'heel' });
  // A phone held upright: the drums one above the other, bigger, inside the screen.
  const tall = drumLayout(390, 800);
  assert.ok(tall.dayan.cy < tall.bayan.cy && tall.bayan.r > layout.bayan.r * (390 / 800));
  for (const [d, edge] of [[tall.bayan, 1.22], [tall.dayan, 1.26]]) {
    assert.ok(d.cx - edge * d.r >= 0 && d.cx + edge * d.r <= 390 && d.cy + edge * d.r <= 800);
  }
  assert.ok(Math.hypot(tall.dayan.cx - tall.bayan.cx, tall.dayan.cy - tall.bayan.cy) > 1.22 * tall.bayan.r + 1.26 * tall.dayan.r);
});

test('quick taps on the dayan ring: Na on the rim, Tin on the sur, Tu in the centre', () => {
  const r = rig();
  for (const [zone, bol] of [['kinar', 'Na'], ['sur', 'Tin'], ['syahi', 'Tu']]) {
    r.strokes.down(1, r.dayan(zone));
    r.wait(20);
    r.strokes.up(1);
    r.wait(300);
    const last = r.reports.at(-1);
    assert.deepEqual([last.bol, last.hand, last.closed], [bol, 'right', false]);
    assert.equal(r.played.at(-1).damped, false);
  }
});

test('a finger left on the dayan damps it: Tu becomes Ra', () => {
  const r = rig();
  r.strokes.down(1, r.dayan('syahi'));
  r.wait(150);
  assert.equal(r.played.at(-1).damped, true);
  assert.deepEqual([r.reports.at(-1).bol, r.reports.at(-1).closed], ['Ra', true]);
  r.strokes.up(1);
  r.strokes.down(2, r.dayan('kinar'));
  r.wait(150);
  assert.deepEqual([r.reports.at(-1).bol, r.reports.at(-1).closed], ['Na', true]);
});

test('two fingers together in the centre play Ti', () => {
  const r = rig();
  r.strokes.down(1, r.dayan('syahi'));
  r.wait(15);
  r.strokes.down(2, r.dayan('syahi'));
  r.wait(10);
  r.strokes.up(1);
  r.strokes.up(2);
  r.wait(300);
  assert.equal(r.reports.length, 1);
  assert.equal(r.reports[0].bol, 'Ti');
  assert.deepEqual(r.played.map((v) => [v.bol, v.damped]), [['Tu', true], ['Ti', false]]);
});

test('the bayan: Ge on the open skin, Ke on the black spot or with a flat hand', () => {
  const r = rig();
  r.strokes.down(1, r.bayan('maidan'));
  r.wait(200);
  r.strokes.up(1);
  assert.equal(r.reports.at(-1).bol, 'Ge');
  assert.equal(r.played.at(-1).damped, false, 'a finger on the bayan does not damp it');
  r.wait(300);
  r.strokes.down(2, r.bayan('syahi'));
  r.wait(20);
  r.strokes.up(2);
  r.wait(300);
  assert.equal(r.reports.at(-1).bol, 'Ke');
  // Three fingers at once.
  [3, 4, 5].forEach((id, k) => { r.wait(k ? 10 : 0); r.strokes.down(id, r.bayan('maidan')); });
  r.wait(300);
  assert.equal(r.reports.at(-1).bol, 'Ke');
  assert.equal(r.reports.filter((s) => s.bol === 'Ke').length, 2);
  // A palm.
  r.strokes.down(6, r.bayan('maidan'), { palm: true });
  r.wait(300);
  assert.equal(r.reports.at(-1).bol, 'Ke');
});

test('both hands together make Dha and Dhin; apart they stay two strokes', () => {
  const r = rig();
  r.strokes.down(1, r.dayan('kinar'));
  r.wait(25);
  r.strokes.down(2, r.bayan('maidan'));
  r.wait(10);
  r.strokes.up(1);
  r.strokes.up(2);
  r.wait(300);
  assert.deepEqual(r.reports.map((s) => [s.bol, s.hand]), [['Dha', 'both']]);
  assert.deepEqual(r.reports[0].parts, ['Na', 'Ge']);
  r.strokes.down(3, r.bayan('maidan'), { time: 5 });
  r.wait(30);
  r.strokes.down(4, r.dayan('sur'), { time: 5.03 });
  r.wait(10);
  r.strokes.up(3);
  r.strokes.up(4);
  r.wait(300);
  assert.equal(r.reports.at(-1).bol, 'Dhin');
  assert.equal(r.reports.at(-1).time, 5, 'the stroke is timed by the first touch');
  r.strokes.down(5, r.dayan('kinar'));
  r.wait(80);
  r.strokes.down(6, r.bayan('maidan'));
  r.wait(300);
  assert.deepEqual(r.reports.slice(-2).map((s) => s.bol), ['Na', 'Ge']);
  assert.equal(bothBol('Tu', 'Ke'), 'Tu+Ke');
});

test('the heel sliding up the bayan bends a ringing Ge, and lets it fall back', () => {
  const r = rig();
  r.strokes.down('heel', r.bayan('heel'), { y: 300, radius: 100 });
  r.wait(400);
  assert.deepEqual([r.played.length, r.reports.length], [0, 0], 'the resting heel is silent');
  r.strokes.down('finger', r.bayan('maidan'), { y: 200, radius: 100 });
  r.wait(20);
  r.strokes.up('finger');
  const ge = r.played.at(-1);
  assert.equal(ge.bol, 'Ge');
  r.strokes.move('heel', 250);
  assert.ok(Math.abs(ge.rate - (1 + BEND * 0.5)) < 1e-9);
  r.strokes.move('heel', 150);
  assert.ok(Math.abs(ge.rate - (1 + BEND)) < 1e-9, 'no further than the whole radius');
  r.strokes.up('heel');
  assert.equal(ge.rate, 1);
  // A Ge struck while the heel is already pressed starts high.
  r.strokes.down('heel2', r.bayan('maidan'), { y: 300, radius: 100 });
  r.strokes.move('heel2', 260);
  r.wait(400);
  r.strokes.down('finger2', r.bayan('maidan'), { y: 200, radius: 100 });
  assert.ok(Math.abs(r.played.at(-1).rate - (1 + BEND * 0.4)) < 1e-9);
});

test('bols written differently but played alike count as the same', () => {
  assert.ok(sameBol('Ta', 'Na'));
  assert.ok(sameBol('Te', 'Ti'));
  assert.ok(sameBol('Dhi', 'Dhin'));
  assert.ok(sameBol('Ka', 'Ke') && sameBol('Kat', 'Ke') && sameBol('Ghe', 'Ge'));
  assert.ok(sameBol('X', 'Tu'));
  assert.ok(!sameBol('Na', 'Tin'));
  assert.ok(!sameBol('Dha', null));
});
