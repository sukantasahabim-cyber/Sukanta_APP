// "My Songs": songs a learner types in for their own practice. They are kept
// only on this device. Each line has notes (one token per beat: a swara, or
// "-" to hold) and optional lyrics (one syllable per beat, "_" on holds).
import { parseSwara } from '../music.js';
import { TAALS } from './taals.js';

const words = (s) => (s || '').trim().split(/\s+/).filter(Boolean);

// Checks a song as typed. Returns { song, errors }: `song` is ready for the
// sing-along studio when there are no errors; each error is { line, key, vars }
// with an i18n key under "mysong.err.".
export function parseMySong(raw) {
  const errors = [];
  const err = (line, key, vars = {}) => errors.push({ line, key: `mysong.err.${key}`, vars });
  if (!raw.title?.trim()) err(null, 'title');
  if (!TAALS[raw.taal]) err(null, 'taal');
  const bpm = Number(raw.bpm);
  if (!(bpm >= 30 && bpm <= 200)) err(null, 'bpm');
  const rawLines = (raw.lines || []).filter((l) => words(l.notes).length || words(l.lyrics).length);
  if (!rawLines.length) err(null, 'noLines');
  let anyLyrics = false;
  const lines = rawLines.map((l, i) => {
    const n = i + 1;
    const notes = words(l.notes);
    const lyrics = words(l.lyrics);
    if (!notes.length) err(n, 'noNotes');
    const bad = notes.find((tok) => tok !== '-' && !parseSwara(tok));
    if (bad) err(n, 'badNote', { token: bad });
    if (notes[0] === '-') err(n, 'startsWithHold');
    if (lyrics.length) {
      anyLyrics = true;
      if (lyrics.length !== notes.length) err(n, 'count', { beats: notes.length, syllables: lyrics.length });
      else {
        const k = lyrics.findIndex((w, j) => (w === '_') !== (notes[j] === '-'));
        if (k >= 0) err(n, 'hold', { pos: k + 1 });
      }
    }
    return { notes, lyrics: lyrics.length ? lyrics : null, roman: null };
  });
  if (errors.length) return { song: null, errors };
  const title = raw.title.trim();
  return {
    errors,
    song: {
      id: raw.id, custom: true,
      title: { en: title, bn: title, hi: title },
      about: { en: '', bn: '', hi: '' },
      language: anyLyrics ? 'custom' : 'sargam',
      raag: raw.raag?.trim() || '', taal: raw.taal, bpm, level: 0,
      // A line without lyrics is sung in sargam.
      lines: lines.map((l) => (anyLyrics && !l.lyrics ? { ...l, lyrics: l.notes.map((tok) => (tok === '-' ? '_' : tok)) } : l)),
    },
  };
}

export const newSongId = () => `my-${Date.now().toString(36)}`;

export const emptySong = () => ({ id: newSongId(), title: '', raag: '', taal: 'keherwa', bpm: 80, lines: [{ notes: '', lyrics: '' }] });
