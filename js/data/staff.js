// Where swara tokens sit on a treble staff written in C (Do = C4 = the first
// ledger line below the staff). Positions count staff steps (line or space)
// from C4: 0 = C4, 2 = E4 (bottom line), 10 = F5 (top line).
import { tokenize, parseSwara } from '../music.js';

const DEGREE = { S: 0, r: 1, R: 1, g: 2, G: 2, M: 3, m: 3, P: 4, d: 5, D: 5, n: 6, N: 6 };

// "S R G - P - - -" → [{ sw, beat, beats, pos, accidental }]
export function staffNotes(text) {
  const notes = [];
  tokenize(text).forEach((tok, beat) => {
    if (tok === '-') {
      if (notes.length) notes[notes.length - 1].beats++;
      return;
    }
    const sw = parseSwara(tok);
    if (!sw) return;
    notes.push({
      sw, beat, beats: 1,
      pos: DEGREE[sw.letter] + 7 * sw.octave,
      accidental: sw.komal ? '♭' : sw.tivra ? '♯' : '',
    });
  });
  return notes;
}
