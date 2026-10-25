import { test } from 'node:test';
import assert from 'node:assert/strict';
import { todaysPlan } from '../js/data/plan.js';

const odd = new Date('2026-10-25');   // odd day: instrument warm-up
const even = new Date('2026-10-24');  // even day: ear training

test('a brand-new learner starts with the first singing lesson', () => {
  const plan = todaysPlan({ lastLesson: null, isDone: () => false, isPracticeDone: () => false, date: odd });
  assert.equal(plan.length, 3);
  assert.equal(plan[0].href, '#/lesson/sing-voice');
  assert.equal(plan[1].href, '#/lesson/sing-voice/practice');
  assert.equal(plan[2].href, '#/tools/tanpura');
});

test('follows the course used last and suggests an unfinished practical', () => {
  const done = new Set(['tabla-meet', 'tabla-posture']);
  const plan = todaysPlan({ lastLesson: 'tabla-posture', isDone: (id) => done.has(id), isPracticeDone: (id) => id === 'tabla-meet', date: even });
  assert.equal(plan[0].href, '#/lesson/tabla-na');
  assert.equal(plan[1].href, '#/lesson/tabla-posture/practice');
  assert.equal(plan[2].href, '#/tools/ear');
});

test('moves on to another course when one is finished', async () => {
  const { lessonsOf, getCourse } = await import('../js/data/courses.js');
  const singing = new Set(lessonsOf(getCourse('singing')).map((l) => l.id));
  const plan = todaysPlan({ lastLesson: 'sing-riyaz', isDone: (id) => singing.has(id), isPracticeDone: (id) => singing.has(id), date: odd });
  assert.equal(plan[0].href, '#/lesson/tabla-meet');
  assert.equal(plan[1].href, '#/lesson/tabla-meet/practice');
});
