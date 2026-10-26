// Badges: small rewards for steady practice. Pure rules over a progress
// summary, so they can be tested without a browser.
import { COURSES, lessonsOf } from './courses.js';

const RAAG_LESSONS = new Set(['sing-bhupali', 'sing-yaman', 'sing-bhairav', 'sing-kafi', 'sing-khamaj', 'sing-durga',
  'sing-bhimpalasi', 'sing-bageshree', 'sing-malkauns', 'sing-des']);
const KAIDA_LESSONS = new Set(['tabla-kaida', 'tabla-kaida-dhati', 'tabla-kaida-tirakita']);

const allDone = (courseId, done) => {
  const course = COURSES.find((c) => c.id === courseId);
  return Boolean(course) && lessonsOf(course).every((l) => done.has(l.id));
};

// Each rule gets { done, practiceDone, exercisesPassed, streak, minutes }:
// done / practiceDone are Sets of lesson ids.
export const BADGES = [
  { id: 'firstLesson', icon: '🌱', earned: (p) => p.done.size >= 1 },
  { id: 'firstPractical', icon: '🎯', earned: (p) => p.exercisesPassed >= 1 },
  { id: 'lessons5', icon: '📚', earned: (p) => p.done.size >= 5 },
  { id: 'streak3', icon: '🔥', earned: (p) => p.streak >= 3 },
  { id: 'firstRaag', icon: '🌅', earned: (p) => [...p.done].some((id) => RAAG_LESSONS.has(id)) },
  { id: 'firstKaida', icon: '🥁', earned: (p) => [...p.practiceDone].some((id) => KAIDA_LESSONS.has(id)) },
  { id: 'hour', icon: '⏱️', earned: (p) => p.minutes >= 60 },
  { id: 'streak7', icon: '⚡', earned: (p) => p.streak >= 7 },
  { id: 'lessons15', icon: '🎓', earned: (p) => p.done.size >= 15 },
  { id: 'practical10', icon: '🏹', earned: (p) => p.practiceDone.size >= 10 },
  { id: 'tenHours', icon: '💎', earned: (p) => p.minutes >= 600 },
  { id: 'allSinging', icon: '🎤', earned: (p) => allDone('singing', p.done) },
  { id: 'allTabla', icon: '🪘', earned: (p) => allDone('tabla', p.done) },
  { id: 'streak30', icon: '🏆', earned: (p) => p.streak >= 30 },
];

export function progressSummary(store) {
  const s = store.get();
  return {
    done: new Set(Object.keys(s.completed)),
    practiceDone: new Set(Object.keys(s.practiceDone)),
    exercisesPassed: Object.values(s.practicePassed).reduce((n, passes) => n + Object.values(passes).filter(Boolean).length, 0),
    streak: store.streak(),
    minutes: store.totalMinutes(),
  };
}

export const earnedBadges = (summary) => BADGES.filter((b) => b.earned(summary)).map((b) => b.id);
