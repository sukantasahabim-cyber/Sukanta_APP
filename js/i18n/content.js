// Lesson content in other languages. Translation files mirror the shape of
// extractTexts(): only text is translated; ids, notes and bols never change.
// applyContent() writes the chosen language's text into the live data objects
// (falling back to English string by string), so views need no changes.
import { COURSES, lessonsOf } from '../data/courses.js';
import { CHORDS } from '../data/chords.js';
import { TAALS } from '../data/taals.js';

const pickText = (obj, keys) => {
  const out = {};
  for (const k of keys) if (typeof obj[k] === 'string') out[k] = obj[k];
  return out;
};

const stepText = (s) => {
  const out = pickText(s, ['title', 'body', 'label']);
  if (Array.isArray(s.tasks)) out.tasks = [...s.tasks];
  if (Array.isArray(s.bols)) out.bols = s.bols.map((b) => pickText(b, ['hand', 'how']));
  if (Array.isArray(s.options) && s.options.some((o) => typeof o === 'object')) out.options = s.options.map((o) => pickText(o, ['label']));
  return out;
};

// The translatable text of the whole app, in translation-file shape.
export function extractTexts() {
  const courses = {};
  const lessons = {};
  for (const c of COURSES) {
    courses[c.id] = { name: c.name, tagline: c.tagline, levels: c.levels.map((l) => l.title) };
    for (const l of lessonsOf(c)) {
      lessons[l.id] = {
        title: l.title,
        steps: l.steps.map(stepText),
        quiz: (l.quiz || []).map((q) => ({ q: q.q, options: [...q.options], explain: q.explain })),
        practice: l.practice.map((p) => pickText(p, ['title', 'label'])),
      };
    }
  }
  const chords = Object.fromEntries(Object.entries(CHORDS).map(([k, c]) => [k, pickText(c, ['full', 'tip'])]));
  const taals = Object.fromEntries(Object.entries(TAALS).map(([k, t]) => [k, pickText(t, ['use'])]));
  return { courses, lessons, chords, taals };
}

const ENGLISH = extractTexts();

// Copies strings from `src` into `target` where the shapes match.
function merge(target, src) {
  if (!target || !src) return;
  for (const [k, v] of Object.entries(src)) {
    if (typeof v === 'string') {
      if (typeof target[k] === 'string' && v.trim()) target[k] = v;
    } else if (Array.isArray(v) && Array.isArray(target[k])) {
      v.forEach((item, i) => {
        if (typeof item === 'string') {
          if (typeof target[k][i] === 'string' && item.trim()) target[k][i] = item;
        } else merge(target[k][i], item);
      });
    } else if (v && typeof v === 'object') {
      merge(target[k], v);
    }
  }
}

function applyTexts(texts) {
  for (const c of COURSES) {
    const tc = texts.courses?.[c.id];
    if (tc) {
      merge(c, { name: tc.name, tagline: tc.tagline });
      (tc.levels || []).forEach((title, i) => merge(c.levels[i], { title }));
    }
    for (const l of lessonsOf(c)) {
      const tl = texts.lessons?.[l.id];
      if (!tl) continue;
      merge(l, { title: tl.title, steps: tl.steps, quiz: tl.quiz, practice: tl.practice });
    }
  }
  for (const [k, v] of Object.entries(texts.chords || {})) merge(CHORDS[k], v);
  for (const [k, v] of Object.entries(texts.taals || {})) merge(TAALS[k], v);
}

const loaders = {
  bn: () => import('./content-bn.js'),
  hi: () => import('./content-hi.js'),
};

// Switches all lesson content to `language` (English first, so gaps fall back).
export async function applyContent(language) {
  applyTexts(ENGLISH);
  if (loaders[language]) applyTexts((await loaders[language]()).default);
}
