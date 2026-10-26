import { test } from 'node:test';
import assert from 'node:assert/strict';
import { midiToFreq, freqToMidi, midiName, noteFromFreq, parseSwara, swaraFromOffset, wrapOctave, GUITAR_OPEN } from '../js/music.js';

test('midi and frequency conversions', () => {
  assert.equal(midiToFreq(69), 440);
  assert.ok(Math.abs(midiToFreq(40) - 82.41) < 0.01);
  assert.ok(Math.abs(freqToMidi(261.63) - 60) < 0.01);
  assert.equal(midiName(60), 'C4');
  assert.equal(midiName(49), 'C#3');
  assert.deepEqual(noteFromFreq(440), { midi: 69, name: 'A', octave: 4, cents: 0 });
});

test('standard guitar tuning', () => {
  assert.deepEqual(GUITAR_OPEN.map(midiName), ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']);
});

test('parses swara notation', () => {
  assert.equal(parseSwara('S').semitone, 0);
  assert.equal(parseSwara('P').semitone, 7);
  assert.equal(parseSwara("S'").semitone, 12);
  assert.equal(parseSwara('.N').semitone, -1);
  assert.equal(parseSwara('.D').semitone, -3);
  const komalRe = parseSwara('r');
  assert.equal(komalRe.semitone, 1);
  assert.ok(komalRe.komal);
  const tivraMa = parseSwara('m');
  assert.equal(tivraMa.semitone, 6);
  assert.ok(tivraMa.tivra);
  assert.equal(parseSwara('X'), null);
  assert.equal(parseSwara(".S'"), null);
});

test('maps an offset from Sa to the nearest swara', () => {
  assert.equal(swaraFromOffset(4.2).name, 'Ga');
  assert.equal(swaraFromOffset(4.2).cents, 20);
  assert.equal(swaraFromOffset(12).octave, 1);
  assert.equal(swaraFromOffset(-1).letter, 'N');
  assert.equal(swaraFromOffset(-1).octave, -1);
});

test('octave wrapping lets any octave match', () => {
  assert.equal(wrapOctave(12), 0);
  assert.equal(wrapOctave(-12.3).toFixed(1), '-0.3');
  assert.equal(wrapOctave(11), -1);
});

test('letter names are spelled in the key of Sa', async () => {
  const { letterOf, SOLFEGE } = await import('../js/i18n/notation.js');
  const scale = (sa) => ['S', 'R', 'G', 'M', 'P', 'D', 'N'].map((s) => letterOf(s, sa)).join(' ');
  assert.equal(scale(60), 'C D E F G A B');          // Sa = C
  assert.equal(scale(62), 'D E F♯ G A B C♯');        // Sa = D
  assert.equal(scale(58), 'B♭ C D E♭ F G A');        // Sa = B♭
  assert.equal(scale(53), 'F G A B♭ C D E');         // Sa = F
  assert.equal(scale(54), 'F♯ G♯ A♯ B C♯ D♯ E♯'.replace('E♯', 'F'));   // F♯ major, with E♯ written F
  assert.equal(letterOf('r', 60), 'D♭');
  assert.equal(letterOf('m', 60), 'F♯');
  assert.equal(letterOf('n', 62), 'C');               // komal Ni in D
  assert.equal(letterOf(".N", 60), 'B');              // octave marks are ignored
  assert.equal(letterOf("S'", 63), 'E♭');
  assert.equal(Object.keys(SOLFEGE).length, 12);
  assert.equal(['S', 'R', 'G', 'M', 'P', 'D', 'N'].map((s) => SOLFEGE[s]).join(' '), 'Do Re Mi Fa Sol La Ti');
});

test('notes are placed on the staff with lengths and accidentals', async () => {
  const { staffNotes } = await import('../js/data/staff.js');
  const n = staffNotes("S R G - .N - - - S' g m");
  assert.deepEqual(n.map((x) => [x.pos, x.beat, x.beats, x.accidental]), [
    [0, 0, 1, ''], [1, 1, 1, ''], [2, 2, 2, ''], [-1, 4, 4, ''], [7, 8, 1, ''], [2, 9, 1, '♭'], [3, 10, 1, '♯'],
  ]);
});
