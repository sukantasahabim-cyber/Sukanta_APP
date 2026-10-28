import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findProblems, openProblems, drillFor, pruneAttempts } from '../js/data/coach.js';

const now = new Date('2026-10-28T18:00:00Z');
const day = (d, h = 10) => new Date(Date.UTC(2026, 9, d, h)).toISOString();
let n = 0;
const attempt = (at, obs, extra = {}) => ({ id: `a${n++}`, at, course: 'singing', lesson: 'sing-sargam', ex: 0, obs, ...extra });
const notes = (sw, cents) => cents.map((c) => ({ k: 'note', sw, c }));

test('nothing to fix without practice, or when everything was right', () => {
  assert.deepEqual(findProblems([], { now }), []);
  const good = [attempt(day(27), notes('G', [3, -5, 8])), attempt(day(28), notes('G', [0, 4]))];
  assert.deepEqual(findProblems(good, { now }), []);
});

test('a swara sung flat again and again is found, with its progress', () => {
  const attempts = [
    attempt(day(22), notes('G', [-30, -28, -26])),
    attempt(day(25), notes('G', [-20, -22])),
    attempt(day(28), notes('G', [-12, -9, -18])),
  ];
  const [p] = findProblems(attempts, { now });
  assert.equal(p.id, 'flat:singing:G');
  assert.equal(p.kind, 'flat');
  assert.equal(p.value, 21);
  assert.equal(p.count, 6);
  assert.equal(p.total, 8);
  assert.equal(p.before.value, -28);
  assert.equal(p.now.value, -12);
  assert.equal(p.status, 'better');  // 3 of 3 low on the first day, 2 of 3 on the latest
});

test('one bad note is not a pattern', () => {
  const attempts = [attempt(day(27), notes('R', [-40])), attempt(day(28), notes('R', [2, -3]))];
  assert.deepEqual(findProblems(attempts, { now }), []);
});

test('singing another note instead of the swara is a separate problem', () => {
  const attempts = [attempt(day(27), notes('M', [-100, 5])), attempt(day(28), notes('M', [-95, 0, 2]))];
  const [p] = findProblems(attempts, { now });
  assert.equal(p.kind, 'wrong');
  assert.equal(p.count, 2);
  assert.equal(p.total, 5);
});

test('the last three tries being right marks a problem as fixed', () => {
  const attempts = [
    attempt(day(26), notes('G', [-30, -28, -26, -25])),
    attempt(day(28), notes('G', [-4, 2, 6])),
  ];
  const [p] = findProblems(attempts, { now });
  assert.equal(p.status, 'fixed');
  assert.deepEqual(openProblems([p]), []);
});

test('old practice drops out of the week', () => {
  const attempts = [attempt(day(10), notes('G', [-30, -30, -30]))];
  assert.deepEqual(findProblems(attempts, { now }), []);
});

test('tabla: a bol that keeps coming late, and the exercise to drill', () => {
  const strokes = (s) => s.map((x, i) => ({ k: 'stroke', b: i % 2 ? 'Tin' : 'Na', s: x }));
  const attempts = [
    attempt(day(27), strokes(['late', 'ok', 'late', 'ok', 'ok', 'ok']), { course: 'tabla', lesson: 'tabla-tin', ex: 1 }),
    attempt(day(28), strokes(['late', 'ok', 'ok', 'ok', 'late', 'ok']), { course: 'tabla', lesson: 'tabla-tin', ex: 1 }),
  ];
  const problems = findProblems(attempts, { now });
  assert.equal(problems.length, 1);
  const [p] = problems;
  assert.equal(p.id, 'late:tabla:Na');
  assert.equal(p.count, 4);
  assert.equal(p.total, 6);
  assert.deepEqual(p.source, { lesson: 'tabla-tin', ex: 1 });
  assert.deepEqual(drillFor(p, 80), { rhythm: p.source, startBpm: 55, targetBpm: 80, step: 5 });
});

test('tabla: the wrong sound remembers what it sounded like', () => {
  const obs = [{ k: 'stroke', b: 'Dha', s: 'sound', f: 'dayan' }, { k: 'stroke', b: 'Dha', s: 'ok' }];
  const attempts = [attempt(day(27), obs, { course: 'tabla' }), attempt(day(28), [...obs, obs[0]], { course: 'tabla' })];
  const [p] = findProblems(attempts, { now });
  assert.equal(p.kind, 'sound');
  assert.equal(p.heard, 'dayan');
});

test('speeding up is found from the tempo played', () => {
  const tempo = (r) => [{ k: 'tempo', r, bpm: 60 }];
  const attempts = [attempt(day(26), tempo(1.1), { course: 'tabla' }), attempt(day(27), tempo(1.08), { course: 'tabla' }), attempt(day(28), tempo(1.02), { course: 'tabla' })];
  const [p] = findProblems(attempts, { now });
  assert.equal(p.kind, 'rushing');
  assert.equal(p.value, 8);
  assert.equal(p.status, 'better');
  assert.equal(drillFor(p, 60).startBpm, 50);
});

test('wobbly held notes, and drills for singing problems', () => {
  const attempts = [attempt(day(27), [{ k: 'steady', w: 25 }]), attempt(day(28), [{ k: 'steady', w: 20 }])];
  const [p] = findProblems(attempts, { now });
  assert.equal(p.kind, 'steady');
  assert.equal(drillFor(p).steps.length, 2);
  assert.deepEqual(drillFor({ kind: 'flat', key: 'g' }).steps.map((s) => s.notes || s.note), ['g', 'S g S g']);
  assert.deepEqual(drillFor({ kind: 'sharp', key: 'S' }).steps[1].notes, 'S P S');
});

test('problems can be limited to one course, worst first', () => {
  const attempts = [
    attempt(day(27), notes('G', [-30, -30, -30, -30])),
    attempt(day(28), notes('P', [25, 25, 25])),
    attempt(day(28), [{ k: 'tempo', r: 0.9, bpm: 60 }, { k: 'tempo', r: 0.9, bpm: 60 }], { course: 'tabla' }),
  ];
  assert.deepEqual(findProblems(attempts, { now }).map((p) => p.id), ['flat:singing:G', 'sharp:singing:P', 'dragging:tabla:tempo']);
  assert.deepEqual(findProblems(attempts, { now, course: 'tabla' }).map((p) => p.id), ['dragging:tabla:tempo']);
});

test('only the last month of attempts is kept', () => {
  const kept = pruneAttempts({ old: { at: '2026-09-20T10:00:00.000Z' }, recent: { at: day(27) } }, now);
  assert.deepEqual(Object.keys(kept), ['recent']);
});
