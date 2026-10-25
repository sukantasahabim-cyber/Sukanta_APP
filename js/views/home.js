import { h } from '../ui/dom.js';
import { store, dayKey } from '../store.js';
import { COURSES, courseProgress, practiceProgress, nextLesson, findLesson } from '../data/courses.js';
import { todaysPlan } from '../data/plan.js';

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
  const pp = practiceProgress(course, store.isPracticeDone);
  const next = nextLesson(course, isDone);
  return h('a', { class: `course-card c-${course.id}`, href: `#/course/${course.id}` },
    h('div', { class: 'course-icon', 'aria-hidden': 'true' }, course.icon),
    h('div', { class: 'course-body' },
      h('h3', {}, course.name),
      h('p', { class: 'muted' }, course.tagline),
      h('div', { class: 'bar' }, h('div', { class: 'bar-fill', style: { width: `${p.pct}%` } })),
      h('div', { class: 'course-meta' },
        h('span', {}, `📖 ${p.done}/${p.total} · 🎯 ${pp.done}/${pp.total}`),
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
  const goal = store.setting('dailyGoal') || 20;
  const goalPct = Math.min(100, Math.round((today / goal) * 100));
  const plan = todaysPlan({ lastLesson: s.lastLesson, isDone: store.isDone, isPracticeDone: store.isPracticeDone });

  return h('div', { class: 'container' },
    h('section', { class: 'hero' },
      h('h1', {}, 'Namaste! 🙏'),
      h('p', {}, 'Learn singing, tabla and guitar step by step, starting from the very beginning.'),
      h('div', { class: 'stats' },
        h('div', { class: 'stat' }, h('b', {}, `${streak} 🔥`), h('span', {}, 'day streak')),
        h('div', { class: 'stat' }, h('b', {}, today >= goal ? `${today} 🎉` : `${today}/${goal}`), h('span', {}, 'min today')),
        h('div', { class: 'stat' }, h('b', {}, `${Object.keys(s.completed).length}`), h('span', {}, 'lessons done'))),
      h('div', { class: 'goal', role: 'progressbar', 'aria-label': 'Daily practice goal', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': goalPct },
        h('div', { class: 'goal-fill', style: { width: `${goalPct}%` } })),
      h('p', { class: 'goal-text' }, today >= goal
        ? `Daily goal reached — ${goal} minutes. Wonderful! 🎉`
        : `${goal - today} more minute${goal - today === 1 ? '' : 's'} to reach today's goal of ${goal}.`)),
    h('section', { class: 'plan' },
      h('h2', { class: 'section-title' }, "Today's plan"),
      h('ol', { class: 'plan-list' }, plan.map((item) => h('li', {},
        h('a', { class: 'resume', href: item.href },
          h('span', { class: 'resume-icon', 'aria-hidden': 'true' }, item.icon),
          h('div', {}, h('div', { class: 'resume-title' }, item.title), h('small', { class: 'muted' }, item.detail)),
          h('span', { class: 'resume-go', 'aria-hidden': 'true' }, '▶')))))),
    h('div', { class: 'mode-cards' },
      h('a', { class: 'mode-card', href: resume ? `#/lesson/${resume.lesson.id}` : '#/course/singing' },
        h('span', { class: 'mode-icon', 'aria-hidden': 'true' }, '📖'),
        h('b', {}, 'Theory'),
        h('span', { class: 'muted small' }, 'Learn step by step: read, listen, then take a quick quiz.')),
      h('a', { class: 'mode-card', href: '#/practice' },
        h('span', { class: 'mode-icon', 'aria-hidden': 'true' }, '🎯'),
        h('b', {}, 'Practical'),
        h('span', { class: 'muted small' }, 'Play or sing — the app listens and tells you what is right or wrong.'))),
    h('h2', { class: 'section-title' }, 'Choose what to learn'),
    h('div', { class: 'course-list' }, COURSES.map(courseCard)),
    h('div', { class: 'tip' }, h('span', { class: 'tip-icon', 'aria-hidden': 'true' }, '💡'), h('div', {}, h('b', {}, 'Riyaz tip: '), tip)));
}
