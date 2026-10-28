// Table Tabla: play tabla on any surface. The microphone hears each hit on a
// table, box or lap, works out which hand made it (see analysis/tablehits.js)
// and plays the matching tabla stroke straight away. Free play turns hands
// into chosen bols; "Play a theka" walks through a theka (or a lesson's
// exercise) one hit at a time and checks hands and timing.
import { h, toast } from '../ui/dom.js';
import { t } from '../i18n/i18n.js';
import { bolName, taalName } from '../i18n/names.js';
import { store } from '../store.js';
import { getCtx, click } from '../audio/engine.js';
import { playBol, bolStrokes } from '../audio/tabla.js';
import { startListening, listenErrorMessage } from '../audio/listen.js';
import { tempoControl, checkbox } from '../ui/controls.js';
import { tablaSvg } from '../widgets/demo.js';
import { TAALS, vibhagOf } from '../data/taals.js';
import { findLesson } from '../data/courses.js';
import {
  HANDS, HIT_BEFORE, hitSize, hitFeatures, HitClassifier, HitDetector, checkExamples,
  handOf, thekaStrokes, exerciseStrokes, StrokeFollower, timingTolerance,
} from '../analysis/tablehits.js';

const SETTING = 'tableHits';
const EXAMPLES_PER_HAND = 4;
const WARMUP = 0.3;            // seconds after the microphone opens when nothing counts
const THEKA_TAALS = ['keherwa', 'dadra', 'rupak', 'jhaptaal', 'teentaal', 'ektaal'];
const CHOICES = { right: ['Na', 'Tin', 'Tu', 'Ti'], left: ['Ge', 'Ke'], both: ['Dha', 'Dhin'] };
const PADS = ['Na', 'Tin', 'Tu', 'Ti', 'Ge', 'Ke', 'Dha', 'Dhin'];
// Detector settings for each microphone sensitivity (Tools → Microphone check).
const SENSITIVITY = {
  quiet: { rise: 3, floorRatio: 8, minEnergy: 2e-7 },
  normal: { rise: 4, floorRatio: 12, minEnergy: 1e-6 },
  noisy: { rise: 5, floorRatio: 20, minEnergy: 5e-6 },
};
// A drum zone tapped on screen → the stroke it plays.
const ZONE_BOL = { 'dayan:kinar': 'Na', 'dayan:sur': 'Tin', 'dayan:syahi': 'Ti', 'bayan:syahi': 'Ke', 'bayan:maidan': 'Ge', 'bayan:whole': 'Ge' };

const saved = () => store.setting(SETTING) || null;
const handName = (hand) => t(`tt.hand.${hand}`);

// One microphone session that reports each hit with its features. The phone
// can hear its own tabla sound through the speaker; hits arriving exactly one
// speaker-to-microphone delay after a sound we played are that echo, not the
// learner, and are ignored.
async function listenForHits(onHit) {
  const ctx = getCtx();
  if (ctx.state === 'suspended') await ctx.resume();
  const sr = ctx.sampleRate;
  const detector = new HitDetector(sr, SENSITIVITY[store.setting('micSensitivity')] || SENSITIVITY.normal);
  const echo = saved()?.echo ?? null;
  const played = [];
  const pre = Math.round(sr * HIT_BEFORE);
  const size = hitSize(sr);
  let session = null;
  session = await startListening({
    batch: 256,
    onSamples: (chunk) => {
      for (const idx of detector.push(chunk)) {
        if (!session || idx < WARMUP * sr) continue;
        const time = session.rec.timeOf(idx);
        while (played.length && played[0] < time - 1) played.shift();
        if (echo !== null && played.some((p) => time - p > echo - 0.03 && time - p < echo + 0.06)) continue;
        session.rec.when(idx - pre + size, () => onHit({ time, ...hitFeatures(session.rec.slice(idx - pre, size), sr) }));
      }
    },
  });
  return {
    session,
    // Plays a bol now (or at `when`) and remembers it for the echo check.
    play(bol, velocity = 1, when = getCtx().currentTime) {
      playBol(bol, when, velocity);
      played.push(when);
    },
    // Latest moment heard so far, on the AudioContext clock.
    now: () => session.rec.timeOf(session.rec.written),
    latency: echo ?? session.latency,
    stop: () => session.stop(),
  };
}

// Loudness of a hit compared with the learner's usual hit → how hard to play.
function velocityOf(level) {
  const ref = saved()?.level || 0.05;
  return Math.max(0.35, Math.min(1.15, Math.sqrt(level / ref)));
}

export function tableTablaView(scope, lessonId, exIndex) {
  const ex = lessonId ? findLesson(lessonId)?.lesson.practice?.[Number(exIndex)] : null;
  const lessonEx = ex?.type === 'rhythm' && ex.bols && !ex.clap ? { ex, title: findLesson(lessonId).lesson.title } : null;
  let classifier = new HitClassifier(saved()?.examples);
  let active = null;   // { stop } of whatever is using the microphone
  const stopActive = () => { active?.stop(); active = null; };
  scope.onCleanup(stopActive);

  const status = h('p', { class: 'small', role: 'status', 'aria-live': 'polite' });
  const say = (text, tone = 'muted') => { status.className = `small ${tone === 'muted' ? 'muted' : tone === 'warn' ? 'warn-text' : 'good-text'}`; status.textContent = text; };
  const failed = (err) => say(listenErrorMessage(err), 'warn');

  // ---------- Teaching the app your strokes ----------

  const setupStatus = h('p', { class: 'small' });
  const dots = h('div', { class: 'tt-dots', 'aria-hidden': 'true' });
  const stepText = h('p', { class: 'tt-step', 'aria-live': 'polite' });
  const setupBtn = h('button', { class: 'btn btn-primary', type: 'button', onClick: () => (setupRunning ? cancelSetup() : runSetup()) });
  let setupRunning = false;
  let cancelSetup = () => {};

  function showSetupState() {
    const s = saved();
    if (!s) {
      setupStatus.className = 'small muted';
      setupStatus.textContent = t('tt.setupNone');
    } else {
      const pct = Math.round(s.check * 100);
      setupStatus.className = `small ${s.check < 0.75 ? 'warn-text' : 'good-text'}`;
      setupStatus.textContent = t(s.check < 0.75 ? 'tt.setupWeak' : 'tt.setupDone', { pct });
    }
    setupBtn.textContent = setupRunning ? t('tt.cancel') : s ? t('tt.setupAgain') : t('tt.setupStart');
    stepText.hidden = !setupRunning;
    dots.hidden = !setupRunning;
  }

  async function runSetup() {
    stopActive();
    setupRunning = true;
    showSetupState();
    const examples = { right: [], left: [], both: [] };
    const levels = [];
    const echoHits = [];
    let phase = 'echo';
    let lastHeard = Date.now();
    let mic;
    const drawDots = (n) => dots.replaceChildren(...Array.from({ length: EXAMPLES_PER_HAND }, (_, i) => h('span', { class: `tt-dot${i < n ? ' on' : ''}` })));
    const finish = (ok) => {
      clearInterval(nudge);
      mic?.stop();
      active = null;
      setupRunning = false;
      if (ok) {
        const check = checkExamples(examples);
        const echo = echoDelay();
        store.setSetting(SETTING, { examples, check, level: levels.sort((a, b) => a - b)[Math.floor(levels.length / 2)], echo, saved: new Date().toISOString() });
        classifier = new HitClassifier(examples);
        say(t(echo === null ? 'tt.echoNo' : 'tt.echoYes'));
        toast(t('tt.setupSaved'));
      }
      showSetupState();
    };
    cancelSetup = () => finish(false);
    const nudge = setInterval(() => {
      if (phase !== 'echo' && Date.now() - lastHeard > 15000) { say(t('tt.cantHear'), 'warn'); lastHeard = Date.now(); }
    }, 1000);
    // Played through the speaker during the check; if the microphone hears
    // them, that delay is the echo to ignore later.
    const tests = [];
    const echoDelay = () => {
      const delays = tests.map((p) => echoHits.find((e) => e > p + 0.005 && e < p + 0.4)).map((e, i) => (e === undefined ? null : e - tests[i])).filter((d) => d !== null).sort((a, b) => a - b);
      return delays.length >= 2 ? delays[Math.floor(delays.length / 2)] : null;
    };
    const steps = ['right', 'left', 'both'];
    const nextStep = () => {
      phase = steps[steps.indexOf(phase) + 1] || 'done';
      if (phase === 'done') { finish(true); return; }
      stepText.textContent = t(`tt.step.${phase}`);
      drawDots(0);
      lastHeard = Date.now();
    };
    try {
      mic = await listenForHits((hit) => {
        if (phase === 'echo') { echoHits.push(hit.time); return; }
        if (phase === 'done') return;
        lastHeard = Date.now();
        examples[phase].push(hit.vector);
        levels.push(hit.level);
        drawDots(examples[phase].length);
        if (examples[phase].length >= EXAMPLES_PER_HAND) setTimeout(nextStep, 350);
      });
      active = { stop: () => finish(false) };
      stepText.textContent = t('tt.stepEcho');
      dots.replaceChildren();
      const ctx = getCtx();
      const t0 = ctx.currentTime + 0.4;
      for (let i = 0; i < 3; i++) { tests.push(t0 + i * 0.7); playBol('Na', t0 + i * 0.7, 0.9); }
      setTimeout(() => { if (setupRunning) nextStep(); }, 2600);
    } catch (err) {
      finish(false);
      setupStatus.className = 'small warn-text';
      setupStatus.textContent = listenErrorMessage(err);
    }
  }

  const setupCard = h('div', { class: 'step-card' },
    h('h2', {}, t('tt.setupTitle')),
    h('p', { class: 'muted small' }, t('tt.setupIntro')),
    setupStatus, stepText, dots,
    h('div', { class: 'controls' }, setupBtn));

  // ---------- The drums ----------

  const drum = tablaSvg();
  drum.el.classList.add('tt-drums');
  drum.el.setAttribute('aria-label', t('tt.drumsLabel'));
  const sound = (bol, velocity = 1, player = null) => {
    if (player) player.play(bol, velocity); else playBol(bol, getCtx().currentTime, velocity);
    drum.strike(bolStrokes(bol));
  };
  drum.el.addEventListener('pointerdown', (e) => {
    const zone = e.target.closest?.('[data-zone]');
    const drumEl = e.target.closest?.('[data-drum]');
    const bol = zone && drumEl && ZONE_BOL[`${drumEl.dataset.drum}:${zone.dataset.zone}`];
    if (bol) { e.preventDefault(); sound(bol, 1, active?.player); played(bol); }
  });
  const pads = h('div', { class: 'tt-pads' }, PADS.map((bol) => h('button', {
    class: 'btn btn-sm', type: 'button', onClick: () => { sound(bol, 1, active?.player); played(bol); },
  }, bolName(bol))));

  // ---------- Free play ----------

  const choice = { right: 'Na', left: 'Ge', both: 'Dha' };
  const recent = h('div', { class: 'notes tt-recent', 'aria-live': 'off' });
  const played = (bol, hand = null) => {
    recent.prepend(h('span', { class: `note-chip tt-${hand || 'pad'}` }, bolName(bol)));
    while (recent.children.length > 16) recent.lastChild.remove();
  };
  const choiceSelect = (hand) => h('label', { class: 'field' },
    h('span', {}, t(`tt.plays.${hand}`)),
    h('select', { class: 'select', onChange: (e) => { choice[hand] = e.target.value; } },
      CHOICES[hand].map((bol) => h('option', { value: bol, selected: bol === choice[hand] }, bolName(bol)))));
  const freeBtn = h('button', {
    class: 'btn btn-primary', type: 'button',
    onClick: async () => {
      if (active?.mode === 'free') { stopActive(); freeBtn.textContent = t('tt.start'); say(''); return; }
      stopActive();
      try {
        const player = await listenForHits((hit) => {
          const { hand } = classifier.classify(hit.vector);
          sound(choice[hand], velocityOf(hit.level), player);
          played(choice[hand], hand);
        });
        active = { mode: 'free', player, stop: () => { player.stop(); freeBtn.textContent = t('tt.start'); } };
        freeBtn.textContent = t('tt.stop');
        say(saved() ? t('tt.listening') : t('tt.notSetUp'), saved() ? 'good' : 'warn');
      } catch (err) {
        failed(err);
      }
    },
  }, t('tt.start'));
  const freePanel = h('div', {},
    h('div', { class: 'field-row' }, HANDS.map(choiceSelect)),
    h('div', { class: 'controls' }, freeBtn),
    h('p', { class: 'small muted' }, t('tt.recent')),
    recent);

  // ---------- Play a theka ----------

  let source = lessonEx ? 'lesson' : 'keherwa';
  let bpm = lessonEx ? lessonEx.ex.bpm || 60 : 60;
  let withBeat = true;
  const chipsBox = h('div', { class: 'tt-theka' });
  let chips = [];
  let seq = null;

  function buildSequence() {
    if (source === 'lesson' && lessonEx) {
      const { strokes, cycleBeats } = exerciseStrokes(lessonEx.ex.bols, lessonEx.ex.perBeat || 1);
      seq = { strokes, cycleBeats };
    } else {
      const taal = TAALS[source];
      seq = { strokes: thekaStrokes(taal), cycleBeats: taal.matras, taal };
    }
    chips = seq.strokes.map((s) => {
      const note = h('small', { class: 'chip-note' }, '');
      const el = h('span', { class: 'note-chip' }, h('span', {}, s.bol === 'X' ? '•' : bolName(s.bol)), note);
      return { el, set(state, text = '') { el.classList.remove('on', 'ok', 'bad'); if (state) el.classList.add(state); note.textContent = text; } };
    });
    // One box per vibhag (a lesson's exercise: per 4 beats), headed by the
    // taal's mark: X sam, 0 khali, numbers taali.
    const groups = [];
    seq.strokes.forEach((s, i) => {
      const v = seq.taal ? vibhagOf(seq.taal, s.matra) : { index: Math.floor(s.matra / 4), mark: '' };
      if (!groups[v.index]) groups[v.index] = { mark: v.mark, els: [] };
      groups[v.index].els.push(chips[i].el);
    });
    chipsBox.replaceChildren(...groups.filter(Boolean).map((g) => h('div', { class: 'tt-vibhag' },
      h('span', { class: 'tt-mark', 'aria-hidden': 'true' }, g.mark),
      h('div', { class: 'note-group' }, g.els))));
  }

  const sourceSelect = h('select', {
    class: 'select', 'aria-label': t('tt.chooseTaal'),
    onChange: (e) => { stopActive(); source = e.target.value; if (source !== 'lesson') { bpm = Math.min(TAALS[source].bpm, 70); tempo.replaceWith(tempo = makeTempo()); } buildSequence(); },
  },
  lessonEx && h('option', { value: 'lesson', selected: source === 'lesson' }, t('tt.fromLesson', { title: lessonEx.title })),
  THEKA_TAALS.map((id) => h('option', { value: id, selected: id === source }, `${taalName(id, TAALS[id].name)} (${TAALS[id].matras})`)));
  const makeTempo = () => tempoControl({ value: bpm, min: 30, max: 160, onChange: (v) => { bpm = v; } });
  let tempo = makeTempo();
  const countEl = h('div', { class: 'count-in' }, '');
  const roundLine = h('p', { class: 'small', role: 'status' });

  const listenBtn = h('button', {
    class: 'btn', type: 'button',
    onClick: () => {
      stopActive();
      const beat = 60 / bpm;
      const t0 = getCtx().currentTime + 0.2;
      const timers = seq.strokes.map((s, i) => {
        const at = t0 + s.beat * beat;
        playBol(s.bol === 'X' ? 'Na' : s.bol, at);
        return setTimeout(() => { chips.forEach((c, k) => c.el.classList.toggle('on', k === i)); drum.strike(bolStrokes(s.bol === 'X' ? 'Na' : s.bol)); }, (at - getCtx().currentTime) * 1000);
      });
      timers.push(setTimeout(() => chips.forEach((c) => c.el.classList.remove('on')), (seq.cycleBeats * beat + 0.4) * 1000));
      active = { stop: () => { timers.forEach(clearTimeout); chips.forEach((c) => c.el.classList.remove('on')); } };
    },
  }, t('tt.listen'));

  const playBtn = h('button', { class: 'btn btn-primary', type: 'button', onClick: () => (active?.mode === 'theka' ? stopActive() : playTheka()) }, t('tt.play'));

  async function playTheka() {
    stopActive();
    chips.forEach((c) => c.set(''));
    roundLine.textContent = '';
    const beat = 60 / bpm;
    const n = seq.strokes.length;
    let follower = null;
    let ignoreBefore = Infinity;  // hits during the count-in are not strokes yet
    let round = 0;
    let stats = { hands: 0, time: 0, total: 0 };
    const timers = [];
    let metronome = 0;
    const endRound = () => {
      if (!stats.total) return;
      round++;
      roundLine.textContent = withBeat
        ? t('tt.round', { n: round, hands: stats.hands, time: stats.time, total: stats.total })
        : t('tt.roundFree', { n: round, hands: stats.hands, total: stats.total });
      stats = { hands: 0, time: 0, total: 0 };
    };
    let shownCycle = 0;
    const show = (stroke, state, note) => {
      if (stroke.cycle > shownCycle) { shownCycle = stroke.cycle; endRound(); chips.forEach((c) => c.set('')); }
      chips[stroke.index].set(state, note);
      stats.total++;
    };
    const missed = (stroke) => show(stroke, 'bad', t('tt.missed'));
    const highlight = () => {
      const k = follower.next % n;
      chips.forEach((c, i) => c.el.classList.toggle('on', i === k));
    };
    try {
      const player = await listenForHits((hit) => {
        if (!follower || hit.time < ignoreBefore) return;
        const res = follower.hit(hit.time);
        res.missed.forEach(missed);
        const want = handOf(res.stroke.bol);
        const { hand } = classifier.classify(hit.vector);
        const handOk = !want || want === hand;
        // Your hands decide the sound: the theka's bol when they are right,
        // otherwise what those hands would play, so a wrong hand is heard.
        const bol = handOk ? (res.stroke.bol === 'X' ? choice[hand] : res.stroke.bol) : choice[hand];
        sound(bol, velocityOf(hit.level), player);
        let note = handOk ? '✓' : t('tt.needs', { hand: handName(want) });
        let onTime = true;
        if (res.offset !== null && handOk) {
          const tol = timingTolerance(beat);
          if (res.offset < -tol) { note = t('tt.early'); onTime = false; }
          if (res.offset > tol) { note = t('tt.late'); onTime = false; }
        }
        show(res.stroke, handOk ? 'ok' : 'bad', note);
        if (handOk) stats.hands++;
        if (onTime && res.offset !== null) stats.time++;
        highlight();
      });
      const ctx = getCtx();
      const t0 = ctx.currentTime + 0.4;
      const start = withBeat ? t0 + 4 * beat : null;
      if (withBeat) {
        // Count in four clicks, then click every beat, accenting sam.
        let k = 0;
        const tick = () => {
          while (t0 + k * beat < getCtx().currentTime + 0.15) {
            click(t0 + k * beat, k < 4 ? k === 0 : (k - 4) % seq.cycleBeats === 0);
            k++;
          }
        };
        tick();
        metronome = setInterval(tick, 25);
        for (let i = 0; i < 4; i++) timers.push(setTimeout(() => { countEl.textContent = String(4 - i); }, (t0 + i * beat - ctx.currentTime) * 1000));
        timers.push(setTimeout(() => { countEl.textContent = '▶'; say(t('tt.go'), 'good'); }, (start - ctx.currentTime) * 1000));
        follower = new StrokeFollower(seq.strokes, { cycleBeats: seq.cycleBeats, beatSeconds: beat, start: start + player.latency });
        ignoreBefore = start + player.latency - 0.6 * beat;
        const overdue = setInterval(() => follower.overdue(player.now(), timingTolerance(beat) + 0.5 * beat).forEach((s) => { missed(s); highlight(); }), 100);
        timers.push({ interval: overdue });
      } else {
        follower = new StrokeFollower(seq.strokes, { cycleBeats: seq.cycleBeats });
        ignoreBefore = -Infinity;
        say(t('tt.freeTempo'), 'good');
      }
      highlight();
      active = {
        mode: 'theka',
        player,
        stop: () => {
          player.stop();
          clearInterval(metronome);
          timers.forEach((x) => (x.interval ? clearInterval(x.interval) : clearTimeout(x)));
          endRound();
          countEl.textContent = '';
          chips.forEach((c) => c.el.classList.remove('on'));
          playBtn.textContent = t('tt.play');
        },
      };
      playBtn.textContent = t('tt.stop');
      if (withBeat) say(t('tt.countIn'));
    } catch (err) {
      failed(err);
    }
  }

  buildSequence();
  const thekaPanel = h('div', {},
    h('p', { class: 'small muted' }, t('tt.thekaHow')),
    h('div', { class: 'controls' }, h('label', { class: 'inline' }, t('tt.chooseTaal'), ' ', sourceSelect)),
    tempo,
    checkbox(t('tt.beat'), withBeat, (v) => { withBeat = v; }),
    h('div', { class: 'controls' }, listenBtn, playBtn),
    countEl, chipsBox, roundLine);

  // ---------- Page ----------

  let mode = lessonEx ? 'theka' : 'free';
  const panelBox = h('div', {});
  const tabs = h('div', { class: 'segmented', role: 'group', 'aria-label': t('tt.mode') });
  const showMode = () => {
    stopActive();
    tabs.replaceChildren(...['free', 'theka'].map((m) => h('button', {
      class: `seg${m === mode ? ' on' : ''}`, type: 'button', 'aria-pressed': String(m === mode),
      onClick: () => { mode = m; showMode(); },
    }, t(`tt.mode.${m}`))));
    panelBox.replaceChildren(mode === 'free' ? freePanel : thekaPanel);
  };
  showMode();
  showSetupState();

  return h('div', { class: 'container c-tabla' },
    h('a', { class: 'back', href: lessonEx ? `#/lesson/${lessonId}/practice` : '#/tools' }, lessonEx ? `← ${lessonEx.title}` : t('tools.back')),
    h('h1', {}, `🪘 ${t('tt.title')}`),
    h('p', { class: 'muted' }, t('tt.intro')),
    h('div', { class: 'step-card' },
      h('h2', {}, t('tt.howTitle')),
      h('ul', { class: 'tt-how' },
        h('li', {}, h('span', { 'aria-hidden': 'true' }, '👉 '), t('tt.how.right')),
        h('li', {}, h('span', { 'aria-hidden': 'true' }, '🤚 '), t('tt.how.left')),
        h('li', {}, h('span', { 'aria-hidden': 'true' }, '🙌 '), t('tt.how.both'))),
      h('p', { class: 'small muted' }, t('tt.tips'))),
    setupCard,
    h('div', { class: 'step-card' },
      tabs,
      h('div', { class: 'tt-stage' }, drum.el),
      status,
      panelBox,
      h('p', { class: 'small muted' }, t('tt.screenPads')),
      pads));
}
