import { h } from '../ui/dom.js';
import { store } from '../store.js';

// Title block shared by a lesson's Theory and Practical pages, with the mode switch.
export function lessonHeader({ course, lesson, index }, mode, extra = null) {
  const theoryDone = store.isDone(lesson.id);
  const practiceDone = store.isPracticeDone(lesson.id);
  return [
    h('a', { class: 'back', href: `#/course/${course.id}` }, `← ${course.name}`),
    h('header', { class: 'lesson-header' },
      h('span', { class: 'pill' }, `${course.icon} Lesson ${index + 1} · ${lesson.minutes} min`),
      h('h1', {}, lesson.title),
      h('nav', { class: 'mode-tabs', 'aria-label': 'Lesson mode' },
        h('a', { href: `#/lesson/${lesson.id}`, class: mode === 'theory' ? 'on' : '', 'aria-current': mode === 'theory' ? 'page' : null },
          '📖 Theory', theoryDone && h('span', { class: 'tick', 'aria-label': 'done' }, '✓')),
        h('a', { href: `#/lesson/${lesson.id}/practice`, class: mode === 'practice' ? 'on' : '', 'aria-current': mode === 'practice' ? 'page' : null },
          '🎯 Practical', practiceDone && h('span', { class: 'tick', 'aria-label': 'done' }, '✓'))),
      extra),
  ];
}
