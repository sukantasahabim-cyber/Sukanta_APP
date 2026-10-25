import { h } from '../ui/dom.js';
import { store, dayKey } from '../store.js';
import { COURSES, courseProgress, nextLesson, findLesson } from '../data/courses.js';

const TIPS = [
  'Twenty minutes every day beats three hours once a week.',
  'Practise slowly. Speed comes by itself once the movement is correct.',
  'Always tune your guitar — and tune your ear with the tanpura.',
  'Speak the tabla bols aloud while you play: it trains rhythm and memory.',
  'Record yourself once a week and listen back. You will hear your progress.',
  'Relax your shoulders. Tension is the enemy of good tone.',
  'Warm up your voice before singing, just like stretching before sport.',
];

export function courseCard(course) {
  const isDone = store.isDone;
  const p = courseProgress(course, isDone);
  const next = nextLesson(course, isDone);
  return h('a', { class: `course-card c-${course.id}`, href: `#/course/${course.id}` },
    h('div', { class: 'course-icon', 'aria-hidden': 'true' }, course.icon),
    h('div', { class: 'course-body' },
      h('h3', {}, course.name),
      h('p', { class: 'muted' }, course.tagline),
      h('div', { class: 'bar' }, h('div', { class: 'bar-fill', style: { width: `${p.pct}%` } })),
      h('div', { class: 'course-meta' },
        h('span', {}, `${p.done} / ${p.total} lessons`),
        h('span', { class: 'link' }, p.done === 0 ? 'Start →' : next ? 'Continue →' : 'Completed ✓'))));
}

export function homeView() {
  const s = store.get();
  const streak = store.streak();
  const today = store.minutesOn(dayKey());

  let resume = s.lastLesson && findLesson(s.lastLesson);
  if (resume && store.isDone(resume.lesson.id)) {
    const next = nextLesson(resume.course, store.isDone);
    resume = next ? findLesson(next.id) : null;
  }

  const tip = TIPS[new Date().getDate() % TIPS.length];

  return h('div', { class: 'container' },
    h('section', { class: 'hero' },
      h('h1', {}, 'Namaste! 🙏'),
      h('p', {}, 'Learn singing, tabla and guitar step by step, starting from the very beginning.'),
      h('div', { class: 'stats' },
        h('div', { class: 'stat' }, h('b', {}, `${streak} 🔥`), h('span', {}, 'day streak')),
        h('div', { class: 'stat' }, h('b', {}, `${today}`), h('span', {}, 'min today')),
        h('div', { class: 'stat' }, h('b', {}, `${Object.keys(s.completed).length}`), h('span', {}, 'lessons done')))),
    resume && h('a', { class: 'resume', href: `#/lesson/${resume.lesson.id}` },
      h('span', { class: 'resume-icon', 'aria-hidden': 'true' }, resume.course.icon),
      h('div', {}, h('small', { class: 'muted' }, `Continue ${resume.course.name}`), h('div', { class: 'resume-title' }, resume.lesson.title)),
      h('span', { class: 'resume-go' }, '▶')),
    h('h2', { class: 'section-title' }, 'Choose what to learn'),
    h('div', { class: 'course-list' }, COURSES.map(courseCard)),
    h('div', { class: 'tip' }, h('span', { class: 'tip-icon', 'aria-hidden': 'true' }, '💡'), h('div', {}, h('b', {}, 'Riyaz tip: '), tip)));
}
