import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ROWS, SCALES, rowsFor, tokenOf, newComposition, noteAt, toggleNote, toggleDrum, setLength,
  thekaBeat, gridFromTheka, notesFromTokens, toMySong, encodeShare, decodeShare, exampleCompositions, totalSteps,
} from '../js/data/compose.js';
import { parseMySong } from '../js/data/mysongs.js';
import { parseSwara } from '../js/music.js';
import { TAALS } from '../js/data/taals.js';

test('rows cover lower Pa to upper Sa, filtered by scale, highest first', () => {
  assert.equal(ROWS.length, 18);
  assert.deepEqual(rowsFor('bhupali'), [12, 9, 7, 4, 2, 0, -3, -5]);
  assert.equal(rowsFor('all').length, 18);
  for (const s of ROWS) assert.equal(parseSwara(tokenOf(s)).semitone, s, `token for ${s}`);
  assert.equal(tokenOf(-5), '.P');
  assert.equal(tokenOf(12), "S'");
  for (const [id, notes] of Object.entries(SCALES)) assert.ok(notes.includes(0), `${id} has Sa`);
});

test('notes are added, cut short before the next note, and removed', () => {
  let notes = toggleNote([], 0, 0, 4, 32);
  assert.deepEqual(notes, [{ s: 0, p: 0, l: 4 }]);
  notes = toggleNote(notes, 6, 0, 8, 32);
  notes = toggleNote(notes, 4, 0, 8, 32);           // must stop before the note at 6
  assert.deepEqual(noteAt(notes, 5, 0), { s: 4, p: 0, l: 2 });
  notes = toggleNote(notes, 30, 7, 8, 32);           // must stop at the end
  assert.equal(noteAt(notes, 31, 7).l, 2);
  notes = toggleNote(notes, 2, 0, 4, 32);            // tapping inside a note removes it
  assert.equal(noteAt(notes, 0, 0), null);
  assert.equal(notes.length, 3);
  const grid = toggleDrum(toggleDrum({ Dha: [] }, 'Dha', 4), 'Dha', 0);
  assert.deepEqual(grid.Dha, [0, 4]);
  assert.deepEqual(toggleDrum(grid, 'Dha', 4).Dha, [0]);
});

test('shortening a composition trims what no longer fits', () => {
  const c = newComposition('x');
  c.tracks.melody.notes = [{ s: 0, p: 0, l: 2 }, { s: 14, p: 2, l: 6 }, { s: 20, p: 4, l: 2 }];
  c.rhythm.grid.Dha = [0, 16, 30];
  const short = setLength(c, 8);
  assert.equal(totalSteps(short), 16);
  assert.deepEqual(short.tracks.melody.notes, [{ s: 0, p: 0, l: 2 }, { s: 14, p: 2, l: 2 }]);
  assert.deepEqual(short.rhythm.grid.Dha, [0]);
});

test('theka beats and the drum grid follow the taal', () => {
  assert.deepEqual(thekaBeat('keherwa', 0), [{ bol: 'Dha', at: 0 }]);
  assert.deepEqual(thekaBeat('keherwa', 9), thekaBeat('keherwa', 1));      // cycles of 8
  assert.deepEqual(thekaBeat('ektaal', 2), [{ bol: 'Dha', at: 0 }, { bol: 'Ge', at: 0.5 }]);
  const grid = gridFromTheka('keherwa', 8);
  assert.deepEqual(grid.Dha, [0]);
  assert.deepEqual(grid.Ge, [2]);
  assert.deepEqual(grid.Na, [4, 8, 14]);
  assert.equal(Object.values(grid).flat().length, TAALS.keherwa.matras - 1);   // Ti has no row
});

test('a melody becomes a valid My Song for the Sing-along Studio', () => {
  const c = newComposition('x', 'Test tune');
  c.tracks.melody.notes = [...notesFromTokens('- S R G - P - - -'), { s: 3, p: 9, l: 1 }];  // an off-beat note is left out
  const raw = toMySong(c, 'my-test', 4);
  assert.deepEqual(raw.lines.map((l) => l.notes), ['S R G -', 'P - - -']);
  const { song, errors } = parseMySong(raw);
  assert.deepEqual(errors, []);
  assert.equal(song.lines.length, 2);
  // A line that would start with a hold starts with the held note instead.
  c.tracks.melody.notes = notesFromTokens('S - - - - - P -');
  assert.deepEqual(toMySong(c, 'x', 4).lines.map((l) => l.notes), ['S - - -', 'S - P -']);
  c.tracks.melody.notes = [];
  assert.equal(toMySong(c, 'x'), null);
});

test('share links round-trip and reject damaged data', () => {
  for (const ex of exampleCompositions()) {
    const copy = decodeShare(encodeShare(ex), ex.id);
    assert.deepEqual(copy, ex, ex.id);
  }
  const c = newComposition('x', 'नई धुन ✓');
  c.tracks.melody.notes = [{ s: 0, p: -5, l: 3 }];
  assert.equal(decodeShare(encodeShare(c), 'x').title, 'नई धुन ✓');
  assert.equal(decodeShare('not-a-link'), null);
  assert.equal(decodeShare(''), null);
});

test('example compositions are well formed', () => {
  for (const ex of exampleCompositions()) {
    const total = totalSteps(ex);
    for (const n of [...ex.tracks.melody.notes, ...ex.tracks.second.notes]) {
      assert.ok(n.s >= 0 && n.s + n.l <= total, `${ex.id}: note inside the length`);
      assert.ok(ROWS.includes(n.p), `${ex.id}: note in range`);
      assert.ok(SCALES[ex.scale].includes(((n.p % 12) + 12) % 12), `${ex.id}: note in scale`);
    }
    if (ex.rhythm.mode === 'theka') assert.equal(ex.beats % TAALS[ex.rhythm.taal].matras, 0, `${ex.id}: whole taal cycles`);
  }
});
