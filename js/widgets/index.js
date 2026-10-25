import { h } from '../ui/dom.js';
import * as common from './common.js';
import * as tabla from './tabla.js';
import * as guitar from './guitar.js';
import * as voice from './voice.js';
import { micCheck } from './micCheck.js';

const REGISTRY = {
  text: common.text,
  tip: common.tip,
  metronome: common.metronome,
  timer: common.timer,
  bols: tabla.bols,
  sequence: tabla.sequence,
  theka: tabla.theka,
  strings: guitar.strings,
  chords: guitar.chords,
  strum: guitar.strum,
  progression: guitar.progression,
  tab: guitar.tab,
  tuner: (step, scope) => (step.mode === 'voice' ? voice.voiceMeter(step, scope) : guitar.tuner(step, scope)),
  drone: voice.drone,
  sapicker: voice.saPicker,
  keyboard: voice.keyboard,
  sargam: voice.sargam,
  breath: voice.breath,
  miccheck: micCheck,
};

export const STEP_TYPES = Object.keys(REGISTRY);

export function renderStep(step, scope) {
  const render = REGISTRY[step.type];
  return render ? render(step, scope) : h('p', { class: 'muted' }, `Unknown step type: ${step.type}`);
}

// A step with its optional title and instruction line.
export function stepBlock(step, scope) {
  return h('section', { class: 'step-block' },
    step.title && h('h3', {}, step.title),
    step.label && h('p', { class: 'step-label' }, step.label),
    renderStep(step, scope));
}
