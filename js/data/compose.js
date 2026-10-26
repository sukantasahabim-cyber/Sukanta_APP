// Music Studio: compositions made on a grid. Pure data helpers — no audio,
// no DOM — so everything here can be tested.
//
// A composition:
//   { id, title, bpm, beats, scale, tanpura,
//     tracks: { melody: Track, second: Track },
//     rhythm: { mode: 'off' | 'theka' | 'grid', taal, volume, grid: { Dha: [steps], … } } }
// Track: { instrument, volume, notes: [{ s: start step, p: semitones from Sa, l: length in steps }] }
// Time is counted in steps of half a beat.
import { TAALS } from './taals.js';

export const STEPS_PER_BEAT = 2;
export const LENGTHS = [8, 16, 32];              // beats
export const NOTE_LENGTHS = [1, 2, 4, 8];        // steps: ½, 1, 2 and 4 beats
export const INSTRUMENTS = ['harmonium', 'bansuri', 'sitar', 'bells'];
export const DRUM_ROWS = ['Dha', 'Dhin', 'Na', 'Tin', 'Ge', 'Ke'];
export const TRACKS = ['melody', 'second'];

// Lower Pa up to upper Sa: every semitone a voice can comfortably reach.
export const ROWS = Array.from({ length: 18 }, (_, i) => i - 5);

// Which notes (semitones above Sa) each scale or raag uses.
export const SCALES = {
  bilawal: [0, 2, 4, 5, 7, 9, 11],
  kalyan: [0, 2, 4, 6, 7, 9, 11],
  khamaj: [0, 2, 4, 5, 7, 9, 10, 11],
  kafi: [0, 2, 3, 5, 7, 9, 10],
  asavari: [0, 2, 3, 5, 7, 8, 10],
  bhairav: [0, 1, 4, 5, 7, 8, 11],
  bhairavi: [0, 1, 3, 5, 7, 8, 10],
  bhupali: [0, 2, 4, 7, 9],
  durga: [0, 2, 5, 7, 9],
  malkauns: [0, 3, 5, 8, 10],
  minorPentatonic: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  all: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

const pc = (n) => ((n % 12) + 12) % 12;
const SWARA_BY_PC = ['S', 'r', 'R', 'g', 'G', 'M', 'm', 'P', 'd', 'D', 'n', 'N'];

// The rows to show for a scale, highest first (as on a staff).
export const rowsFor = (scale) => ROWS.filter((semi) => (SCALES[scale] || SCALES.all).includes(pc(semi))).reverse();

// Swara token for a semitone offset: -5 → ".P", 12 → "S'".
export function tokenOf(semi) {
  const letter = SWARA_BY_PC[pc(semi)];
  const octave = Math.floor(semi / 12);
  return octave < 0 ? `.${letter}` : octave > 0 ? `${letter}'` : letter;
}

export const totalSteps = (c) => c.beats * STEPS_PER_BEAT;
export const newCompositionId = () => `c-${Date.now().toString(36)}`;

export function newComposition(id = newCompositionId(), title = '') {
  return {
    id, title, bpm: 90, beats: 16, scale: 'bilawal', tanpura: true,
    tracks: {
      melody: { instrument: 'harmonium', volume: 0.9, notes: [] },
      second: { instrument: 'sitar', volume: 0.7, notes: [] },
    },
    rhythm: { mode: 'theka', taal: 'keherwa', volume: 0.8, grid: Object.fromEntries(DRUM_ROWS.map((b) => [b, []])) },
  };
}

// The note of `notes` sounding at `step` on row `semi`, if any.
export const noteAt = (notes, step, semi) => notes.find((n) => n.p === semi && step >= n.s && step < n.s + n.l) || null;

// Tapping a cell: removes the note there, or adds a new one of length `len`
// (cut short so it ends before the next note on the same row and the end).
export function toggleNote(notes, step, semi, len, total) {
  const hit = noteAt(notes, step, semi);
  if (hit) return notes.filter((n) => n !== hit);
  const next = notes.filter((n) => n.p === semi && n.s > step).reduce((m, n) => Math.min(m, n.s), total);
  const l = Math.max(1, Math.min(len, next - step));
  return [...notes, { s: step, p: semi, l }].sort((a, b) => a.s - b.s || b.p - a.p);
}

export function toggleDrum(grid, bol, step) {
  const steps = grid[bol] || [];
  return { ...grid, [bol]: steps.includes(step) ? steps.filter((s) => s !== step) : [...steps, step].sort((a, b) => a - b) };
}

// Changing the length keeps what fits and trims what doesn't.
export function setLength(c, beats) {
  const total = beats * STEPS_PER_BEAT;
  const fit = (notes) => notes.filter((n) => n.s < total).map((n) => ({ ...n, l: Math.min(n.l, total - n.s) }));
  return {
    ...c, beats,
    tracks: Object.fromEntries(TRACKS.map((k) => [k, { ...c.tracks[k], notes: fit(c.tracks[k].notes) }])),
    rhythm: { ...c.rhythm, grid: Object.fromEntries(Object.entries(c.rhythm.grid).map(([b, s]) => [b, s.filter((x) => x < total)])) },
  };
}

// The theka bols of one beat (absolute beat count from the start), spread
// evenly over that beat: [{ bol, at }] with `at` in beats.
export function thekaBeat(taalId, beat) {
  const taal = TAALS[taalId];
  if (!taal) return [];
  const bols = taal.bols[beat % taal.matras];
  return bols.map((bol, k) => ({ bol, at: k / bols.length })).filter((x) => x.bol !== '-');
}

// Fills the drum grid with a taal's theka (bols that fall between steps are left out).
export function gridFromTheka(taalId, beats) {
  const grid = Object.fromEntries(DRUM_ROWS.map((b) => [b, []]));
  for (let beat = 0; beat < beats; beat++) {
    for (const { bol, at } of thekaBeat(taalId, beat)) {
      const step = beat * STEPS_PER_BEAT + at * STEPS_PER_BEAT;
      const row = { Dhi: 'Dhin', Ta: 'Na', Tu: 'Tin', Ga: 'Ge', Ka: 'Ke', Kat: 'Ke' }[bol] || bol;
      if (Number.isInteger(step) && grid[row]) grid[row].push(step);
    }
  }
  return grid;
}

// A melody from per-beat swara tokens ("S R G - P"), for examples and tests.
export function notesFromTokens(text, offset = 0) {
  const notes = [];
  text.trim().split(/\s+/).forEach((tok, beat) => {
    if (tok === '-') {
      if (notes.length) notes[notes.length - 1].l += STEPS_PER_BEAT;
      return;
    }
    const m = /^(\.?)([SrRgGMmPdDnN])('?)$/.exec(tok);
    if (!m) return;
    const semi = SWARA_BY_PC.indexOf(m[2]) + (m[1] ? -12 : m[3] ? 12 : 0);
    notes.push({ s: (offset + beat) * STEPS_PER_BEAT, p: semi, l: STEPS_PER_BEAT });
  });
  return notes;
}

// The melody as a "My Song" (one token per beat) so it can be sung and scored
// in the Sing-along Studio. Notes that start between beats are left out; a
// beat with no new note holds the previous one.
export function toMySong(c, id, lineBeats = 8) {
  const starts = new Map();
  let end = 0;   // the beat after the last note has finished
  for (const n of c.tracks.melody.notes) {
    if (n.s % STEPS_PER_BEAT !== 0 || starts.has(n.s / STEPS_PER_BEAT)) continue;
    starts.set(n.s / STEPS_PER_BEAT, n.p);
    end = Math.max(end, Math.ceil((n.s + n.l) / STEPS_PER_BEAT));
  }
  if (!starts.size) return null;
  const first = Math.min(...starts.keys());
  // Silence after the last note is dropped; each line must start with a note.
  const tokens = [];
  for (let beat = first; beat < Math.min(end, c.beats); beat++) tokens.push(starts.has(beat) ? tokenOf(starts.get(beat)) : '-');
  const lines = [];
  let held = tokenOf(starts.get(first));
  for (let i = 0; i < tokens.length; i += lineBeats) {
    const line = tokens.slice(i, i + lineBeats);
    if (line[0] === '-') line[0] = held;
    line.forEach((tok) => { if (tok !== '-') held = tok; });
    lines.push({ notes: line.join(' '), lyrics: '' });
  }
  const taal = c.rhythm.mode === 'theka' && TAALS[c.rhythm.taal] ? c.rhythm.taal : 'keherwa';
  return { id, title: c.title || 'My composition', raag: '', taal, bpm: Math.max(30, Math.min(200, c.bpm)), lines };
}

// ---------- Share links ----------

const toBase64Url = (text) => {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 4096) bin += String.fromCharCode(...bytes.subarray(i, i + 4096));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromBase64Url = (text) => {
  const bin = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0)));
};
const packNotes = (notes) => notes.map((n) => `${n.s}.${n.p}.${n.l}`).join(',');
const unpackNotes = (text) => (text ? text.split(',').map((x) => { const [s, p, l] = x.split('.').map(Number); return { s, p, l }; }) : []);

// A composition as a compact, URL-safe string.
export function encodeShare(c) {
  return toBase64Url(JSON.stringify({
    v: 1, t: c.title, b: c.bpm, n: c.beats, sc: c.scale, tp: c.tanpura ? 1 : 0,
    m: [c.tracks.melody.instrument, c.tracks.melody.volume, packNotes(c.tracks.melody.notes)],
    s: [c.tracks.second.instrument, c.tracks.second.volume, packNotes(c.tracks.second.notes)],
    r: [c.rhythm.mode, c.rhythm.taal, c.rhythm.volume, DRUM_ROWS.map((b) => (c.rhythm.grid[b] || []).join('.')).join(',')],
  }));
}

// The composition in a share string, checked; null if it is not valid.
export function decodeShare(text, id = newCompositionId()) {
  try {
    const d = JSON.parse(fromBase64Url(text));
    if (d.v !== 1 || !LENGTHS.includes(d.n)) return null;
    const total = d.n * STEPS_PER_BEAT;
    const track = ([instrument, volume, notes]) => ({
      instrument: INSTRUMENTS.includes(instrument) ? instrument : 'harmonium',
      volume: Math.max(0, Math.min(1, Number(volume) || 0)),
      notes: unpackNotes(notes).filter((n) => [n.s, n.p, n.l].every(Number.isInteger) && n.s >= 0 && n.s < total && n.l >= 1 && ROWS.includes(n.p))
        .map((n) => ({ ...n, l: Math.min(n.l, total - n.s) })),
    });
    const drumSteps = (d.r[3] || '').split(',');
    return {
      id, title: String(d.t || '').slice(0, 80),
      bpm: Math.max(40, Math.min(200, Number(d.b) || 90)), beats: d.n,
      scale: SCALES[d.sc] ? d.sc : 'all', tanpura: Boolean(d.tp),
      tracks: { melody: track(d.m), second: track(d.s) },
      rhythm: {
        mode: ['off', 'theka', 'grid'].includes(d.r[0]) ? d.r[0] : 'off',
        taal: TAALS[d.r[1]] ? d.r[1] : 'keherwa',
        volume: Math.max(0, Math.min(1, Number(d.r[2]) || 0)),
        grid: Object.fromEntries(DRUM_ROWS.map((b, i) => [b, (drumSteps[i] || '').split('.').filter(Boolean).map(Number).filter((s) => Number.isInteger(s) && s >= 0 && s < total)])),
      },
    };
  } catch {
    return null;
  }
}

// ---------- Examples (original melodies) ----------

export function exampleCompositions() {
  const morning = newComposition('example-morning', 'Morning in Bhupali');
  morning.scale = 'bhupali';
  morning.bpm = 84;
  morning.tracks.melody.notes = notesFromTokens("G R S .D S R G - P G D P G R S - G P D S' D P G - R G P G R S - -");
  morning.beats = 32;
  morning.tracks.second.notes = notesFromTokens('S - - - .D - - - S - - - .P - - - S - - - .D - - - .P - - - S - - -');
  morning.tracks.second.instrument = 'bells';

  const dance = newComposition('example-dance', 'Festival Dance');
  dance.bpm = 120;
  dance.beats = 16;
  dance.scale = 'kafi';
  dance.tracks.melody.instrument = 'bansuri';
  dance.tracks.melody.notes = notesFromTokens('S R g R S - P M g R S - P n D P');

  const beat = newComposition('example-beat', 'My First Tabla Beat');
  beat.tanpura = false;
  beat.rhythm.mode = 'grid';
  beat.rhythm.grid = gridFromTheka('keherwa', 16);
  beat.tracks.melody.notes = notesFromTokens('S - - - - - - - P - - - - - - -');
  beat.tracks.melody.instrument = 'sitar';
  return [morning, dance, beat];
}
