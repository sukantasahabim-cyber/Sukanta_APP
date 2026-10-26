// Karplus-Strong plucked string. Pure function, so tests can synthesise guitar
// audio without a browser.
export function renderString(freq, sampleRate, seconds = 3.2, random = Math.random) {
  const len = Math.floor(sampleRate * seconds);
  const d = new Float32Array(len);
  const period = Math.max(2, Math.round(sampleRate / freq));
  const ring = new Float32Array(period);
  for (let i = 0; i < period; i++) ring[i] = random() * 2 - 1;
  for (let i = 1; i < period; i++) ring[i] = (ring[i] + ring[i - 1]) * 0.5; // softer pick attack
  let idx = 0;
  for (let i = 0; i < len; i++) {
    const next = idx + 1 === period ? 0 : idx + 1;
    const v = ring[idx];
    ring[idx] = 0.996 * 0.5 * (v + ring[next]);
    d[i] = v;
    idx = next;
  }
  const fade = Math.floor(sampleRate * 0.08);
  for (let i = 0; i < fade; i++) d[len - 1 - i] *= i / fade;
  return d;
}
