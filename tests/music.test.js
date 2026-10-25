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
