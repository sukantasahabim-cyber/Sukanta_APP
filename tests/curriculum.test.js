// Validates every lesson so typos in the course data are caught before they reach a learner.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ALL_COURSES, COURSES, lessonsOf, findLesson, isUnlocked } from '../js/data/courses.js';
import { CHORDS, CHORD_GROUPS } from '../js/data/chords.js';
import { TAALS } from '../js/data/taals.js';
import { isKnownBol } from '../js/audio/tabla.js';
import { parseSwara, tokenize } from '../js/music.js';
import { PRACTICE } from '../js/data/practice.js';

const STEP_TYPES = new Set(['text', 'tip', 'metronome', 'timer', 'bols', 'sequence', 'theka', 'strings', 'chords',
  'strum', 'progression', 'tab', 'tuner', 'drone', 'sapicker', 'keyboard', 'sargam', 'breath', 'miccheck', 'ear', 'lehra', 'staff']);

const allLessons = ALL_COURSES.flatMap((c) => lessonsOf(c).map((lesson) => ({ course: c, lesson })));

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
    case 'keyboard': case 'staff': swaras(step.notes); break;
    case 'sargam':
      swaras(step.notes);
      if (step.tabla) assert.ok(TAALS[step.tabla], `${where}: unknown taal "${step.tabla}"`);
      break;
    case 'tuner': assert.ok(['guitar', 'voice'].includes(step.mode), `${where}: bad tuner mode`); break;
    case 'ear': {
      const opts = step.options.map((o) => (typeof o === 'string' ? { label: o, values: [o] } : o));
      assert.ok(opts.length >= 2, `${where}: ear training needs at least two options`);
      opts.forEach((o) => {
        assert.ok(o.label && o.values.length, `${where}: bad ear option`);
        o.values.forEach((v) => {
          if (step.kind === 'bol') bol(v);
          else if (step.kind === 'swara') swaras(v);
          else if (step.kind === 'chord') chord(v);
          else if (step.kind === 'taal') assert.ok(TAALS[v], `${where}: unknown taal "${v}"`);
          else assert.fail(`${where}: unknown ear kind "${step.kind}"`);
        });
      });
      break;
    }
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

function checkExercise(ex, where) {
  assert.ok(ex.title, `${where}: missing title`);
  const swaras = (s) => tokenize(s).forEach((t) => assert.ok(parseSwara(t), `${where}: bad swara "${t}"`));
  const tab = (s) => tokenize(s).forEach((n) => {
    const m = /^([1-6]):(\d{1,2})$/.exec(n);
    assert.ok(m && +m[2] <= 20, `${where}: bad tab note "${n}"`);
  });
  switch (ex.type) {
    case 'hold':
      assert.ok(ex.seconds > 0, `${where}: hold needs seconds`);
      if (ex.note) swaras(ex.note);
      break;
    case 'range': assert.ok(ex.seconds > 0 && ex.minSemitones > 0, `${where}: range needs seconds and minSemitones`); break;
    case 'sing': swaras(ex.notes); break;
    case 'notes': tab(ex.notes); break;
    case 'chord': assert.ok(CHORDS[ex.chord], `${where}: unknown chord "${ex.chord}"`); break;
    case 'changes': ex.chords.forEach((c) => assert.ok(CHORDS[c], `${where}: unknown chord "${c}"`)); break;
    case 'rhythm':
      assert.ok(ex.bpm >= 40 && ex.bpm <= 160, `${where}: bpm out of range`);
      assert.ok(Boolean(ex.bols) !== Boolean(ex.pattern), `${where}: rhythm needs bols or pattern`);
      if (ex.pattern) assert.match(ex.pattern, /^D[DU-]*$/, `${where}: pattern must start with a down-strum`);
      if (ex.bols) {
        const toks = tokenize(ex.bols);
        assert.notEqual(toks[0], '-', `${where}: first slot must be a stroke`);
        toks.forEach((b) => assert.ok(b === '-' || b === 'X' || isKnownBol(b), `${where}: unknown bol "${b}"`));
      }
      break;
    default: assert.fail(`${where}: unknown exercise type "${ex.type}"`);
  }
}

test('every lesson has valid practical exercises', () => {
  const ids = new Set(allLessons.map((l) => l.lesson.id));
  Object.keys(PRACTICE).forEach((id) => assert.ok(ids.has(id), `practice for unknown lesson "${id}"`));
  for (const { lesson } of allLessons) {
    assert.ok(lesson.practice?.length, `${lesson.id}: no practical exercises`);
    lesson.practice.forEach((ex, i) => checkExercise(ex, `${lesson.id} exercise ${i + 1}`));
  }
});

test('taal definitions add up', () => {
  for (const [id, t] of Object.entries(TAALS)) {
    assert.equal(t.bols.length, t.matras, `${id}: bols vs matras`);
    assert.equal(t.vibhags.reduce((a, b) => a + b, 0), t.matras, `${id}: vibhags vs matras`);
    assert.equal(t.marks.length, t.vibhags.length, `${id}: marks vs vibhags`);
    t.bols.flat().forEach((b) => assert.ok(b === '-' || isKnownBol(b), `${id}: unknown bol ${b}`));
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
  assert.ok(isUnlocked(list, 0, isDone, false));
  assert.ok(!isUnlocked(list, 1, isDone, false));
  done.add(list[0].id);
  assert.ok(isUnlocked(list, 1, isDone, false));
  assert.equal(findLesson(list[1].id).index, 1);
});

import { LEHRAS } from '../js/data/lehras.js';

test('every lehra fits its taal and uses real swaras', () => {
  for (const [id, l] of Object.entries(LEHRAS)) {
    assert.ok(TAALS[id], `lehra for unknown taal ${id}`);
    assert.equal(l.beats.length, TAALS[id].matras, `${id}: beats vs matras`);
    assert.notEqual(l.beats[0][0], '-', `${id}: must start with a note`);
    l.beats.flat().forEach((n) => assert.ok(n === '-' || parseSwara(n), `${id}: bad swara ${n}`));
  }
});
