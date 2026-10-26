import { tabla } from './tabla.js';
import { guitar } from './guitar.js';
import { singing } from './singing.js';
import { PRACTICE } from './practice.js';

// Every course that exists. Courses listed in HIDDEN stay in the code (and
// keep their translations and tests) but are not shown in the app.
export const ALL_COURSES = [singing, tabla, guitar];
const HIDDEN = new Set(['guitar']);
export const COURSES = ALL_COURSES.filter((c) => !HIDDEN.has(c.id));
export const courseShown = (id) => COURSES.some((c) => c.id === id);

export const getCourse = (id) => COURSES.find((c) => c.id === id);

export const lessonsOf = (course) => course.levels.flatMap((level) => level.lessons);

// Every lesson has a theory part (steps + quiz) and a practical part (listening exercises).
for (const course of ALL_COURSES) {
  for (const lesson of lessonsOf(course)) lesson.practice = PRACTICE[lesson.id] || [];
}

export function findLesson(id) {
  for (const course of COURSES) {
    const list = lessonsOf(course);
    const index = list.findIndex((l) => l.id === id);
    if (index >= 0) return { course, lesson: list[index], index, list };
  }
  return null;
}

// Lessons unlock one at a time: each needs the previous one completed.
// TESTING: UNLOCK_ALL opens every lesson so the whole course can be tried.
// Set it back to false to restore the step-by-step order.
export const UNLOCK_ALL = true;
export const isUnlocked = (list, index, isDone, unlockAll = UNLOCK_ALL) => unlockAll || index === 0 || isDone(list[index - 1].id);

export const nextLesson = (course, isDone) => lessonsOf(course).find((l) => !isDone(l.id)) || null;

export function practiceProgress(course, isPracticeDone) {
  const list = lessonsOf(course);
  const done = list.filter((l) => isPracticeDone(l.id)).length;
  return { done, total: list.length, pct: Math.round((done / list.length) * 100) };
}

export function courseProgress(course, isDone) {
  const list = lessonsOf(course);
  const done = list.filter((l) => isDone(l.id)).length;
  return { done, total: list.length, pct: Math.round((done / list.length) * 100) };
}
