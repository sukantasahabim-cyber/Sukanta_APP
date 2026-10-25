import { h, createScope } from '../ui/dom.js';
import { store } from '../store.js';
import { findLesson, isUnlocked } from '../data/courses.js';
import { stepBlock } from '../widgets/index.js';
import { chime } from '../audio/engine.js';
import { notFound } from './notfound.js';

function quizView(questions, onAllCorrect) {
  const solved = new Array(questions.length).fill(false);
  return h('div', { class: 'quiz' },
    h('h3', {}, 'Quick check'),
    h('p', { class: 'step-label' }, 'Answer every question correctly to complete the lesson.'),
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
            feedback.textContent = `✓ ${q.explain || 'Correct!'}`;
            feedback.className = 'quiz-feedback good';
            if (solved.every(Boolean)) onAllCorrect();
          } else {
            e.currentTarget.classList.add('wrong');
            e.currentTarget.disabled = true;
            feedback.textContent = 'Not quite — try again.';
            feedback.className = 'quiz-feedback bad';
          }
        },
      }, opt));
      return h('div', { class: 'quiz-q' }, h('p', { class: 'quiz-text' }, `${qi + 1}. ${q.q}`), h('div', { class: 'quiz-options' }, options), feedback);
    }));
}

export function lessonView(scope, id) {
  const found = findLesson(id);
  if (!found) return notFound();
  const { course, lesson, index, list } = found;

  if (!isUnlocked(list, index, store.isDone)) {
    const prev = list[index - 1];
    return h('div', { class: 'container empty' },
      h('h1', {}, '🔒 Not unlocked yet'),
      h('p', {}, `Finish “${prev.title}” first — each lesson builds on the one before.`),
      h('a', { class: 'btn btn-primary', href: `#/lesson/${prev.id}` }, `Go to ${prev.title}`));
  }

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
  const backBtn = h('button', { class: 'btn btn-ghost', onClick: () => show(page - 1) }, '← Back');
  const nextBtn = h('button', { class: 'btn btn-primary', onClick: () => advance() });

  const next = list[index + 1];

  function complete() {
    stepScope.dispose();
    stepScope = createScope();
    const firstTime = store.complete(lesson.id, lesson.minutes);
    chime();
    body.replaceChildren(h('div', { class: 'celebrate' },
      h('div', { class: 'celebrate-icon', 'aria-hidden': 'true' }, '🎉'),
      h('h2', {}, 'Lesson complete!'),
      h('p', {}, firstTime ? `${lesson.minutes} practice minutes added to today.` : 'You have completed this lesson before — great revision!'),
      h('div', { class: 'controls center' },
        next
          ? h('a', { class: 'btn btn-primary', href: `#/lesson/${next.id}` }, `Next: ${next.title} →`)
          : h('a', { class: 'btn btn-primary', href: `#/course/${course.id}` }, `🏆 You finished ${course.name}!`),
        h('a', { class: 'btn btn-ghost', href: `#/course/${course.id}` }, 'Course overview'))));
    progressFill.style.width = '100%';
    counter.textContent = 'Done';
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
    counter.textContent = isQuiz ? 'Quiz' : `Step ${page + 1} of ${steps.length}`;
    backBtn.disabled = page === 0;
    const last = page === pages - 1;
    nextBtn.textContent = !last ? (hasQuiz && page === steps.length - 1 ? 'Take the quiz →' : 'Next →') : 'Complete lesson ✓';
    nextBtn.disabled = last && !quizPassed;
    window.scrollTo({ top: 0 });
  }

  show(0);

  return h('div', { class: `container lesson c-${course.id}` },
    h('a', { class: 'back', href: `#/course/${course.id}` }, `← ${course.name}`),
    h('header', { class: 'lesson-header' },
      h('span', { class: 'pill' }, `${course.icon} Lesson ${index + 1} · ${lesson.minutes} min`),
      h('h1', {}, lesson.title),
      h('div', { class: 'lesson-progress' }, h('div', { class: 'bar' }, progressFill), counter)),
    body,
    h('nav', { class: 'step-nav' }, backBtn, nextBtn));
}
