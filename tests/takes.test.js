import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TakeRecorder, trackPlan, wavBytes } from '../js/audio/takes.js';

test('a take keeps every sample and is scaled to a steady peak', () => {
  const rec = new TakeRecorder(10, 1);
  rec.push(new Float32Array([0.1, -0.2, 0.05]));
  rec.push(new Float32Array([0.2, 0, 0, 0, 0, 0, 0, 0, 0.3]));   // only 7 more fit in one second
  assert.equal(rec.length, 10);
  const s = rec.samples(0.9);
  assert.equal(s.length, 10);
  assert.ok(Math.abs(Math.max(...s.map(Math.abs)) - 0.9) < 1e-3);
  assert.ok(Math.abs(s[1] / s[0] + 2) < 1e-3);
});

test('the track is lined up with the voice, across a seek', () => {
  // Track started at ctx 10.0 from 0 s; the singer began at ctx 10.5 (as sung).
  assert.deepEqual(trackPlan([{ since: 10, startedAt: 10 }], 10.5, 30), [{ at: 0, offset: 0.5, until: 30 }]);
  // Voice started before the track: the track comes in 1 s later, from where it was started (20 s).
  assert.deepEqual(trackPlan([{ since: 11, startedAt: -9 }], 10, 5), [{ at: 1, offset: 20, until: 5 }]);
  // A seek at ctx 15 to 60 s into the track.
  const plan = trackPlan([{ since: 10, startedAt: 10 }, { since: 15, startedAt: 15 - 60 }], 10, 20);
  assert.deepEqual(plan, [{ at: 0, offset: 0, until: 5 }, { at: 5, offset: 60, until: 20 }]);
  // Moving the voice later (+0.2 s) starts the music 0.2 s further in.
  assert.ok(Math.abs(trackPlan([{ since: 10, startedAt: 10 }], 10.2, 5)[0].offset - 0.2) < 1e-9);
});

test('WAV files have a correct header and 16-bit samples', () => {
  const bytes = wavBytes([new Float32Array([0, 1, -1]), new Float32Array([0.5, 0, 0])], 48000);
  const v = new DataView(bytes.buffer);
  const str = (o, n) => String.fromCharCode(...bytes.slice(o, o + n));
  assert.equal(str(0, 4), 'RIFF');
  assert.equal(str(8, 4), 'WAVE');
  assert.equal(v.getUint16(22, true), 2);
  assert.equal(v.getUint32(24, true), 48000);
  assert.equal(v.getUint32(40, true), 12);
  assert.equal(bytes.length, 56);
  assert.equal(v.getInt16(44 + 4, true), 32767);   // frame 1, left
  assert.equal(v.getInt16(44 + 8, true), -32768);  // frame 2, left
  assert.equal(v.getInt16(44 + 2, true), 16383);   // frame 0, right
});
