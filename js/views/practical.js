import { h, toast } from '../ui/dom.js';
import { store } from '../store.js';
import { findLesson, isUnlocked, lessonsOf, COURSES, getCourse } from '../data/courses.js';
import * as practice from '../widgets/practice.js';
import { notFound } from './notfound.js';
import { lockedView } from './lesson.js';
import { lessonHeader } from './lessonHeader.js';
import { micCheck } from '../widgets/micCheck.js';
import { t } from '../i18n/i18n.js';
import { exerciseDemo } from '../widgets/demo.js';
import { setNotationContext } from '../i18n/notation.js';
import { lessonSearchUrl } from '../data/youtube.js';
import { aiAvailable, setPendingQuestion } from '../online/ai.js';
import { fixSection } from './fix.js';

const EXERCISES = {
  hold: practice.hold,
  range: practice.range,
  sing: practice.sing,
  notes: practice.notes,
  chord: practice.chord,
  changes: practice.changes,
  rhythm: practice.rhythm,
};

const TIPS = { singing: 'practical.tipSinging', voice: 'practical.tipSinging', tabla: 'practical.tipTabla', guitar: 'practical.tipGuitar' };

function scoreBadge(lessonId, index) {
  const best = store.practiceBest(lessonId, index);
  if (best == null) return h('span', { class: 'badge' }, t('practical.notTried'));
  return store.practicePassed(lessonId, index)
    ? h('span', { class: 'badge pass' }, t('practical.passed', { n: best }))
    : h('span', { class: 'badge fail' }, t('practical.best', { n: best }));
}

export function practicalView(scope, id) {
  const found = findLesson(id);
  if (!found) return notFound();
  const { course, lesson, index, list } = found;
  setNotationContext(course.id);
  if (!isUnlocked(list, index, store.isDone)) return lockedView(found);
  store.setLastLesson(lesson.id);

  const exercises = lesson.practice;
  const next = list[index + 1];
  // Mistakes that keep coming back in this course, refreshed after every attempt.
  const fixSlot = h('div', {}, fixSection({ course: course.id }));
  const refreshFix = () => fixSlot.replaceChildren(fixSection({ course: course.id }) || '');
  const summary = h('div', { class: 'step-card celebrate', hidden: !store.isPracticeDone(lesson.id) },
    h('div', { class: 'celebrate-icon', 'aria-hidden': 'true' }, '🎯'),
    h('h2', {}, t('practical.complete')),
    h('p', {}, t('practical.completeText')),
    h('div', { class: 'controls center' },
      next && store.isDone(lesson.id) && h('a', { class: 'btn btn-primary', href: `#/lesson/${next.id}` }, t('lesson.next', { title: next.title })),
      !store.isDone(lesson.id) && h('a', { class: 'btn btn-primary', href: `#/lesson/${lesson.id}` }, t('practical.finishTheory')),
      h('a', { class: 'btn btn-ghost', href: `#/practice/${course.id}` }, t('practical.all'))));

  const cards = exercises.map((ex, i) => {
    const badgeSlot = h('span', {}, scoreBadge(lesson.id, i));
    const askSlot = h('div', { class: 'ask-teacher' });
    // After an attempt, the AI teacher can turn the result into tips.
    const offerTips = (score, passed) => aiAvailable().then((ok) => {
      if (!ok) return;
      askSlot.replaceChildren(h('button', {
        class: 'btn btn-sm', type: 'button',
        onClick: () => {
          const details = card.querySelector('.ex-result')?.innerText.trim() || '';
          setPendingQuestion(lesson.id, t('ai.resultQuestion', { title: ex.title, score, verdict: t(passed ? 'ai.passed' : 'ai.notPassed') }) + (details ? `\n\n${details}` : ''));
          location.hash = `#/teacher/${lesson.id}`;
        },
      }, `🧑‍🏫 ${t('ai.askTips')}`));
    });
    const report = (score, passed, obs) => {
      store.recordAttempt({ course: course.id, lesson: lesson.id, ex: i, obs });
      refreshFix();
      const newlyDone = store.recordPractice(lesson.id, i, score, passed, exercises.length);
      badgeSlot.replaceChildren(scoreBadge(lesson.id, i));
      offerTips(score, passed);
      if (newlyDone) {
        summary.hidden = false;
        toast(t('practical.complete'));
      }
    };
    const card = h('section', { class: 'step-card exercise-card' },
      h('div', { class: 'exercise-head' }, h('h2', {}, `${i + 1}. ${ex.title}`), badgeSlot),
      ex.label && h('p', { class: 'step-label' }, ex.label),
      exerciseDemo(ex),
      EXERCISES[ex.type](ex, scope, report),
      askSlot);
    return card;
  });

  return h('div', { class: `container lesson c-${course.id}` },
    lessonHeader(found, 'practice'),
    h('div', { class: 'tip' }, h('span', { class: 'tip-icon', 'aria-hidden': 'true' }, '🎧'),
      h('div', {},
        h('b', {}, t('practical.modeLabel')), `${t('practical.modeText')} `,
        t(TIPS[course.id]))),
    fixSlot,
    course.id !== 'guitar' && h('p', { class: 'teacher-videos' },
      h('a', {
        class: 'btn btn-sm', target: '_blank', rel: 'noopener',
        href: lessonSearchUrl(`${lesson.title} ${t(`demo.searchWord.${course.id}`)}`),
      }, `🎬 ${t('demo.youtube')}`),
      h('span', { class: 'small muted' }, ` ${t('demo.youtubeNote')}`)),
    h('details', { class: 'step-card mic-details' },
      h('summary', {}, t('practical.micSummary')),
      h('p', { class: 'muted small' }, t('practical.micHelp')),
      micCheck({}, scope)),
    cards,
    summary);
}

// Practice hub: every lesson's practical, per course.
export function practiceHubView(_scope, courseId = COURSES[0].id) {
  const course = getCourse(courseId);
  if (!course) return notFound();
  setNotationContext(course.id);
  const list = lessonsOf(course);
  return h('div', { class: `container c-${course.id}` },
    h('h1', {}, t('practical.hubTitle')),
    h('p', { class: 'muted' }, t('practical.hubIntro')),
    h('p', {}, h('a', { class: 'btn btn-sm', href: '#/fix' }, `🩺 ${t('fix.title')}`)),
    h('div', { class: 'segmented', role: 'group', 'aria-label': t('practical.course') },
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
        : h('div', { class: cls, title: t('practical.locked') }, content));
    })));
}
