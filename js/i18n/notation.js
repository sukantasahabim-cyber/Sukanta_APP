// How note names are written. Lesson data always uses swara tokens (S R G…,
// see parseSwara in music.js); learners pick how they are shown:
//   sargam  — Indian names: Sa Re Ga Ma Pa Dha Ni (in the interface script)
//   solfege — movable-do solfège: Do Re Mi Fa Sol La Ti (Ra Me Fi Le Te for
//             the flat and sharp notes), with Do on the learner's key note
//   letters — letter names in the learner's key: C D E F G A B, with ♭ and ♯
// "Automatic" follows the course: Do Re Mi in World Singing, Sa Re Ga in the
// Indian classical courses.
import { store } from '../store.js';
import { setTextDefault, t } from './i18n.js';

export const NOTATIONS = ['sargam', 'solfege', 'letters'];

let context = null;   // id of the course being shown

export function setNotationContext(courseId) { context = courseId; }

const courseOfLesson = (id) => (!id ? null : id.startsWith('voice-') ? 'voice' : 'other');

export function notation() {
  const chosen = store.setting('notation');
  if (NOTATIONS.includes(chosen)) return chosen;
  return (context ?? courseOfLesson(store.lastLesson())) === 'voice' ? 'solfege' : 'sargam';
}

const SEMITONE = { S: 0, r: 1, R: 2, g: 3, G: 4, M: 5, m: 6, P: 7, d: 8, D: 9, n: 10, N: 11 };
const DEGREE = { S: 0, r: 1, R: 1, g: 2, G: 2, M: 3, m: 3, P: 4, d: 5, D: 5, n: 6, N: 6 };
export const SOLFEGE = { S: 'Do', r: 'Ra', R: 'Re', g: 'Me', G: 'Mi', M: 'Fa', m: 'Fi', P: 'Sol', d: 'Le', D: 'La', n: 'Te', N: 'Ti' };

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NATURAL_PC = [0, 2, 4, 5, 7, 9, 11];
const FLAT_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
const SHARP_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const FLAT_KEYS = new Set([1, 3, 8, 10]);   // D♭, E♭, A♭, B♭ are written with flats; F♯ with sharps
const pc = (n) => ((n % 12) + 12) % 12;

// Letter name of a swara when Sa is `saMidi`, spelled as in that key:
// with Sa = D, Ga is F♯ and komal Ni is C.
export function letterOf(token, saMidi) {
  const letter = token.replace(/[.']/g, '');
  const saPc = pc(saMidi);
  let saIdx = NATURAL_PC.indexOf(saPc);
  if (saIdx < 0) saIdx = NATURAL_PC.indexOf(FLAT_KEYS.has(saPc) ? saPc + 1 : saPc - 1);
  const idx = (saIdx + DEGREE[letter]) % 7;
  const target = pc(saPc + SEMITONE[letter]);
  const diff = pc(target - NATURAL_PC[idx] + 6) - 6;
  const name = diff === 0 ? LETTERS[idx] : diff === 1 ? `${LETTERS[idx]}♯` : diff === -1 ? `${LETTERS[idx]}♭` : null;
  // Double accidentals and C♭/F♭/E♯/B♯ read badly: use the plain name instead.
  if (!name || ['C♭', 'F♭', 'E♯', 'B♯'].includes(name)) return (diff < 0 || 'rgdn'.includes(letter) ? FLAT_NAMES : SHARP_NAMES)[target];
  return name;
}

// The name shown for a parsed swara (see parseSwara), without octave marks.
export function noteName(sw, swaraName) {
  switch (notation()) {
    case 'solfege': return SOLFEGE[sw.letter];
    case 'letters': return letterOf(sw.letter, store.setting('saMidi'));
    default: return swaraName(sw.name);
  }
}

// What the home note is called: Sa, Do, or "the key note".
export function tonicName() {
  switch (notation()) {
    case 'solfege': return 'Do';
    case 'letters': return t('notation.keyNote');
    default: return t('notation.sa');
  }
}

// Strings may say {sa} for the home note's name.
setTextDefault('sa', tonicName);
