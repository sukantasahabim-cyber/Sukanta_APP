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
