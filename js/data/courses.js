import { tabla } from './tabla.js';
import { guitar } from './guitar.js';
import { singing } from './singing.js';
import { PRACTICE } from './practice.js';

export const COURSES = [singing, tabla, guitar];

export const getCourse = (id) => COURSES.find((c) => c.id === id);

export const lessonsOf = (course) => course.levels.flatMap((level) => level.lessons);

// Every lesson has a theory part (steps + quiz) and a practical part (listening exercises).
for (const course of COURSES) {
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
export const isUnlocked = (list, index, isDone) => index === 0 || isDone(list[index - 1].id);

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
