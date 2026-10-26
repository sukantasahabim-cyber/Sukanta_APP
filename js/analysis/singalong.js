// Sing-along scoring: turns a song into timed notes and judges each note
// from the pitch frames heard while it was due.
import { parseSwara } from '../music.js';

// Notes with their start beat and length in beats (holds extend a note).
export function songNotes(song) {
  const notes = [];
  const lineStarts = [];
  let beat = 0;
  song.lines.forEach((ln, li) => {
    lineStarts.push(beat);
    ln.notes.forEach((tok, i) => {
      if (tok === '-') {
        notes[notes.length - 1].beats++;
      } else {
        notes.push({
          n: notes.length, line: li, index: i, start: beat, beats: 1, token: tok,
          semitone: parseSwara(tok).semitone,
          syllable: ln.lyrics?.[i] ?? null, roman: ln.roman?.[i] ?? null,
        });
      }
      beat++;
    });
  });
  return { notes, lineStarts, totalBeats: beat };
}

// Distance from the target in cents, ignoring octaves (any voice can sing along).
export function centsFromTarget(offset, target) {
  let d = offset - target;
  d -= 12 * Math.round(d / 12);
  return d * 100;
}

// frames: cents from the target for each pitch frame, or null when silent.
export function scoreNote(frames) {
  if (!frames.length) return { hit: false, voiced: 0, inTune: 0 };
  const voiced = frames.filter((c) => c != null);
  const inTune = voiced.filter((c) => Math.abs(c) <= 50).length;
  const voicedFrac = voiced.length / frames.length;
  const tuneFrac = voiced.length ? inTune / voiced.length : 0;
  const sorted = [...voiced].sort((a, b) => a - b);
  const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
  return { hit: voicedFrac >= 0.3 && tuneFrac >= 0.6, voiced: voicedFrac, inTune: tuneFrac, median };
}

// results: per-note { hit } (or undefined if not sung); returns the score and per-line scores.
export function summarize(model, results, lines = null) {
  const wanted = model.notes.filter((n) => lines == null || lines.includes(n.line));
  const byLine = new Map();
  for (const n of wanted) {
    const e = byLine.get(n.line) || { line: n.line, notes: 0, hits: 0 };
    e.notes++;
    if (results[n.n]?.hit) e.hits++;
    byLine.set(n.line, e);
  }
  const all = [...byLine.values()];
  const hits = all.reduce((s, e) => s + e.hits, 0);
  const total = all.reduce((s, e) => s + e.notes, 0);
  return {
    score: total ? Math.round((hits / total) * 100) : 0,
    lines: all.map((e) => ({ line: e.line, score: Math.round((e.hits / e.notes) * 100) })),
  };
}

export const stars = (score) => (score >= 90 ? 3 : score >= 70 ? 2 : score >= 40 ? 1 : 0);

// Automatic sync. Headphones, phones and Bluetooth all add delay between the
// music and the voice that comes back through the microphone. Each frame is
// { t: seconds, off: semitones from Sa, or null when silent }; toBeat(t)
// turns a time into a song beat. The best lag is the one that puts the most
// frames in tune with the note due at that moment.
export const LAGS = Array.from({ length: 17 }, (_, i) => Math.round((-0.2 + i * 0.05) * 100) / 100);

export function noteAt(notes, beat) {
  let lo = 0;
  let hi = notes.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const n = notes[mid];
    if (beat < n.start) hi = mid - 1;
    else if (beat >= n.start + n.beats) lo = mid + 1;
    else return n;
  }
  return null;
}

export function estimateLag(frames, notes, toBeat, lags = LAGS) {
  let best = 0;
  let bestCount = -1;
  for (const lag of lags) {
    let count = 0;
    for (const f of frames) {
      if (f.off == null) continue;
      const n = noteAt(notes, toBeat(f.t - lag));
      if (n && Math.abs(centsFromTarget(f.off, n.semitone)) <= 50) count++;
    }
    if (count > bestCount || (count === bestCount && Math.abs(lag) < Math.abs(best))) { best = lag; bestCount = count; }
  }
  return best;
}

// Cents (or null) for the frames heard during the middle of `note`.
export function noteFrames(frames, note, toBeat, lag) {
  const out = [];
  for (const f of frames) {
    const beat = toBeat(f.t - lag);
    if (beat < note.start + 0.15 * note.beats || beat >= note.start + note.beats - 0.05) continue;
    out.push(f.off == null ? null : centsFromTarget(f.off, note.semitone));
  }
  return out;
}
