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

test('backing tracks start with one taal cycle, then the song on sam', async () => {
  const { backingPlan } = await import('../js/audio/backing.js');
  const { getSong } = await import('../js/data/songs.js');
  const { TAALS } = await import('../js/data/taals.js');
  const song = getSong('sargam-song');
  const plan = backingPlan(song);
  const matras = TAALS[song.taal].matras;
  const beat = 60 / song.bpm;
  assert.equal(plan.intro, matras);
  assert.equal(plan.notes[0].time, matras * beat);
  assert.equal(plan.notes.length, song.lines.flatMap((l) => l.notes).filter((n) => n !== '-').length);
  assert.ok(plan.strokes.length >= plan.beats);
  assert.ok(plan.strokes.every((s) => s.bol !== '-' && s.time >= 0 && s.time < plan.beats * beat));
  assert.ok(Math.abs(plan.duration - (plan.beats * beat + 3)) < 1e-9);
});

test('MP3 files are made with valid frames at the chosen bit rate', async () => {
  const { mp3Bytes } = await import('../js/audio/mp3.js');
  const sr = 44100;
  const tone = new Float32Array(sr * 2).map((_, i) => 0.3 * Math.sin(2 * Math.PI * 440 * i / sr));
  const stereo = await mp3Bytes([tone, tone], sr, 128);
  assert.equal(stereo[0], 0xff);
  assert.equal(stereo[1] & 0xe0, 0xe0);                       // frame sync
  assert.ok(Math.abs(stereo.length - 2 * 128000 / 8) < 4000);  // about 2 s at 128 kbps
  const mono = await mp3Bytes([tone], sr, 128);
  assert.equal(mono[0], 0xff);
  assert.ok(mono.length > 20000);
});
