import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { OnsetDetector } from '../js/analysis/onsets.js';
import { NoteTracker } from '../js/analysis/notes.js';
import { scoreRhythm } from '../js/analysis/rhythm.js';
import { strumChroma, judgeChord } from '../js/analysis/chroma.js';
import { analyzeStroke, STROKE_BEFORE } from '../js/analysis/strokes.js';
import { renderString } from '../js/audio/ks.js';
import { CHORDS } from '../js/data/chords.js';
import { GUITAR_OPEN, midiToFreq } from '../js/music.js';

const SR = 48000;

function seeded(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

// A decaying tone plus a short noise click, like a struck drum.
function addHit(buf, at, { freq, decay, gain = 0.5, noise = 0.3, rand }) {
  const start = Math.round(at * SR);
  for (let i = 0; start + i < buf.length; i++) {
    const t = i / SR;
    buf[start + i] += gain * Math.exp(-t / decay) * Math.sin(2 * Math.PI * freq * t)
      + (t < 0.01 ? noise * (rand() * 2 - 1) * (1 - t / 0.01) : 0);
  }
}

test('onset detector finds struck notes within a few milliseconds', () => {
  const rand = seeded(3);
  const buf = new Float32Array(SR * 4);
  for (let i = 0; i < buf.length; i++) buf[i] = 0.002 * (rand() * 2 - 1);
  const times = [0.5, 1.1, 1.6, 2.3, 2.9, 3.4];
  times.forEach((t, k) => addHit(buf, t, { freq: k % 2 ? 100 : 330, decay: 0.3, rand }));
  const det = new OnsetDetector(SR);
  const found = [];
  for (let i = 0; i < buf.length; i += 1024) found.push(...det.push(buf.subarray(i, i + 1024)));
  assert.equal(found.length, times.length);
  found.forEach((idx, k) => assert.ok(Math.abs(idx / SR - times[k]) < 0.008, `onset ${k} at ${idx / SR}`));
});

test('note tracker turns a sung sequence into notes', () => {
  const tracker = new NoteTracker();
  const sung = [60, 62, 64, 62, 60];
  const notes = [];
  let t = 0;
  for (const m of sung) {
    for (let i = 0; i < 25; i++, t += 0.021) {
      const vibrato = 0.2 * Math.sin(t * 30);
      const n = tracker.frame(m + vibrato, t);
      if (n) notes.push(Math.round(n.midi));
    }
    for (let i = 0; i < 4; i++, t += 0.021) tracker.frame(null, t);  // consonant between notes
  }
  assert.deepEqual(notes, sung);
});

test('note tracker ignores a single glitchy reading', () => {
  const tracker = new NoteTracker();
  const notes = [];
  for (let i = 0; i < 40; i++) {
    const n = tracker.frame(i === 20 ? 72 : 60, i * 0.021);
    if (n) notes.push(n);
  }
  assert.equal(notes.length, 1);
});

test('rhythm scoring ignores constant delay and tempo drift but catches bad strokes', () => {
  const slots = [true, true, true, true, true, false, true, true];
  const slotDur = 0.75;
  // Played 5% slow with a 120 ms delay; stroke 3 is 200 ms late; the rest slot is played by mistake.
  const onsets = [0, 1, 2, 3, 4, 6, 7].map((k) => 0.12 + k * slotDur * 1.05 + (k === 3 ? 0.2 : 0));
  onsets.push(0.12 + 5 * slotDur * 1.05);
  onsets.sort((a, b) => a - b);
  const { results, extras, tempoRatio } = scoreRhythm(onsets, slots, slotDur);
  assert.equal(results.length, 7);
  assert.deepEqual(results.map((r) => r.status), ['ok', 'ok', 'ok', 'late', 'ok', 'ok', 'ok']);
  assert.equal(extras.length, 1);
  assert.ok(Math.abs(tempoRatio - 1 / 1.05) < 0.02);
});

test('rhythm scoring reports missed strokes', () => {
  const slots = new Array(8).fill(true);
  const onsets = [0, 1, 2, 4, 5, 6, 7].map((k) => k * 0.5);
  const { results } = scoreRhythm(onsets, slots, 0.5);
  assert.equal(results.filter((r) => r.status === 'missed').length, 1);
  assert.equal(results.find((r) => r.status === 'missed').slot, 3);
});

const chordNotes = (c) => c.frets.map((f, i) => (f < 0 ? null : GUITAR_OPEN[i] + f)).filter((m) => m != null);
const CANDIDATES = Object.entries(CHORDS).map(([name, c]) => ({ name, label: c.name, midis: chordNotes(c) }));

function strum(name, rand) {
  const mix = new Float32Array(Math.round(SR * 0.6));
  chordNotes(CHORDS[name]).forEach((m, k) => {
    const s = renderString(midiToFreq(m), SR, 0.6, rand);
    const gain = 0.15 + rand() * 0.3;
    const off = Math.round(k * 0.016 * SR);
    for (let i = 0; i + off < mix.length; i++) mix[i + off] += gain * s[i];
  });
  return mix;
}

test('recognises strummed chords and rejects the wrong ones', () => {
  const rand = seeded(11);
  let accepted = 0;
  let total = 0;
  for (const name of Object.keys(CHORDS)) {
    const chroma = strumChroma(strum(name, rand), SR);
    total++;
    if (judgeChord(chroma, name, CANDIDATES, SR).ok) accepted++;
  }
  assert.ok(accepted / total >= 0.9, `only ${accepted}/${total} chords accepted`);

  const wrong = [['Em', 'C'], ['Am', 'G'], ['D', 'Em'], ['G', 'Am'], ['C', 'D']];
  for (const [played, target] of wrong) {
    const verdict = judgeChord(strumChroma(strum(played, rand), SR), target, CANDIDATES, SR);
    assert.equal(verdict.ok, false, `${played} accepted as ${target}`);
  }
});

test('stroke analysis tells ringing, damped, bass and treble strokes apart', () => {
  const rand = seeded(5);
  const make = (parts) => {
    const buf = new Float32Array(Math.round(SR * 0.4));
    parts.forEach((p) => addHit(buf, STROKE_BEFORE, { ...p, rand }));
    return analyzeStroke(buf, SR).family;
  };
  const na = { freq: 300, decay: 0.12 };
  const ge = { freq: 95, decay: 0.15 };
  assert.equal(make([na]), 'dayan');
  assert.equal(make([ge]), 'bayan');
  assert.equal(make([na, ge]), 'both');
  assert.equal(make([{ freq: 1800, decay: 0.006, noise: 0.5 }]), 'closed');
  assert.equal(make([{ freq: 120, decay: 0.008, noise: 0.05 }]), 'slap');
});

test('every app file is cached for offline use', () => {
  const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  const walk = (dir) => readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
  const root = new URL('..', import.meta.url).pathname;
  for (const file of [...walk(join(root, 'js')), ...walk(join(root, 'icons')), ...walk(join(root, 'sounds')), join(root, 'css/styles.css')]) {
    const rel = file.slice(root.length);
    assert.ok(sw.includes(`'${rel}'`), `${rel} is missing from sw.js`);
  }
});

test('microphone check recommends a sensitivity for the room', async () => {
  const { recommendSensitivity } = await import('../js/widgets/micCheck.js');
  const quietRoom = new Array(40).fill(0.001);
  assert.equal(recommendSensitivity(quietRoom, new Array(80).fill(0.1)).setting, 'normal');
  assert.equal(recommendSensitivity(quietRoom, new Array(80).fill(0.015)).setting, 'quiet');
  assert.equal(recommendSensitivity(quietRoom, new Array(80).fill(0.003)).ok, false);
  const noisyRoom = new Array(40).fill(0.02);
  assert.equal(recommendSensitivity(noisyRoom, new Array(80).fill(0.2)).setting, 'noisy');
  assert.equal(recommendSensitivity(noisyRoom, new Array(80).fill(0.05)).ok, false);
});

import { scoreRhythm as _score } from '../js/analysis/rhythm.js';
import { syncModel, beatLabel, problemSpots, extraPositions } from '../js/analysis/sync.js';

test('sync map pinpoints missing and late strokes', () => {
  const slots = new Array(8).fill(true);
  const d = 0.5;
  // Beat 4 missing and beat 6 clearly late; the rest on the beat.
  const times = [0, 1, 2, 4, 5, 6, 7].map((k) => 1 + k * d + (k === 5 ? 0.18 : 0));
  const scored = _score(times, slots, d);
  const model = syncModel(scored, slots, 1);
  const spots = problemSpots(model).map((c) => `${c.label}:${c.status}`);
  assert.deepEqual(spots, ['4:missed', '6:late']);
  assert.equal(model.cells[0].status, 'ok');
  assert.ok(model.cells[5].offsetMs > 100);
  assert.equal(extraPositions(times, scored, slots, 1).length, 0);
});

test('beat labels count the way a learner does', () => {
  assert.equal(beatLabel(0, 2), '1');
  assert.equal(beatLabel(1, 2), '1&');
  assert.equal(beatLabel(5, 2), '3&');
  assert.equal(beatLabel(2, 1), '3');
});

test('demo timings: tabla count-in then each bol; singing notes and siren', async () => {
  const { tablaDemo, voiceDemo, demoPitchAt, COUNT_IN } = await import('../js/data/demos.js');
  const d = tablaDemo({ bols: 'Dha Dhin - Na', bpm: 60 });
  assert.equal(d.clicks.length, COUNT_IN);
  assert.equal(d.events.length, 4);
  assert.equal(d.events[0].time, COUNT_IN);           // 1 s per beat at 60 bpm
  assert.equal(d.events[3].time, COUNT_IN + 3);
  assert.equal(tablaDemo({ bols: 'Na Na', bpm: 60 }, 0.5).events[1].time, 2 * COUNT_IN + 2);   // slow = half speed
  assert.equal(tablaDemo({ bols: 'Na Na Na Na', bpm: 60, perBeat: 2 }).events[1].time, COUNT_IN + 0.5);

  const s = voiceDemo({ type: 'sing', notes: 'S R G' });
  assert.deepEqual(s.notes.map((n) => n.semi), [0, 2, 4]);
  assert.equal(demoPitchAt(s, 0.1), 0);
  assert.equal(demoPitchAt(s, 0.75), 2);
  assert.equal(demoPitchAt(s, 0.65), null);              // the short gap between notes

  const hld = voiceDemo({ type: 'hold', note: 'P', seconds: 8 });
  assert.equal(hld.notes[0].semi, 7);
  assert.equal(hld.notes[0].dur, 5);                     // capped so the demo stays short

  const r = voiceDemo({ type: 'range', seconds: 15 });
  assert.equal(demoPitchAt(r, 0), -5);
  assert.equal(demoPitchAt(r, 4), 9);
  assert.equal(demoPitchAt(r, 2), 2);
  assert.equal(demoPitchAt(r, 100), null);
});
