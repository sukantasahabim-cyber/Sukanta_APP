// Pitch detection with the McLeod Pitch Method (normalised square difference
// function). Pure function so it can be unit tested.
// Returns the fundamental frequency in Hz, or -1 when no clear pitch is found.
export function detectPitch(buf, sampleRate, { minFreq = 60, maxFreq = 1200, minRms = 0.01, minClarity = 0.8 } = {}) {
  const n = buf.length;
  let energy = 0;
  for (let i = 0; i < n; i++) energy += buf[i] * buf[i];
  if (Math.sqrt(energy / n) < minRms) return -1;

  const maxLag = Math.min(Math.floor(sampleRate / minFreq), n - 2);
  const minLag = Math.max(1, Math.floor(sampleRate / maxFreq));

  // nsdf[lag] = 2 * r(lag) / m(lag), in [-1, 1]; 1 means a perfect repeat.
  const nsdf = new Float32Array(maxLag + 2);
  let m = 2 * energy;
  for (let lag = 0; lag <= maxLag + 1; lag++) {
    if (lag > 0) m -= buf[n - lag] * buf[n - lag] + buf[lag - 1] * buf[lag - 1];
    let r = 0;
    for (let i = 0; i < n - lag; i++) r += buf[i] * buf[i + lag];
    nsdf[lag] = m > 0 ? (2 * r) / m : 0;
  }

  // Collect the highest point of each positive lobe after the first zero crossing.
  const peaks = [];
  let lag = 1;
  while (lag <= maxLag && nsdf[lag] > 0) lag++;
  while (lag <= maxLag) {
    while (lag <= maxLag && nsdf[lag] <= 0) lag++;
    let best = -1;
    while (lag <= maxLag && nsdf[lag] > 0) {
      if (best < 0 || nsdf[lag] > nsdf[best]) best = lag;
      lag++;
    }
    if (best >= minLag) peaks.push(best);
  }
  if (!peaks.length) return -1;

  // The first peak close to the highest one is the fundamental (avoids octave errors).
  const highest = Math.max(...peaks.map((p) => nsdf[p]));
  if (highest < minClarity) return -1;
  const tau = peaks.find((p) => nsdf[p] >= 0.9 * highest);

  // Parabolic interpolation for sub-sample accuracy.
  const x1 = nsdf[tau - 1], x2 = nsdf[tau], x3 = nsdf[tau + 1];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  const period = a ? tau - b / (2 * a) : tau;
  return sampleRate / period;
}
