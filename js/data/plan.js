// "Today's plan": a short, concrete list of what to practise next.
import { COURSES, findLesson, lessonsOf, isUnlocked } from './courses.js';

const WARMUPS = {
  singing: { icon: '🪕', title: 'Warm up with the tanpura', detail: '5 minutes of humming and long Sa', href: '#/tools/tanpura' },
  tabla: { icon: '🥁', title: 'Warm up with the taal player', detail: 'Play Keherwa along with the theka', href: '#/tools/taal' },
  guitar: { icon: '🎸', title: 'Tune up and warm up', detail: 'Tune your guitar, then a minute of finger exercise', href: '#/tools/tuner' },
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
      items.push({ icon: '📖', title: `Theory: ${lesson.title}`, detail: `${course.name} · ${lesson.minutes} min`, href: `#/lesson/${lesson.id}` });
      break;
    }
  }

  for (const course of order) {
    const list = lessonsOf(course);
    const lesson = list.find((l) => isDone(l.id) && !isPracticeDone(l.id))
      || list.find((l, i) => isUnlocked(list, i, isDone) && !isPracticeDone(l.id));
    if (lesson) {
      items.push({ icon: '🎯', title: `Practical: ${lesson.title}`, detail: `${course.name} · ${lesson.practice.length} exercise${lesson.practice.length > 1 ? 's' : ''}`, href: `#/lesson/${lesson.id}/practice` });
      break;
    }
  }

  // Alternate between an instrument warm-up and ear training.
  items.push(date.getDate() % 2
    ? WARMUPS[focus.id]
    : { icon: '👂', title: 'Ear training', detail: 'Name bols, swaras and chords by ear', href: '#/tools/ear' });
  return items;
}
