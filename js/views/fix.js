// "What to fix": the mistakes that keep coming back in practice, and a short
// drill for each (see data/coach.js).
import { h, createScope } from '../ui/dom.js';
import { swaraWord } from '../ui/controls.js';
import { store } from '../store.js';
import { t } from '../i18n/i18n.js';
import { bolName } from '../i18n/names.js';
import { setNotationContext } from '../i18n/notation.js';
import { parseSwara } from '../music.js';
import { findLesson, getCourse } from '../data/courses.js';
import { findProblems, openProblems, drillFor } from '../data/coach.js';
import * as practice from '../widgets/practice.js';

// Title, explanation and how-to-fix tip for each kind of mistake.
const TEXT = {
  flat: ['fix.flat', 'fix.flatDetail', 'fix.flatTip'],
  sharp: ['fix.sharp', 'fix.sharpDetail', 'fix.sharpTip'],
  wrong: ['fix.wrong', 'fix.wrongDetail', 'fix.wrongTip'],
  steady: ['fix.steady', 'fix.steadyDetail', 'fix.steadyTip'],
  late: ['fix.late', 'fix.lateDetail', 'fix.lateTip'],
  early: ['fix.early', 'fix.earlyDetail', 'fix.earlyTip'],
  missed: ['fix.missed', 'fix.missedDetail', 'fix.missedTip'],
  sound: ['fix.sound', 'fix.soundDetail', 'fix.soundTip'],
  rushing: ['fix.rushing', 'fix.rushingDetail', 'fix.rushingTip'],
  dragging: ['fix.dragging', 'fix.draggingDetail', 'fix.draggingTip'],
};

const cents = (v) => (Math.abs(v) < 10 ? t('fix.inTune') : t(v < 0 ? 'fix.centsLow' : 'fix.centsHigh', { n: Math.round(Math.abs(v)) }));
const tempo = (v) => (Math.abs(v) < 3 ? t('fix.onTempo') : t(v > 0 ? 'fix.faster' : 'fix.slower', { n: Math.round(Math.abs(v)) }));

// How one day of practice measured up, in the problem's own terms.
function dayText(p, d) {
  if (p.kind === 'flat' || p.kind === 'sharp') return cents(d.value);
  if (p.kind === 'steady') return t('fix.wobble', { n: Math.round(d.value) });
  if (p.kind === 'rushing' || p.kind === 'dragging') return tempo(d.value);
  return t('fix.nOf', { n: d.n, total: d.total });
}

function problemText(p) {
  const sw = parseSwara(p.key);
  const vars = {
    name: sw ? swaraWord(sw) : '',
    bol: p.key === 'X' ? t('fix.anyStroke') : bolName(p.key),
    heard: p.heard ? t(`family.${p.heard}`) : '',
    n: p.value, count: p.count, total: p.total,
  };
  const [title, detail, tip] = TEXT[p.kind];
  return {
    title: t(title, vars),
    detail: t(detail, vars),
    tip: t(tip, vars),
    progress: p.before && t('fix.progress', { before: dayText(p, p.before), now: dayText(p, p.now) }),
  };
}

const statusBadge = (p) => (p.status === 'fixed'
  ? h('span', { class: 'badge pass' }, t('fix.fixed'))
  : p.status === 'better' ? h('span', { class: 'badge pass' }, t('fix.better')) : null);

const fixHref = (p) => `#/fix/${encodeURIComponent(p.id)}`;

export function fixCard(p) {
  setNotationContext(p.course);
  const text = problemText(p);
  return h('a', { class: `resume fix-card c-${p.course}`, href: fixHref(p) },
    h('span', { class: 'resume-icon', 'aria-hidden': 'true' }, getCourse(p.course)?.icon || '🎯'),
    h('div', { class: 'fix-body' },
      h('div', { class: 'resume-title' }, text.title, ' ', statusBadge(p)),
      h('small', { class: 'muted' }, text.detail),
      text.progress && h('small', { class: 'fix-progress' }, text.progress)),
    h('span', { class: 'resume-go', 'aria-hidden': 'true' }, '▶'));
}

// The top repeated mistakes, for the home and practical pages. Null when there are none.
export function fixSection({ course = null, limit = 2 } = {}) {
  const shown = openProblems(findProblems(store.attempts(), { course })).slice(0, limit);
  if (!shown.length) return null;
  const cards = shown.map(fixCard);
  setNotationContext(course);
  return h('section', { class: 'fix-section' },
    h('div', { class: 'fix-head' },
      h('h2', { class: 'section-title' }, t('fix.homeTitle')),
      h('a', { class: 'btn btn-sm btn-ghost', href: '#/fix' }, t('fix.all'))),
    h('div', { class: 'plan-list' }, cards));
}

export function fixListView() {
  const attempts = store.attempts();
  const problems = findProblems(attempts);
  const cards = problems.map(fixCard);
  setNotationContext(null);
  return h('div', { class: 'container' },
    h('h1', {}, t('fix.title')),
    h('p', { class: 'muted' }, t('fix.intro')),
    cards.length
      ? h('div', { class: 'plan-list' }, cards)
      : h('div', { class: 'tip' }, h('span', { class: 'tip-icon', 'aria-hidden': 'true' }, attempts.length ? '🎉' : '🎧'),
        h('div', {}, t(attempts.length ? 'fix.none' : 'fix.empty'))),
    h('p', {}, h('a', { class: 'btn', href: '#/practice' }, t('fix.toPractice'))));
}

function exerciseCard(title, label, widget) {
  return h('section', { class: 'step-card exercise-card' },
    h('div', { class: 'exercise-head' }, h('h2', {}, title)),
    label && h('p', { class: 'step-label' }, label),
    widget);
}

export function fixDrillView(scope, rawId) {
  let id = rawId;
  try { id = decodeURIComponent(rawId); } catch { /* keep as typed */ }
  const find = () => findProblems(store.attempts()).find((p) => p.id === id);
  const problem = find();
  const back = h('a', { class: 'btn btn-sm btn-ghost', href: '#/fix' }, t('fix.back'));
  if (!problem) {
    return h('div', { class: 'container' }, back, h('h1', {}, t('fix.title')), h('p', {}, t('fix.gone')));
  }
  setNotationContext(problem.course);
  const text = problemText(problem);
  const source = problem.source;
  const fixed = h('div', { class: 'tip fix-done', hidden: true },
    h('span', { class: 'tip-icon', 'aria-hidden': 'true' }, '🎉'), h('div', {}, t('fix.nowFixed')));

  // Drill attempts count towards "What to fix" like any other practice.
  const record = (obs) => {
    store.recordAttempt({ course: problem.course, lesson: source?.lesson ?? 'fix', ex: source?.ex ?? 0, obs });
    if (find()?.status === 'fixed') fixed.hidden = false;
  };

  const base = source && findLesson(source.lesson)?.lesson.practice[source.ex];
  const drill = drillFor(problem, base?.bpm);
  let steps;
  if (drill.steps) {
    steps = drill.steps.map((ex, i) => {
      const sw = parseSwara(ex.note || '');
      const title = ex.type === 'hold' ? t('fix.stepHold', { name: swaraWord(sw), n: ex.seconds }) : t('fix.stepSing');
      return exerciseCard(`${i + 1}. ${title}`, null, practice[ex.type](ex, scope, (score, passed, obs) => record(obs)));
    });
  } else if (base?.type === 'rhythm') {
    let bpm = drill.startBpm;
    let child = null;
    const heading = h('h2', {});
    const slot = h('div', {});
    const next = h('div', { class: 'controls' });
    const onReport = (score, passed, obs) => {
      record(obs);
      if (!passed) return;
      if (bpm >= drill.targetBpm) {
        next.replaceChildren(h('p', { class: 'ex-status good' }, t('fix.fullSpeed')));
        return;
      }
      const up = Math.min(drill.targetBpm, bpm + drill.step);
      next.replaceChildren(h('button', {
        class: 'btn btn-primary', type: 'button',
        onClick: () => { bpm = up; mount(); },
      }, t('fix.nextBpm', { bpm: up })));
    };
    const mount = () => {
      child?.dispose();
      child = createScope();
      heading.textContent = t('fix.stepSpeed', { bpm });
      next.replaceChildren();
      slot.replaceChildren(practice.rhythm({ ...base, bpm }, child, onReport));
    };
    scope.onCleanup(() => child?.dispose());
    mount();
    steps = [h('section', { class: 'step-card exercise-card' },
      h('div', { class: 'exercise-head' }, heading),
      h('p', { class: 'step-label' }, t('fix.speedLabel', { target: drill.targetBpm })),
      slot, next)];
  } else {
    steps = [h('p', { class: 'muted' }, t('fix.noDrill'))];
  }

  return h('div', { class: `container lesson c-${problem.course}` },
    back,
    h('h1', {}, text.title),
    h('p', {}, text.detail),
    text.progress && h('p', { class: 'fix-progress' }, text.progress),
    h('div', { class: 'tip' }, h('span', { class: 'tip-icon', 'aria-hidden': 'true' }, '🩺'),
      h('div', {}, h('b', {}, t('fix.howLabel')), ` ${text.tip}`)),
    fixed,
    steps);
}
