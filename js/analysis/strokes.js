// Recognises the family of a tabla stroke from its sound.
//
// A stroke is described by which drum rings after the hit:
//   both    — dayan and bayan ring together   (Dha, Dhin)
//   bayan   — only the bass drum rings         (Ge)
//   dayan   — only the treble drum rings       (Na, Ta, Tin, Tu)
//   closed  — a damped, dry dayan stroke       (Ti, Te, Ra)
//   slap    — a damped, flat-hand bayan stroke (Ke, Ka, Ki, Kat)
// Ringing is measured as the energy left in each frequency band 90–180 ms
// after the hit, relative to the first 40 ms.
import { magnitudeSpectrum, pow2 } from './fft.js';

export const FAMILY_OF = {
  dha: 'both', dhin: 'both', dhi: 'both',
  ge: 'bayan', ghe: 'bayan', ga: 'bayan',
  na: 'dayan', ta: 'dayan', tin: 'dayan', tu: 'dayan', tun: 'dayan',
  ti: 'closed', te: 'closed', ra: 'closed', re: 'closed',
  ke: 'slap', ka: 'slap', ki: 'slap', kat: 'slap',
};

export const FAMILY_LABEL = {
  both: 'both drums ringing (Dha / Dhin)',
  bayan: 'bayan only (Ge)',
  dayan: 'dayan only (Na / Tin)',
  closed: 'a closed dayan stroke (Ti / Te)',
  slap: 'a closed bayan slap (Ke / Ka)',
};

const BANDS = { low: [45, 200], mid: [200, 1500], high: [1500, 8000] };
const RING = 0.02;      // energy ratio that counts as "still ringing"
const PRESENT = 0.12;   // share of the attack energy a drum must contribute

function bands(samples, sr, start, size) {
  const mag = magnitudeSpectrum(samples, start, size);
  const out = {};
  for (const [name, [lo, hi]] of Object.entries(BANDS)) {
    const k0 = Math.ceil((lo * size) / sr);
    const k1 = Math.min(mag.length - 1, Math.floor((hi * size) / sr));
    let s = 0;
    for (let k = k0; k <= k1; k++) s += mag[k] * mag[k];
    out[name] = s / (size * size);
  }
  let num = 0;
  let den = 0;
  for (let k = 1; k < mag.length; k++) {
    const f = (k * sr) / size;
    if (f > 8000) break;
    num += f * mag[k] * mag[k];
    den += mag[k] * mag[k];
  }
  out.centroid = den ? num / den : 0;
  return out;
}

// Seconds of audio analyzeStroke wants before the onset and after it.
export const STROKE_BEFORE = 0.05;
export const STROKE_AFTER = 0.3;

// `samples` holds STROKE_BEFORE seconds before the onset, then the stroke.
// `length` (samples after the onset) stops the analysis at the next stroke.
export function analyzeStroke(samples, sr, length = Infinity) {
  const at = Math.round(sr * STROKE_BEFORE);
  const avail = Math.min(length, samples.length - at);
  const attackSize = pow2(sr * 0.04);
  const attack = bands(samples, sr, at, attackSize);
  // Whatever was still ringing from the previous stroke must not count as this one's ring.
  const before = bands(samples, sr, at - attackSize, attackSize);
  let ringStart = Math.round(sr * 0.09);
  let ringSize = pow2(sr * 0.08);
  if (ringStart + ringSize > avail) {
    ringStart = Math.round(sr * 0.06);
    ringSize = pow2(sr * 0.04);
  }
  const canRing = ringStart + ringSize <= avail;
  const ring = canRing ? bands(samples, sr, at + ringStart, ringSize) : null;

  const hit = {};
  for (const band of Object.keys(BANDS)) hit[band] = Math.max(0, attack[band] - before[band]);
  const total = hit.low + hit.mid + hit.high || 1e-12;
  const presLow = hit.low / total;
  const presMid = hit.mid / total;
  const ringOf = (band) => (ring ? Math.max(0, ring[band] - before[band]) / (hit[band] || 1e-12) : 0);
  const ringLow = ringOf('low');
  const ringMid = ringOf('mid');

  const bayanOpen = presLow > PRESENT && ringLow > RING;
  const dayanOpen = presMid > PRESENT && ringMid > RING;
  let family;
  if (bayanOpen && dayanOpen) family = 'both';
  else if (bayanOpen) family = 'bayan';
  else if (dayanOpen) family = 'dayan';
  else family = presLow > 0.3 ? 'slap' : 'closed';

  // If the previous stroke is louder than this one, we cannot tell what was played.
  const attackTotal = attack.low + attack.mid + attack.high || 1e-12;
  const certain = canRing && total > 0.2 * attackTotal;
  return { family, certain, features: { presLow, presMid, ringLow, ringMid, centroid: attack.centroid } };
}
