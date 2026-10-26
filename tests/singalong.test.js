import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SONGS } from '../js/data/songs.js';
import { TAALS } from '../js/data/taals.js';
import { parseSwara } from '../js/music.js';
import { songNotes, centsFromTarget, scoreNote, summarize, stars } from '../js/analysis/singalong.js';

test('every song is well formed', () => {
  const ids = new Set();
  for (const s of SONGS) {
    assert.ok(!ids.has(s.id), `duplicate song ${s.id}`); ids.add(s.id);
    for (const k of ['en', 'bn', 'hi']) assert.ok(s.title[k] && s.about[k], `${s.id}: missing ${k} text`);
    assert.ok(TAALS[s.taal], `${s.id}: unknown taal`);
    s.lines.forEach((ln, i) => {
      const where = `${s.id} line ${i + 1}`;
      assert.equal(ln.notes.length % TAALS[s.taal].matras, 0, `${where}: not whole taal cycles`);
      assert.notEqual(ln.notes[0], '-', `${where}: must start with a note`);
      ln.notes.forEach((n) => assert.ok(n === '-' || parseSwara(n), `${where}: bad swara ${n}`));
      for (const words of [ln.lyrics, ln.roman].filter(Boolean)) {
        assert.equal(words.length, ln.notes.length, `${where}: one syllable per beat`);
        words.forEach((w, k) => assert.equal(w === '_', ln.notes[k] === '-', `${where}: "_" must sit on holds`));
      }
      if (s.language !== 'sargam') assert.ok(ln.lyrics, `${where}: missing lyrics`);
    });
  }
});

test('song notes are timed with holds', () => {
  const m = songNotes({ lines: [{ notes: ['S', '-', 'R', 'G'] }, { notes: ['P', '-', '-', '-'] }] });
  assert.deepEqual(m.notes.map((n) => [n.token, n.start, n.beats]), [['S', 0, 2], ['R', 2, 1], ['G', 3, 1], ['P', 4, 4]]);
  assert.deepEqual(m.lineStarts, [0, 4]);
  assert.equal(m.totalBeats, 8);
});

test('notes are judged in any octave', () => {
  assert.equal(Math.round(centsFromTarget(12.1, 0)), 10);
  assert.equal(Math.round(centsFromTarget(-0.2, 0)), -20);
  assert.ok(scoreNote([5, -10, 20, null, 8]).hit);
  assert.ok(!scoreNote([null, null, null, null, 5]).hit, 'mostly silent');
  assert.ok(!scoreNote([120, 130, 110, 90]).hit, 'out of tune');
});

test('scores per line and stars', () => {
  const m = songNotes({ lines: [{ notes: ['S', 'R'] }, { notes: ['G', 'M'] }] });
  const s = summarize(m, [{ hit: true }, { hit: true }, { hit: false }, { hit: true }]);
  assert.equal(s.score, 75);
  assert.deepEqual(s.lines, [{ line: 0, score: 100 }, { line: 1, score: 50 }]);
  assert.equal(summarize(m, [], [1]).lines.length, 1);
  assert.deepEqual([95, 75, 45, 10].map(stars), [3, 2, 1, 0]);
});

import { estimateLag, noteFrames, noteAt } from '../js/analysis/singalong.js';

test('automatic sync finds the delay between music and voice', () => {
  const m = songNotes({ lines: [{ notes: ['S', 'R', 'G', 'M', 'P', 'G', 'R', 'S'] }] });
  const beatDur = 0.5;
  const toBeat = (t) => t / beatDur;
  // The voice arrives 0.3 s late, sung an octave up.
  const frames = [];
  for (let t = 0; t < 4; t += 0.02) {
    const n = noteAt(m.notes, toBeat(t));
    if (n) frames.push({ t: t + 0.3, off: n.semitone + 12 });
  }
  const lag = estimateLag(frames, m.notes, toBeat);
  assert.ok(Math.abs(lag - 0.3) < 0.051, `lag ${lag}`);
  assert.ok(scoreNote(noteFrames(frames, m.notes[2], toBeat, lag)).hit);
  assert.ok(!scoreNote(noteFrames(frames, m.notes[2], toBeat, 0)).hit || lag === 0);
});
