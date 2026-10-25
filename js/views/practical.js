import { h, toast } from '../ui/dom.js';
import { store } from '../store.js';
import { findLesson, isUnlocked, lessonsOf, COURSES, getCourse } from '../data/courses.js';
import * as practice from '../widgets/practice.js';
import { notFound } from './notfound.js';
import { lockedView } from './lesson.js';
import { lessonHeader } from './lessonHeader.js';
import { micCheck } from '../widgets/micCheck.js';

const EXERCISES = {
  hold: practice.hold,
  range: practice.range,
  sing: practice.sing,
  notes: practice.notes,
  chord: practice.chord,
  changes: practice.changes,
  rhythm: practice.rhythm,
};

const TIPS = {
  singing: 'Sit or stand in a quiet room, about an arm\'s length from your phone or computer. Your Sa is used to judge the notes — set it in Progress → Settings.',
  tabla: 'Place the phone or laptop about a metre from your tabla. The count-in clicks come from the speaker; wear headphones if you can, so the app hears only your tabla.',
  guitar: 'Tune your guitar first (Tools → Guitar Tuner). Hold the phone or laptop near the sound hole, in a quiet room.',
};

function scoreBadge(lessonId, index) {
  const best = store.practiceBest(lessonId, index);
  if (best == null) return h('span', { class: 'badge' }, 'Not tried');
  return store.practicePassed(lessonId, index)
    ? h('span', { class: 'badge pass' }, `✓ Passed · best ${best}%`)
    : h('span', { class: 'badge fail' }, `Best ${best}% · not passed yet`);
}

export function practicalView(scope, id) {
  const found = findLesson(id);
  if (!found) return notFound();
  const { course, lesson, index, list } = found;
  if (!isUnlocked(list, index, store.isDone)) return lockedView(found);
  store.setLastLesson(lesson.id);

  const exercises = lesson.practice;
  const next = list[index + 1];
  const summary = h('div', { class: 'step-card celebrate', hidden: !store.isPracticeDone(lesson.id) },
    h('div', { class: 'celebrate-icon', 'aria-hidden': 'true' }, '🎯'),
    h('h2', {}, 'Practical complete!'),
    h('p', {}, 'You passed every exercise in this lesson.'),
    h('div', { class: 'controls center' },
      next && store.isDone(lesson.id) && h('a', { class: 'btn btn-primary', href: `#/lesson/${next.id}` }, `Next lesson: ${next.title} →`),
      !store.isDone(lesson.id) && h('a', { class: 'btn btn-primary', href: `#/lesson/${lesson.id}` }, '📖 Finish the theory →'),
      h('a', { class: 'btn btn-ghost', href: `#/practice/${course.id}` }, 'All practicals')));

  const cards = exercises.map((ex, i) => {
    const badgeSlot = h('span', {}, scoreBadge(lesson.id, i));
    const report = (score, passed) => {
      const newlyDone = store.recordPractice(lesson.id, i, score, passed, exercises.length);
      badgeSlot.replaceChildren(scoreBadge(lesson.id, i));
      if (newlyDone) {
        summary.hidden = false;
        toast('🎯 Practical complete!');
      }
    };
    return h('section', { class: 'step-card exercise-card' },
      h('div', { class: 'exercise-head' }, h('h2', {}, `${i + 1}. ${ex.title}`), badgeSlot),
      ex.label && h('p', { class: 'step-label' }, ex.label),
      EXERCISES[ex.type](ex, scope, report));
  });

  return h('div', { class: `container lesson c-${course.id}` },
    lessonHeader(found, 'practice'),
    h('div', { class: 'tip' }, h('span', { class: 'tip-icon', 'aria-hidden': 'true' }, '🎧'),
      h('div', {},
        h('b', {}, 'Practical mode: '), 'press Start, then play or sing. The app listens through your microphone and marks each part ✓ correct or ✗ wrong. ',
        TIPS[course.id])),
    h('details', { class: 'step-card mic-details' },
      h('summary', {}, '🎙️ Microphone check & sensitivity'),
      h('p', { class: 'muted small' }, 'Not being heard, or marked wrong when you are right? Run this check once in each place you practise.'),
      micCheck({}, scope)),
    cards,
    summary);
}

// Practice hub: every lesson's practical, per course.
export function practiceHubView(_scope, courseId = COURSES[0].id) {
  const course = getCourse(courseId);
  if (!course) return notFound();
  const list = lessonsOf(course);
  return h('div', { class: `container c-${course.id}` },
    h('h1', {}, '🎯 Practical mode'),
    h('p', { class: 'muted' }, 'Play or sing, and the app listens and tells you what was right or wrong. A lesson\'s practical opens as soon as you reach that lesson.'),
    h('div', { class: 'segmented', role: 'group', 'aria-label': 'Course' },
      COURSES.map((c) => h('a', { class: `seg${c.id === course.id ? ' on' : ''}`, href: `#/practice/${c.id}` }, `${c.icon} ${c.name}`))),
    h('ol', { class: 'lesson-list practice-list' }, list.map((lesson, i) => {
      const open = isUnlocked(list, i, store.isDone);
      const done = store.isPracticeDone(lesson.id);
      const passed = lesson.practice.filter((_, k) => store.practicePassed(lesson.id, k)).length;
      const content = [
        h('span', { class: 'lesson-num' }, done ? '✓' : open ? String(i + 1) : '🔒'),
        h('span', { class: 'lesson-title' }, lesson.title, h('small', { class: 'muted' }, ` · ${lesson.practice.map((e) => e.title).join(', ')}`)),
        h('span', { class: 'lesson-min muted' }, `${passed}/${lesson.practice.length}`),
      ];
      const cls = `lesson-item${done ? ' done' : ''}${open ? '' : ' locked'}`;
      return h('li', {}, open
        ? h('a', { class: cls, href: `#/lesson/${lesson.id}/practice` }, content)
        : h('div', { class: cls, title: 'Reach this lesson in theory to unlock' }, content));
    })));
}
