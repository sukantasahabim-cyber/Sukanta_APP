import { h, createScope } from '../ui/dom.js';
import { store } from '../store.js';
import { findLesson, isUnlocked } from '../data/courses.js';
import { stepBlock } from '../widgets/index.js';
import { chime } from '../audio/engine.js';
import { notFound } from './notfound.js';
import { lessonHeader } from './lessonHeader.js';
import { t } from '../i18n/i18n.js';

function quizView(questions, onAllCorrect) {
  const solved = new Array(questions.length).fill(false);
  return h('div', { class: 'quiz' },
    h('h2', {}, t('quiz.title')),
    h('p', { class: 'step-label' }, t('quiz.intro')),
    questions.map((q, qi) => {
      const feedback = h('p', { class: 'quiz-feedback', 'aria-live': 'polite' });
      const options = q.options.map((opt, oi) => h('button', {
        class: 'quiz-option',
        onClick: (e) => {
          if (solved[qi]) return;
          if (oi === q.answer) {
            solved[qi] = true;
            e.currentTarget.classList.add('correct');
            options.forEach((b) => { b.disabled = true; });
            feedback.textContent = `✓ ${q.explain || t('quiz.correct')}`;
            feedback.className = 'quiz-feedback good';
            if (solved.every(Boolean)) onAllCorrect();
          } else {
            e.currentTarget.classList.add('wrong');
            e.currentTarget.disabled = true;
            feedback.textContent = t('quiz.tryAgain');
            feedback.className = 'quiz-feedback bad';
          }
        },
      }, opt));
      return h('div', { class: 'quiz-q' }, h('p', { class: 'quiz-text' }, `${qi + 1}. ${q.q}`), h('div', { class: 'quiz-options' }, options), feedback);
    }));
}

export function lockedView({ list, index }) {
  const prev = list[index - 1];
  return h('div', { class: 'container empty' },
    h('h1', {}, t('locked.title')),
    h('p', {}, t('locked.text', { title: prev.title })),
    h('a', { class: 'btn btn-primary', href: `#/lesson/${prev.id}` }, t('locked.go', { title: prev.title })));
}

export function lessonView(scope, id) {
  const found = findLesson(id);
  if (!found) return notFound();
  const { course, lesson, index, list } = found;
  if (!isUnlocked(list, index, store.isDone)) return lockedView(found);

  store.setLastLesson(lesson.id);
  const steps = lesson.steps;
  const hasQuiz = Boolean(lesson.quiz?.length);
  const pages = steps.length + (hasQuiz ? 1 : 0);
  let page = 0;
  let quizPassed = !hasQuiz;
  let stepScope = createScope();
  scope.onCleanup(() => stepScope.dispose());

  const body = h('div', { class: 'step-card' });
  const progressFill = h('div', { class: 'bar-fill' });
  const counter = h('span', { class: 'muted small' });
  const backBtn = h('button', { class: 'btn btn-ghost', onClick: () => show(page - 1) }, t('common.back'));
  const nextBtn = h('button', { class: 'btn btn-primary', onClick: () => advance() });

  const next = list[index + 1];

  function complete() {
    stepScope.dispose();
    stepScope = createScope();
    const firstTime = store.complete(lesson.id, lesson.minutes);
    chime();
    body.replaceChildren(h('div', { class: 'celebrate' },
      h('div', { class: 'celebrate-icon', 'aria-hidden': 'true' }, '🎉'),
      h('h2', {}, t('lesson.complete')),
      h('p', {}, firstTime ? t('lesson.minutesAdded', { n: lesson.minutes }) : t('lesson.revision')),
      h('p', {}, store.isPracticeDone(lesson.id)
        ? t('lesson.practicalDone')
        : t('lesson.tryPractical')),
      h('div', { class: 'controls center' },
        !store.isPracticeDone(lesson.id) && h('a', { class: 'btn btn-primary', href: `#/lesson/${lesson.id}/practice` }, t('lesson.startPractical')),
        next
          ? h('a', { class: 'btn btn-ghost', href: `#/lesson/${next.id}` }, t('lesson.next', { title: next.title }))
          : h('a', { class: 'btn btn-ghost', href: `#/course/${course.id}` }, t('lesson.courseDone', { name: course.name })),
        h('a', { class: 'btn btn-ghost', href: `#/course/${course.id}` }, t('lesson.overview')))));
    progressFill.style.width = '100%';
    counter.textContent = t('common.done');
    backBtn.hidden = true;
    nextBtn.hidden = true;
  }

  function advance() {
    if (page < pages - 1) show(page + 1);
    else if (quizPassed) complete();
  }

  function show(i) {
    stepScope.dispose();
    stepScope = createScope();
    page = Math.max(0, Math.min(pages - 1, i));
    const isQuiz = hasQuiz && page === steps.length;
    body.replaceChildren(isQuiz
      ? quizView(lesson.quiz, () => { quizPassed = true; nextBtn.disabled = false; })
      : stepBlock(steps[page], stepScope));
    progressFill.style.width = `${(page / pages) * 100}%`;
    counter.textContent = isQuiz ? t('quiz.short') : t('lesson.step', { n: page + 1, total: steps.length });
    backBtn.disabled = page === 0;
    const last = page === pages - 1;
    nextBtn.textContent = !last ? (hasQuiz && page === steps.length - 1 ? t('quiz.take') : t('common.next')) : t('lesson.completeBtn');
    nextBtn.disabled = last && !quizPassed;
    window.scrollTo({ top: 0 });
  }

  show(0);

  return h('div', { class: `container lesson c-${course.id}` },
    lessonHeader(found, 'theory', h('div', { class: 'lesson-progress' }, h('div', { class: 'bar' }, progressFill), counter)),
    body,
    h('nav', { class: 'step-nav' }, backBtn, nextBtn));
}
