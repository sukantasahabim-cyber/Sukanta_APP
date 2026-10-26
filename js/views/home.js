import { h } from '../ui/dom.js';
import { store, dayKey } from '../store.js';
import { COURSES, courseProgress, practiceProgress, nextLesson, findLesson } from '../data/courses.js';
import { todaysPlan } from '../data/plan.js';
import { t } from '../i18n/i18n.js';

const TIP_COUNT = 7;  // home.tip1 … home.tip7

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
        h('span', { class: 'link' }, p.done === 0 ? t('home.start') : next ? t('home.continue') : t('home.completed')))));
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

  const tip = t(`home.tip${(new Date().getDate() % TIP_COUNT) + 1}`);
  const goal = store.setting('dailyGoal') || 20;
  const goalPct = Math.min(100, Math.round((today / goal) * 100));
  const plan = todaysPlan({ lastLesson: s.lastLesson, isDone: store.isDone, isPracticeDone: store.isPracticeDone });

  return h('div', { class: 'container' },
    h('section', { class: 'hero' },
      h('h1', {}, t('home.hello')),
      h('p', {}, t('home.intro')),
      h('div', { class: 'stats' },
        h('div', { class: 'stat' }, h('b', {}, `${streak} 🔥`), h('span', {}, t('stat.streak'))),
        h('div', { class: 'stat' }, h('b', {}, today >= goal ? `${today} 🎉` : `${today}/${goal}`), h('span', {}, t('stat.today'))),
        h('div', { class: 'stat' }, h('b', {}, `${Object.keys(s.completed).length}`), h('span', {}, t('stat.lessons')))),
      h('div', { class: 'goal', role: 'progressbar', 'aria-label': t('goal.label'), 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': goalPct },
        h('div', { class: 'goal-fill', style: { width: `${goalPct}%` } })),
      h('p', { class: 'goal-text' }, today >= goal
        ? t('goal.reached', { n: goal })
        : t('goal.more', { n: goal - today, goal }))),
    h('section', { class: 'plan' },
      h('h2', { class: 'section-title' }, t('plan.title')),
      h('ol', { class: 'plan-list' }, plan.map((item) => h('li', {},
        h('a', { class: 'resume', href: item.href },
          h('span', { class: 'resume-icon', 'aria-hidden': 'true' }, item.icon),
          h('div', {}, h('div', { class: 'resume-title' }, item.title), h('small', { class: 'muted' }, item.detail)),
          h('span', { class: 'resume-go', 'aria-hidden': 'true' }, '▶')))))),
    h('div', { class: 'mode-cards' },
      h('a', { class: 'mode-card', href: resume ? `#/lesson/${resume.lesson.id}` : '#/course/singing' },
        h('span', { class: 'mode-icon', 'aria-hidden': 'true' }, '📖'),
        h('b', {}, t('mode.theory')),
        h('span', { class: 'muted small' }, t('mode.theoryDesc'))),
      h('a', { class: 'mode-card', href: '#/practice' },
        h('span', { class: 'mode-icon', 'aria-hidden': 'true' }, '🎯'),
        h('b', {}, t('mode.practical')),
        h('span', { class: 'muted small' }, t('mode.practicalDesc')))),
    h('a', { class: 'studio-banner c-singing', href: '#/sing' },
      h('span', { class: 'studio-icon', 'aria-hidden': 'true' }, '🎙️'),
      h('span', {}, h('b', {}, t('sing.title')), h('span', { class: 'small' }, t('sing.bannerDesc'))),
      h('span', { class: 'resume-go', 'aria-hidden': 'true' }, '▶')),
    h('a', { class: 'studio-banner c-studio', href: '#/studio' },
      h('span', { class: 'studio-icon', 'aria-hidden': 'true' }, '🎼'),
      h('span', {}, h('b', {}, t('composer.title')), h('span', { class: 'small' }, t('composer.bannerDesc'))),
      h('span', { class: 'resume-go', 'aria-hidden': 'true' }, '▶')),
    h('h2', { class: 'section-title' }, t('home.choose')),
    h('div', { class: 'course-list' }, COURSES.map(courseCard)),
    h('div', { class: 'tip' }, h('span', { class: 'tip-icon', 'aria-hidden': 'true' }, '💡'), h('div', {}, h('b', {}, t('home.tipLabel')), tip)));
}
