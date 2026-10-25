// Validates every lesson so typos in the course data are caught before they reach a learner.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COURSES, lessonsOf, findLesson, isUnlocked } from '../js/data/courses.js';
import { CHORDS, CHORD_GROUPS } from '../js/data/chords.js';
import { TAALS } from '../js/data/taals.js';
import { isKnownBol } from '../js/audio/tabla.js';
import { parseSwara, tokenize } from '../js/music.js';

const STEP_TYPES = new Set(['text', 'tip', 'metronome', 'timer', 'bols', 'sequence', 'theka', 'strings', 'chords',
  'strum', 'progression', 'tab', 'tuner', 'drone', 'sapicker', 'keyboard', 'sargam', 'pitch', 'breath']);

const allLessons = COURSES.flatMap((c) => lessonsOf(c).map((lesson) => ({ course: c, lesson })));

function checkStep(step, where) {
  assert.ok(STEP_TYPES.has(step.type), `${where}: unknown step type "${step.type}"`);
  const bol = (b) => assert.ok(b === '-' || isKnownBol(b), `${where}: unknown bol "${b}"`);
  const swaras = (s) => tokenize(s).forEach((t) => assert.ok(t === '-' || parseSwara(t), `${where}: bad swara "${t}"`));
  const chord = (c) => assert.ok(CHORDS[c], `${where}: unknown chord "${c}"`);
  const pattern = (p) => assert.match(p, /^[DU-]+$/, `${where}: bad strum pattern "${p}"`);

  switch (step.type) {
    case 'text': case 'tip': assert.ok(step.body?.trim(), `${where}: empty body`); break;
    case 'bols': step.bols.forEach((b) => bol(b.bol)); break;
    case 'sequence': tokenize(step.bols).forEach(bol); break;
    case 'theka': assert.ok(TAALS[step.taal], `${where}: unknown taal "${step.taal}"`); break;
    case 'chords': step.chords.forEach(chord); break;
    case 'strum': chord(step.chord); (step.chords || []).forEach(chord); pattern(step.pattern); break;
    case 'progression': step.chords.forEach(chord); pattern(step.pattern); break;
    case 'tab':
      tokenize(step.notes).forEach((tok) => {
        if (tok === '-') return;
        tok.split('+').forEach((n) => {
          const m = /^([1-6]):(\d{1,2})$/.exec(n);
          assert.ok(m && +m[2] <= 20, `${where}: bad tab note "${n}"`);
        });
      });
      break;
    case 'keyboard': case 'pitch': swaras(step.notes); break;
    case 'sargam':
      swaras(step.notes);
      if (step.tabla) assert.ok(TAALS[step.tabla], `${where}: unknown taal "${step.tabla}"`);
      break;
    case 'tuner': assert.ok(['guitar', 'voice'].includes(step.mode), `${where}: bad tuner mode`); break;
    default: break;
  }
}

test('lesson ids are unique', () => {
  const ids = allLessons.map((l) => l.lesson.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('every lesson is well formed', () => {
  for (const { course, lesson } of allLessons) {
    const where = `${course.id}/${lesson.id}`;
    assert.ok(lesson.title, `${where}: missing title`);
    assert.ok(lesson.minutes > 0, `${where}: missing minutes`);
    assert.ok(lesson.steps.length > 0, `${where}: no steps`);
    lesson.steps.forEach((s, i) => checkStep(s, `${where} step ${i + 1}`));
    for (const q of lesson.quiz || []) {
      assert.ok(q.options.length >= 2, `${where}: quiz needs options`);
      assert.ok(q.answer >= 0 && q.answer < q.options.length, `${where}: quiz answer out of range: ${q.q}`);
    }
  }
});

test('taal definitions add up', () => {
  for (const [id, t] of Object.entries(TAALS)) {
    assert.equal(t.bols.length, t.matras, `${id}: bols vs matras`);
    assert.equal(t.vibhags.reduce((a, b) => a + b, 0), t.matras, `${id}: vibhags vs matras`);
    assert.equal(t.marks.length, t.vibhags.length, `${id}: marks vs vibhags`);
    t.bols.flat().forEach((b) => assert.ok(isKnownBol(b), `${id}: unknown bol ${b}`));
  }
});

test('chord shapes are valid', () => {
  for (const [id, c] of Object.entries(CHORDS)) {
    assert.equal(c.frets.length, 6, id);
    assert.equal(c.fingers.length, 6, id);
    c.frets.forEach((f, i) => {
      if (f > 0 && !(c.barre && f === c.barre.fret && i >= c.barre.from && i <= c.barre.to)) {
        assert.ok(c.fingers[i] >= 1 && c.fingers[i] <= 4, `${id}: string ${6 - i} needs a finger`);
      }
    });
  }
  CHORD_GROUPS.flatMap(([, names]) => names).forEach((n) => assert.ok(CHORDS[n], n));
});

test('lessons unlock in order', () => {
  const course = COURSES[0];
  const list = lessonsOf(course);
  const done = new Set();
  const isDone = (id) => done.has(id);
  assert.ok(isUnlocked(list, 0, isDone));
  assert.ok(!isUnlocked(list, 1, isDone));
  done.add(list[0].id);
  assert.ok(isUnlocked(list, 1, isDone));
  assert.equal(findLesson(list[1].id).index, 1);
});
