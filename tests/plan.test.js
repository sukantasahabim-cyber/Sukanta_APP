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
  const { lessonsOf, getCourse, COURSES } = await import('../js/data/courses.js');
  const singing = new Set(lessonsOf(getCourse('singing')).map((l) => l.id));
  const plan = todaysPlan({ lastLesson: 'sing-riyaz', isDone: (id) => singing.has(id), isPracticeDone: (id) => singing.has(id), date: odd });
  const next = lessonsOf(COURSES.find((c) => c.id !== 'singing'))[0].id;
  assert.equal(plan[0].href, `#/lesson/${next}`);
  assert.equal(plan[1].href, `#/lesson/${next}/practice`);
});

import { BADGES, earnedBadges } from '../js/data/badges.js';

test('badges are earned from progress', () => {
  const p = (over) => ({ done: new Set(), practiceDone: new Set(), exercisesPassed: 0, streak: 0, minutes: 0, ...over });
  assert.deepEqual(earnedBadges(p({})), []);
  assert.deepEqual(earnedBadges(p({ done: new Set(['sing-voice']), exercisesPassed: 1 })), ['firstLesson', 'firstPractical']);
  assert.ok(earnedBadges(p({ done: new Set(['sing-bhupali']) })).includes('firstRaag'));
  assert.ok(earnedBadges(p({ practiceDone: new Set(['tabla-kaida-dhati']) })).includes('firstKaida'));
  assert.ok(earnedBadges(p({ streak: 7, minutes: 60 })).includes('streak7'));
  assert.equal(new Set(BADGES.map((b) => b.id)).size, BADGES.length);
});
