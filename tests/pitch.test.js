import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectPitch } from '../js/audio/pitch.js';

const SR = 48000;

function tone(freq, { harmonics = [1], n = 2048, amp = 0.5 } = {}) {
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let v = 0;
    harmonics.forEach((a, k) => { v += a * Math.sin(2 * Math.PI * freq * (k + 1) * (i / SR)); });
    buf[i] = amp * v;
  }
  return buf;
}

const cents = (a, b) => 1200 * Math.log2(a / b);

test('detects pure tones across the guitar and voice range', () => {
  for (const f of [82.41, 110, 146.83, 196, 246.94, 329.63, 440, 660, 880]) {
    const got = detectPitch(tone(f), SR);
    assert.ok(Math.abs(cents(got, f)) < 5, `${f} Hz detected as ${got}`);
  }
});

test('finds the fundamental of a harmonic-rich tone', () => {
  const f = 110;
  const got = detectPitch(tone(f, { harmonics: [1, 0.8, 0.6, 0.4, 0.3] }), SR);
  assert.ok(Math.abs(cents(got, f)) < 5, `detected ${got}`);
});

test('does not jump an octave when the 2nd harmonic is strongest', () => {
  for (const f of [82.41, 140, 392]) {
    const got = detectPitch(tone(f, { harmonics: [0.2, 0.4, 0.2], amp: 1 }), SR);
    assert.ok(Math.abs(cents(got, f)) < 5, `${f} Hz detected as ${got}`);
  }
});

test('returns -1 for silence and for noise', () => {
  assert.equal(detectPitch(new Float32Array(2048), SR), -1);
  let seed = 1;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 - 0.5; };
  const noise = Float32Array.from({ length: 2048 }, rand);
  assert.equal(detectPitch(noise, SR), -1);
});
