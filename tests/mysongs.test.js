import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMySong, emptySong } from '../js/data/mysongs.js';
import { songNotes } from '../js/analysis/singalong.js';

const base = { id: 'my-1', title: 'Test', taal: 'keherwa', bpm: 80 };

test('a typed song becomes a playable song', () => {
  const { song, errors } = parseMySong({ ...base, lines: [{ notes: 'S R G -', lyrics: 'la la la _' }, { notes: 'P - G S' }] });
  assert.deepEqual(errors, []);
  assert.equal(song.language, 'custom');
  assert.deepEqual(song.lines[1].lyrics, ['P', '_', 'G', 'S'], 'a line without words is sung in sargam');
  assert.equal(songNotes(song).notes.length, 6);
});

test('typing mistakes are reported per line', () => {
  const keys = (raw) => parseMySong({ ...base, ...raw }).errors.map((e) => `${e.line}:${e.key}`);
  assert.deepEqual(keys({ lines: [{ notes: 'S X G' }] }), ['1:mysong.err.badNote']);
  assert.deepEqual(keys({ lines: [{ notes: '- S' }] }), ['1:mysong.err.startsWithHold']);
  assert.deepEqual(keys({ lines: [{ notes: 'S R', lyrics: 'one' }] }), ['1:mysong.err.count']);
  assert.deepEqual(keys({ lines: [{ notes: 'S -', lyrics: 'a b' }] }), ['1:mysong.err.hold']);
  assert.deepEqual(keys({ title: ' ', lines: [] }), ['null:mysong.err.title', 'null:mysong.err.noLines']);
  assert.deepEqual(keys({ bpm: 500, lines: [{ notes: 'S' }] }), ['null:mysong.err.bpm']);
});

test('a new song starts empty and sargam-only songs work', () => {
  const s = emptySong();
  assert.match(s.id, /^my-/);
  const { song } = parseMySong({ ...base, lines: [{ notes: "S R G M P D N S'" }] });
  assert.equal(song.language, 'sargam');
});
