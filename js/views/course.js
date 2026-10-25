import { h } from '../ui/dom.js';
import { store } from '../store.js';
import { getCourse, lessonsOf, isUnlocked, courseProgress, practiceProgress } from '../data/courses.js';
import { notFound } from './notfound.js';

export function courseView(_scope, id) {
  const course = getCourse(id);
  if (!course) return notFound();
  const list = lessonsOf(course);
  const p = courseProgress(course, store.isDone);
  const pp = practiceProgress(course, store.isPracticeDone);
  let number = 0;

  return h('div', { class: 'container' },
    h('a', { class: 'back', href: '#/' }, '← All courses'),
    h('header', { class: `course-header c-${course.id}` },
      h('div', { class: 'course-icon big', 'aria-hidden': 'true' }, course.icon),
      h('div', {},
        h('h1', {}, course.name),
        h('p', { class: 'muted' }, course.tagline),
        h('div', { class: 'bar' }, h('div', { class: 'bar-fill', style: { width: `${p.pct}%` } })),
        h('small', { class: 'muted' }, `📖 Theory ${p.done}/${p.total} · 🎯 Practical ${pp.done}/${pp.total}`))),
    course.levels.map((level) => h('section', { class: 'level' },
      h('h2', { class: 'section-title' }, level.title),
      h('ol', { class: 'lesson-list' }, level.lessons.map((lesson) => {
        const index = list.indexOf(lesson);
        number++;
        const done = store.isDone(lesson.id);
        const open = isUnlocked(list, index, store.isDone);
        const isNext = open && !done;
        const content = [
          h('span', { class: 'lesson-num' }, done ? '✓' : open ? String(number) : '🔒'),
          h('span', { class: 'lesson-title' }, lesson.title),
          h('span', { class: 'lesson-min muted' }, `${lesson.minutes} min`),
        ];
        const cls = `lesson-item${done ? ' done' : ''}${isNext ? ' next' : ''}${open ? '' : ' locked'}`;
        const practiced = store.isPracticeDone(lesson.id);
        return h('li', { class: 'lesson-row' }, open
          ? [
            h('a', { class: cls, href: `#/lesson/${lesson.id}`, title: 'Theory' }, content),
            h('a', { class: `practice-link${practiced ? ' done' : ''}`, href: `#/lesson/${lesson.id}/practice`, title: 'Practical', 'aria-label': `Practical${practiced ? ' (passed)' : ''}` }, practiced ? '🎯✓' : '🎯'),
          ]
          : h('div', { class: cls, title: 'Finish the previous lesson to unlock' }, content));
      })))));
}
