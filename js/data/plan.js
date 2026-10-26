// "Today's plan": a short, concrete list of what to practise next.
import { COURSES, findLesson, lessonsOf, isUnlocked } from './courses.js';
import { t } from '../i18n/i18n.js';

const WARMUPS = {
  singing: { icon: '🪕', key: 'plan.warmSinging', href: '#/tools/tanpura' },
  voice: { icon: '🎵', key: 'plan.warmVoice', href: '#/tools/pitch' },
  tabla: { icon: '🥁', key: 'plan.warmTabla', href: '#/tools/taal' },
  guitar: { icon: '🎸', key: 'plan.warmGuitar', href: '#/tools/tuner' },
};

export function todaysPlan({ lastLesson, isDone, isPracticeDone, date = new Date() }) {
  const last = lastLesson && findLesson(lastLesson);
  const focus = last ? last.course : COURSES[0];
  // Focus course first, then the others.
  const order = [focus, ...COURSES.filter((c) => c !== focus)];
  const items = [];

  for (const course of order) {
    const lesson = lessonsOf(course).find((l) => !isDone(l.id));
    if (lesson) {
      items.push({ icon: '📖', title: t('plan.theory', { title: lesson.title }), detail: `${course.name} · ${t('unit.min', { n: lesson.minutes })}`, href: `#/lesson/${lesson.id}` });
      break;
    }
  }

  for (const course of order) {
    const list = lessonsOf(course);
    const lesson = list.find((l) => isDone(l.id) && !isPracticeDone(l.id))
      || list.find((l, i) => isUnlocked(list, i, isDone) && !isPracticeDone(l.id));
    if (lesson) {
      items.push({ icon: '🎯', title: t('plan.practical', { title: lesson.title }), detail: `${course.name} · ${t('plan.exercises', { n: lesson.practice.length })}`, href: `#/lesson/${lesson.id}/practice` });
      break;
    }
  }

  // Alternate between an instrument warm-up and ear training.
  const extra = date.getDate() % 2 ? WARMUPS[focus.id] : { icon: '👂', key: 'plan.ear', href: '#/tools/ear' };
  items.push({ icon: extra.icon, title: t(extra.key), detail: t(`${extra.key}Detail`), href: extra.href });
  return items;
}
