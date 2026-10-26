// Ear training: the app plays a sound and the learner names it.
//   kind: 'bol'    options are tabla bols
//         'swara'  options are swaras; Sa is played first as a reference
//         'chord'  options are chord names, or { label, values } groups
//                  such as { label: 'Major', values: ['E', 'A', 'D'] }
//         'taal'   options are taal ids; one cycle of the theka is played
import { h } from '../ui/dom.js';
import { swaraLabel, swaraWord } from '../ui/controls.js';
import { t } from '../i18n/i18n.js';
import { bolName, taalName } from '../i18n/names.js';
import { getCtx, chime } from '../audio/engine.js';
import { playBol } from '../audio/tabla.js';
import { playSwara } from '../audio/voice.js';
import { strumChord } from '../audio/guitar.js';
import { CHORDS } from '../data/chords.js';
import { TAALS } from '../data/taals.js';
import { parseSwara } from '../music.js';

export const EAR_KINDS = ['bol', 'swara', 'chord', 'taal'];

// Normalises options to [{ label, values }].
export function earOptions(step) {
  return step.options.map((o) => (typeof o === 'string' ? { label: o, values: [o] } : o));
}

function labelFor(kind, option) {
  if (kind === 'swara') return swaraLabel(parseSwara(option.values[0]));
  if (kind === 'taal') return taalName(option.values[0], TAALS[option.values[0]].name);
  if (kind === 'chord' && option.values.length === 1) return CHORDS[option.values[0]].name;
  if (kind === 'bol') return bolName(option.label);
  return option.label;
}

// Plain-text name of an answer, for the feedback line.
function nameFor(kind, option, value) {
  if (kind === 'swara') return swaraWord(parseSwara(value));
  if (kind === 'taal') return taalName(value, TAALS[value].name);
  if (kind === 'chord') return option.values.length > 1 ? `${option.label} (${CHORDS[value].name})` : CHORDS[value].name;
  if (kind === 'bol') return bolName(value);
  return option.label;
}

function play(kind, value) {
  const at = getCtx().currentTime + 0.05;
  if (kind === 'bol') playBol(value, at);
  else if (kind === 'swara') {
    playSwara(0, at, 0.8);
    playSwara(parseSwara(value).semitone, at + 1.1, 1.0);
  } else if (kind === 'chord') strumChord(CHORDS[value], at);
  else if (kind === 'taal') {
    const taal = TAALS[value];
    const beat = 60 / 110;
    taal.bols.forEach((subs, b) => subs.forEach((bol, k) => playBol(bol, at + b * beat + (k * beat) / subs.length)));
  }
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function ear(step) {
  const kind = step.kind;
  const options = earOptions(step);
  const rounds = step.rounds || 6;
  let round = 0;
  let score = 0;
  let answer = null;   // { option index, value } for the current round
  let answered = false;

  const counter = h('span', { class: 'muted small' });
  const feedback = h('p', { class: 'quiz-feedback', 'aria-live': 'polite' });
  const playBtn = h('button', { class: 'btn btn-primary', onClick: () => replay() }, t('ear.play'));
  const nextBtn = h('button', { class: 'btn', hidden: true, onClick: () => nextRound() }, t('common.next'));
  const buttons = options.map((o, i) => h('button', { class: 'quiz-option ear-option', onClick: () => choose(i) }, labelFor(kind, o)));

  const updateCounter = () => { counter.textContent = t('ear.counter', { n: Math.min(round + 1, rounds), total: rounds, score }); };

  function nextRound() {
    if (round >= rounds) {
      round = 0;
      score = 0;
    }
    const i = Math.floor(Math.random() * options.length);
    answer = { i, value: pick(options[i].values) };
    answered = false;
    buttons.forEach((b) => { b.disabled = false; b.classList.remove('correct', 'wrong'); });
    feedback.textContent = t('ear.listen');
    feedback.className = 'quiz-feedback';
    nextBtn.hidden = true;
    playBtn.textContent = t('ear.playAgain');
    updateCounter();
    play(kind, answer.value);
  }

  function replay() {
    if (!answer) nextRound();
    else play(kind, answer.value);
  }

  function choose(i) {
    if (!answer || answered) return;
    answered = true;
    const right = i === answer.i;
    if (right) score++;
    buttons[answer.i].classList.add('correct');
    if (!right) buttons[i].classList.add('wrong');
    buttons.forEach((b) => { b.disabled = true; });
    const name = nameFor(kind, options[answer.i], answer.value);
    feedback.textContent = right ? t('ear.right', { name }) : t('ear.wrong', { name });
    feedback.className = `quiz-feedback ${right ? 'good' : 'bad'}`;
    round++;
    updateCounter();
    if (round >= rounds) {
      feedback.textContent += `  ${t(score === rounds ? 'ear.perfect' : 'ear.finished', { score, total: rounds })}`;
      if (score === rounds) chime();
      nextBtn.textContent = t('ear.restart');
    } else {
      nextBtn.textContent = t('common.next');
    }
    nextBtn.hidden = false;
    playBtn.textContent = t('ear.hearAgain');
  }

  updateCounter();
  return h('div', { class: 'widget ear' },
    h('div', { class: 'controls' }, playBtn, nextBtn, counter),
    h('div', { class: 'quiz-options ear-options' }, buttons),
    feedback);
}
