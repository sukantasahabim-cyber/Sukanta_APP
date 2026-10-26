import { h } from '../ui/dom.js';
import { stepBlock } from '../widgets/index.js';
import { chordCard } from '../widgets/guitar.js';
import { CHORD_GROUPS } from '../data/chords.js';
import { courseShown } from '../data/courses.js';
import { notFound } from './notfound.js';
import { t } from '../i18n/i18n.js';

// Built on each visit so names follow the chosen language. Tools that need a
// course (`course`) are left out while that course is hidden.
const allTools = () => [
  { id: 'taal', icon: '🥁', steps: [{ type: 'theka', taal: 'teentaal', choose: true }] },
  { id: 'sing', icon: '🎙️', href: '#/sing' },
  { id: 'studio', icon: '🎼', href: '#/studio' },
  { id: 'teacher', icon: '🧑‍🏫', href: '#/teacher' },
  { id: 'lehra', icon: '🎹', steps: [{ type: 'lehra', taal: 'teentaal' }] },
  { id: 'tanpura', icon: '🪕', steps: [{ type: 'drone' }, { type: 'sapicker', title: t('tools.yourSa') }] },
  { id: 'tuner', icon: '🎸', course: 'guitar', steps: [{ type: 'tuner', mode: 'guitar' }, { type: 'strings', title: t('tools.referenceTones') }] },
  { id: 'pitch', icon: '🎤', steps: [{ type: 'tuner', mode: 'voice' }] },
  { id: 'mic', icon: '🎙️', steps: [{ type: 'miccheck' }] },
  { id: 'metronome', icon: '⏱️', steps: [{ type: 'metronome', bpm: 80, selectBeats: true }] },
  { id: 'swaras', icon: '🎹', steps: [{ type: 'keyboard', notes: "S r R g G M m P d D n N S'" }, { type: 'sapicker', title: t('tools.yourSa') }] },
  { id: 'ear', icon: '👂',
    steps: [
      { type: 'ear', title: t('tools.earBols'), kind: 'bol', options: ['Na', 'Tin', 'Ti', 'Ge', 'Ke', 'Dha'], rounds: 8 },
      { type: 'ear', title: t('tools.earSwaras'), kind: 'swara', options: ['R', 'G', 'M', 'P', 'D', 'N'], rounds: 8 },
      { type: 'ear', title: t('tools.earChords'), kind: 'chord', course: 'guitar', options: [{ label: t('ear.major'), values: ['E', 'A', 'D', 'G', 'C'] }, { label: t('ear.minor'), values: ['Em', 'Am', 'Dm', 'Bm'] }], rounds: 8 },
      { type: 'ear', title: t('tools.earTaals'), kind: 'taal', options: ['keherwa', 'dadra', 'rupak', 'jhaptaal'], rounds: 4 },
    ] },
  { id: 'chords', icon: '📖', course: 'guitar' },
  { id: 'timer', icon: '⏳',
    steps: [{ type: 'timer', minutes: 15, selectMinutes: true, tasks: [t('tools.taskWarmup'), t('tools.taskTechnique'), t('tools.taskRepertoire'), t('tools.taskFree')] }] },
];
const shown = (x) => !x.course || courseShown(x.course);
const tools = () => allTools().filter(shown).map((tool) => (tool.steps ? { ...tool, steps: tool.steps.filter(shown) } : tool));

export function toolsView() {
  return h('div', { class: 'container' },
    h('h1', {}, t('tools.title')),
    h('p', { class: 'muted' }, t('tools.intro')),
    h('div', { class: 'tool-grid' }, tools().map((tool) => h('a', { class: 'tool-card', href: tool.href || `#/tools/${tool.id}` },
      h('span', { class: 'tool-icon', 'aria-hidden': 'true' }, tool.icon),
      h('b', {}, t(`tool.${tool.id}.name`)),
      h('span', { class: 'muted small' }, t(`tool.${tool.id}.desc`))))));
}

export function toolView(scope, id) {
  const tool = tools().find((x) => x.id === id);
  if (!tool) return notFound();
  if (tool.href) { location.replace(tool.href); return h('div'); }
  const content = id === 'chords'
    ? CHORD_GROUPS.map(([title, names]) => h('section', { class: 'step-block' },
      h('h2', {}, t(title)), h('div', { class: 'chord-grid' }, names.map((n) => chordCard(n)))))
    : tool.steps.map((s) => h('div', { class: 'step-card' }, stepBlock(s, scope)));
  return h('div', { class: 'container' },
    h('a', { class: 'back', href: '#/tools' }, t('tools.back')),
    h('h1', {}, `${tool.icon} ${t(`tool.${tool.id}.name`)}`),
    h('p', { class: 'muted' }, t(`tool.${tool.id}.desc`)),
    content);
}
