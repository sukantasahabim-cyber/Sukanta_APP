import { h } from '../ui/dom.js';
import { stepBlock } from '../widgets/index.js';
import { chordCard } from '../widgets/guitar.js';
import { CHORD_GROUPS } from '../data/chords.js';
import { notFound } from './notfound.js';

const TOOLS = [
  { id: 'taal', icon: '🥁', name: 'Taal Player', desc: 'Tabla thekas for every taal, with hand counting',
    steps: [{ type: 'theka', taal: 'teentaal', choose: true }] },
  { id: 'tanpura', icon: '🪕', name: 'Tanpura', desc: 'Drone for singing practice, tuned to your Sa',
    steps: [{ type: 'drone' }, { type: 'sapicker', title: 'Your Sa' }] },
  { id: 'tuner', icon: '🎸', name: 'Guitar Tuner', desc: 'Tune with the microphone or by ear',
    steps: [{ type: 'tuner', mode: 'guitar' }, { type: 'strings', title: 'Reference tones' }] },
  { id: 'pitch', icon: '🎤', name: 'Voice Pitch Monitor', desc: 'See which swara you are singing, live',
    steps: [{ type: 'tuner', mode: 'voice' }] },
  { id: 'mic', icon: '🎙️', name: 'Microphone Check', desc: 'Test your microphone and set sensitivity for practical mode',
    steps: [{ type: 'miccheck' }] },
  { id: 'metronome', icon: '⏱️', name: 'Metronome', desc: 'Steady clicks for any practice',
    steps: [{ type: 'metronome', bpm: 80, selectBeats: true }] },
  { id: 'swaras', icon: '🎹', name: 'Swara Keyboard', desc: 'All twelve swaras relative to your Sa',
    steps: [{ type: 'keyboard', notes: "S r R g G M m P d D n N S'" }, { type: 'sapicker', title: 'Your Sa' }] },
  { id: 'ear', icon: '👂', name: 'Ear Training', desc: 'Listen and name tabla bols, swaras, chords and taals',
    steps: [
      { type: 'ear', title: 'Tabla bols', kind: 'bol', options: ['Na', 'Tin', 'Ti', 'Ge', 'Ke', 'Dha'], rounds: 8 },
      { type: 'ear', title: 'Swaras (Sa is played first)', kind: 'swara', options: ['R', 'G', 'M', 'P', 'D', 'N'], rounds: 8 },
      { type: 'ear', title: 'Major or minor chord', kind: 'chord', options: [{ label: 'Major (bright)', values: ['E', 'A', 'D', 'G', 'C'] }, { label: 'Minor (sad)', values: ['Em', 'Am', 'Dm', 'Bm'] }], rounds: 8 },
      { type: 'ear', title: 'Taals', kind: 'taal', options: ['keherwa', 'dadra', 'rupak', 'jhaptaal'], rounds: 4 },
    ] },
  { id: 'chords', icon: '📖', name: 'Chord Library', desc: 'Every guitar chord in the course' },
  { id: 'timer', icon: '⏳', name: 'Practice Timer', desc: 'Time your riyaz and log your minutes',
    steps: [{ type: 'timer', minutes: 15, selectMinutes: true, tasks: ['Warm-up', 'Technique', 'Repertoire', 'Free play'] }] },
];

export function toolsView() {
  return h('div', { class: 'container' },
    h('h1', {}, 'Practice tools'),
    h('p', { class: 'muted' }, 'Everything you need for daily riyaz, in one place.'),
    h('div', { class: 'tool-grid' }, TOOLS.map((t) => h('a', { class: 'tool-card', href: `#/tools/${t.id}` },
      h('span', { class: 'tool-icon', 'aria-hidden': 'true' }, t.icon),
      h('b', {}, t.name),
      h('span', { class: 'muted small' }, t.desc)))));
}

export function toolView(scope, id) {
  const tool = TOOLS.find((t) => t.id === id);
  if (!tool) return notFound();
  const content = id === 'chords'
    ? CHORD_GROUPS.map(([title, names]) => h('section', { class: 'step-block' },
      h('h2', {}, title), h('div', { class: 'chord-grid' }, names.map((n) => chordCard(n)))))
    : tool.steps.map((s) => h('div', { class: 'step-card' }, stepBlock(s, scope)));
  return h('div', { class: 'container' },
    h('a', { class: 'back', href: '#/tools' }, '← Tools'),
    h('h1', {}, `${tool.icon} ${tool.name}`),
    h('p', { class: 'muted' }, tool.desc),
    content);
}
