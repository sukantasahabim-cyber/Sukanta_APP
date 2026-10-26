import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeBackup, parseBackup } from '../js/store.js';

test('progress backups round-trip', () => {
  const state = { completed: { 'tabla-na': '2026-01-01' }, log: { '2026-01-01': 25 }, practice: {}, practicePassed: {}, practiceDone: {}, settings: { saMidi: 49 } };
  const restored = parseBackup(makeBackup(state));
  assert.deepEqual(restored.completed, state.completed);
  assert.equal(restored.log['2026-01-01'], 25);
  assert.equal(restored.settings.saMidi, 49);
  assert.equal(restored.carrySeconds, 0);  // missing fields get defaults
});

test('rejects files that are not backups', () => {
  assert.throws(() => parseBackup('hello'), /not a SurTaal/);
  assert.throws(() => parseBackup('{"app":"other","state":{}}'), /not a SurTaal/);
  assert.throws(() => parseBackup(JSON.stringify({ app: 'surtaal', state: { log: { x: 'lots' } } })), /damaged/);
  assert.throws(() => parseBackup(JSON.stringify({ app: 'surtaal', state: { completed: [] } })), /damaged/);
});

test('merging two devices keeps all progress and settles', async () => {
  const { mergeProgress } = await import('../js/store.js');
  const phone = {
    completed: { a: '2026-01-02', b: '2026-01-05' }, log: { '2026-01-05': 20 },
    practice: { a: { 0: 70 } }, practicePassed: { a: { 0: true } }, badges: { first: '2026-01-02' },
    mySongs: { 'my-1': { id: 'my-1', title: 'Phone copy', saved: '2026-01-06' } },
    compositions: { 'c-1': { id: 'c-1', saved: '2026-01-01' } },
    settings: { saMidi: 50, lang: 'bn' },
  };
  const laptop = {
    completed: { a: '2026-01-01', c: '2026-01-07' }, log: { '2026-01-05': 10, '2026-01-07': 15 },
    practice: { a: { 0: 90, 1: 40 } }, practicePassed: { a: { 1: true } }, badges: { first: '2026-01-03' },
    mySongs: { 'my-1': { id: 'my-1', title: 'Old', saved: '2026-01-04' }, 'my-2': { id: 'my-2', saved: '2026-01-03' } },
    compositions: {}, removed: { 'c-1': '2026-01-02' },
    settings: { saMidi: 45, lang: 'en', dailyGoal: 30 },
  };
  const m = mergeProgress(phone, laptop);
  assert.deepEqual(m.completed, { a: '2026-01-01', b: '2026-01-05', c: '2026-01-07' });
  assert.deepEqual(m.log, { '2026-01-05': 20, '2026-01-07': 15 });
  assert.deepEqual(m.practice.a, { 0: 90, 1: 40 });
  assert.deepEqual(m.practicePassed.a, { 0: true, 1: true });
  assert.equal(m.badges.first, '2026-01-02');
  assert.equal(m.mySongs['my-1'].title, 'Phone copy');
  assert.ok(m.mySongs['my-2']);
  assert.deepEqual(m.compositions, {}, 'a composition deleted on another device stays deleted');
  assert.equal(m.settings.saMidi, 50, "this device's settings win");
  assert.equal(m.settings.dailyGoal, 30);
  assert.deepEqual(mergeProgress(m, laptop), m, 'merging again changes nothing');
  assert.deepEqual(mergeProgress(m, phone), m);
});

test('a reset on one device wins over older progress', async () => {
  const { mergeProgress } = await import('../js/store.js');
  const fresh = { resetAt: '2026-02-01T10:00:00Z', settings: { lang: 'hi' } };
  const old = { completed: { a: '2026-01-01' }, settings: { lang: 'en' } };
  assert.deepEqual(mergeProgress(fresh, old).completed, {});
  const pulled = mergeProgress(old, fresh);
  assert.deepEqual(pulled.completed, {});
  assert.equal(pulled.settings.lang, 'en', 'settings stay with the device');
});
