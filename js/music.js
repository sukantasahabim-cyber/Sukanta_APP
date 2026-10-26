// Pitch math shared by every instrument.

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);
export const freqToMidi = (f) => 69 + 12 * Math.log2(f / 440);

const pitchClass = (m) => ((m % 12) + 12) % 12;

export function midiName(m) {
  const r = Math.round(m);
  return NOTE_NAMES[pitchClass(r)] + (Math.floor(r / 12) - 1);
}

export function noteFromFreq(f) {
  const m = freqToMidi(f);
  const r = Math.round(m);
  return { midi: r, name: NOTE_NAMES[pitchClass(r)], octave: Math.floor(r / 12) - 1, cents: Math.round((m - r) * 100) };
}

// Guitar strings in standard tuning, index 0 = 6th string (low E).
export const GUITAR_OPEN = [40, 45, 50, 55, 59, 64];
export const GUITAR_STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'];

// Swara notation used in lesson data:
//   S R G M P D N   shuddha (natural) swaras
//   r g d n         komal (flat) Re, Ga, Dha, Ni
//   m               tivra (sharp) Ma
//   .X              mandra (lower) octave, e.g. ".N"
//   X'              taar (upper) octave, e.g. "S'"
//   -               hold the previous note / rest
const SWARA = {
  S: [0, 'Sa'], r: [1, 'Re'], R: [2, 'Re'], g: [3, 'Ga'], G: [4, 'Ga'], M: [5, 'Ma'],
  m: [6, 'Ma'], P: [7, 'Pa'], d: [8, 'Dha'], D: [9, 'Dha'], n: [10, 'Ni'], N: [11, 'Ni'],
};
const SWARA_BY_PC = ['S', 'r', 'R', 'g', 'G', 'M', 'm', 'P', 'd', 'D', 'n', 'N'];

export function parseSwara(token) {
  const match = /^(\.?)([SrRgGMmPdDnN])('?)$/.exec(token);
  if (!match || (match[1] && match[3])) return null;
  const [semi, name] = SWARA[match[2]];
  const octave = match[1] ? -1 : match[3] ? 1 : 0;
  return {
    token, letter: match[2], name, octave,
    semitone: semi + 12 * octave,
    komal: 'rgdn'.includes(match[2]),
    tivra: match[2] === 'm',
  };
}

export const tokenize = (str) => str.trim().split(/\s+/);

// Nearest swara to an offset (in semitones, may be fractional) from Sa.
export function swaraFromOffset(semis) {
  const r = Math.round(semis);
  const sw = parseSwara(SWARA_BY_PC[pitchClass(r)]);
  return { ...sw, octave: Math.floor(r / 12), cents: Math.round((semis - r) * 100) };
}

// Wrap a semitone difference into [-6, 6] so any octave counts as a match.
export const wrapOctave = (diff) => diff - 12 * Math.round(diff / 12);
