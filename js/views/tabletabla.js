// Table Tabla: play tabla on any surface. With the camera, the app sees which
// hand and which finger made each stroke and where on the drum it landed, so
// the learner plays with real tabla fingering (widgets/handcam.js,
// analysis/handstrikes.js); the microphone says exactly when. With the
// microphone alone it hears which hand made each hit on a table, box or lap
// (analysis/tablehits.js). Either way the matching tabla stroke plays
// straight away. Free play sounds what you play; "Play a theka" walks through
// a theka (or a lesson's exercise) one stroke at a time and checks hands,
// fingers and timing.
import { h, toast } from '../ui/dom.js';
import { t } from '../i18n/i18n.js';
import { bolName, taalName } from '../i18n/names.js';
import { store } from '../store.js';
import { getCtx, click } from '../audio/engine.js';
import { playBol, bolStrokes } from '../audio/tabla.js';
import { startListening, listenErrorMessage } from '../audio/listen.js';
import { tempoControl, checkbox } from '../ui/controls.js';
import { tablaSvg } from '../widgets/demo.js';
import { handCamera } from '../widgets/handcam.js';
import { cameraErrorMessage, DOWNLOAD_MB } from '../vision/hands.js';
import { TAALS, vibhagOf } from '../data/taals.js';
import { findLesson } from '../data/courses.js';
import {
  HANDS, HIT_BEFORE, hitSize, hitFeatures, HitClassifier, HitDetector, checkExamples,
  handOf, thekaStrokes, exerciseStrokes, StrokeFollower, timingTolerance,
} from '../analysis/tablehits.js';
import { SIDES, checkStroke } from '../analysis/handstrikes.js';

const SETTING = 'tableHits';
const INPUT = 'tableInput';
const EXAMPLES_PER_HAND = 4;
const WARMUP = 0.3;            // seconds after the microphone opens when nothing counts
const THEKA_TAALS = ['keherwa', 'dadra', 'rupak', 'jhaptaal', 'teentaal', 'ektaal'];
const CHOICES = { right: ['Na', 'Tin', 'Tu', 'Ti'], left: ['Ge', 'Ke'], both: ['Dha', 'Dhin'] };
const PADS = ['Na', 'Tin', 'Tu', 'Ti', 'Ge', 'Ke', 'Dha', 'Dhin'];
// What each hand plays when the camera could not see the stroke.
const USUAL = { right: 'Na', left: 'Ge', both: 'Dha' };
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
const canSee = () => !!navigator.mediaDevices?.getUserMedia && typeof WebAssembly === 'object';

// One microphone session that reports each hit with its features. The phone
// can hear its own tabla sound through the speaker; hits arriving exactly one
// speaker-to-microphone delay after a sound we played are that echo, not the
// learner, and are ignored. onChunk(audioTime) hears about every piece of
// sound, for matching the microphone's clock with the camera's.
async function listenForHits(onHit, onChunk = null) {
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
      if (session && onChunk) onChunk(session.rec.timeOf(session.rec.written));
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
  if (level == null) return 0.8;
  const ref = saved()?.level || 0.05;
  return Math.max(0.35, Math.min(1.15, Math.sqrt(level / ref)));
}

export function tableTablaView(scope, lessonId, exIndex) {
  const ex = lessonId ? findLesson(lessonId)?.lesson.practice?.[Number(exIndex)] : null;
  const lessonEx = ex?.type === 'rhythm' && ex.bols && !ex.clap ? { ex, title: findLesson(lessonId).lesson.title } : null;
  let classifier = new HitClassifier(saved()?.examples);
  let input = store.setting(INPUT) || (canSee() ? 'camera' : 'mic');
  const withCamera = () => input === 'camera';
  let active = null;   // { stop } of whatever is using the microphone (and camera)
  const stopActive = () => { active?.stop(); active = null; };
  scope.onCleanup(stopActive);

  const status = h('p', { class: 'small', role: 'status', 'aria-live': 'polite' });
  const say = (text, tone = 'muted') => { status.className = `small ${tone === 'muted' ? 'muted' : tone === 'warn' ? 'warn-text' : 'good-text'}`; status.textContent = text; };
  const failed = (err) => say(err?.fromCamera ? cameraErrorMessage(err) : listenErrorMessage(err), 'warn');

  // ---------- The camera ----------

  let onSeenStroke = null;
  const camera = handCamera({ onSeen: (s) => onSeenStroke?.(s) });
  const camIdle = h('div', { class: 'hc-idle' },
    h('p', {}, h('span', { 'aria-hidden': 'true' }, '📷 '), t('hc.setup')),
    h('p', { class: 'small muted' }, t('hc.firstTime', { mb: DOWNLOAD_MB })));

  // Starts following the learner; handle(stroke) gets each stroke:
  // { time (AudioContext s), hand ('right' | 'left' | 'both'), bol (null:
  // not a tabla stroke), parts (bols to sound; null: the hand's chosen bol),
  // level (loudness, null if unheard), seen ({ strike, stroke } from the
  // camera), unseen (the camera was on but missed it) }.
  async function startInput(handle) {
    // Wake the sound now, while the tap still counts: phones only allow it
    // straight after a tap, and the camera may first take a while to start.
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    let live = true;
    const give = (stroke) => { if (live && stroke) handle(stroke); };
    if (!withCamera()) {
      const player = await listenForHits((hit) => give({ time: hit.time, hand: classifier.classify(hit.vector).hand, bol: null, parts: null, level: hit.level }));
      return { player, stop: () => { live = false; player.stop(); } };
    }
    const fromCamera = (seen, hit, time) => {
      if (seen?.repeat) return null;
      if (seen?.strike.sides.length) {
        const { strike, stroke } = seen;
        return { time, hand: strike.sides.length === 2 ? 'both' : strike.sides[0], bol: stroke.bol, parts: stroke.parts, level: hit?.level ?? null, seen };
      }
      // The camera has no pictures of that moment yet (it has only just
      // started): let it pass rather than guess.
      if (!hit || !seen?.strike.covered) return null;
      // Both hands were in view and neither came down: not a stroke (a knock,
      // a voice, the table creaking).
      if (seen.strike.moves.right && seen.strike.moves.left) {
        camera.say(t('hc.noStroke'), 'warn');
        return null;
      }
      // A hand was out of view: the sound tells which hand it was.
      const { hand } = classifier.classify(hit.vector);
      return { time, hand, bol: USUAL[hand], parts: [USUAL[hand]], level: hit.level, unseen: true };
    };
    if (!camera.running) {
      say(t('hc.starting'));
      try {
        await camera.start((share) => say(t('hc.loading', { pct: Math.round(share * 100) })));
      } catch (err) {
        throw Object.assign(err, { fromCamera: true });
      }
    }
    camIdle.hidden = true;
    let player;
    try {
      player = await listenForHits(
        (hit) => camera.strokeAt(hit.time, { level: +hit.level.toFixed(4) }).then((seen) => give(fromCamera(seen, hit, hit.time))),
        (audioTime) => camera.heard(audioTime),
      );
    } catch (err) {
      camera.stop();
      camIdle.hidden = false;
      throw err;
    }
    onSeenStroke = (s) => give(fromCamera(s, null, s.audioTime ?? player.now()));
    return {
      player,
      stop: () => {
        live = false;
        onSeenStroke = null;
        player.stop();
        camera.stop();
        camIdle.hidden = false;
      },
    };
  }

  // "Right hand, index → Na (rim)", on the camera picture and under it.
  function showStroke(s) {
    if (!s.seen && !s.unseen) return;
    if (s.unseen) { camera.say(t('hc.notSeen', { bol: bolName(s.bol) })); return; }
    const { stroke } = s.seen;
    const who = SIDES.filter((side) => stroke[side]).map((side) => t('hc.who', {
      hand: t(`hc.hand.${side}`),
      how: stroke[side].how === 'flat' ? t('hc.flat') : stroke[side].how === 'fingers' ? t('hc.fingers') : t(`hc.finger.${stroke[side].how}`),
    })).join(' + ');
    if (!stroke.bol) {
      camera.flash(s.seen, '✋');
      camera.say(`${who}: ${t('hc.thumb')}`, 'warn');
      return;
    }
    const bol = stroke.parts.map(bolName).join(' + ');
    const zone = stroke.right?.zone ? ` (${t(`hc.zone.${stroke.right.zone}`)})` : '';
    camera.flash(s.seen, bol);
    camera.say(`${who} → ${bol}${zone}`, 'good');
  }

  // ---------- Teaching the app your strokes (microphone only) ----------

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
    recent.prepend(h('span', { class: `note-chip tt-${hand || 'pad'}` }, bol.split('+').map(bolName).join('+')));
    while (recent.children.length > 16) recent.lastChild.remove();
  };
  const choiceSelect = (hand) => h('label', { class: 'field' },
    h('span', {}, t(`tt.plays.${hand}`)),
    h('select', { class: 'select', onChange: (e) => { choice[hand] = e.target.value; } },
      CHOICES[hand].map((bol) => h('option', { value: bol, selected: bol === choice[hand] }, bolName(bol)))));
  const choices = h('div', { class: 'field-row' }, HANDS.map(choiceSelect));
  const fingerGuide = h('p', { class: 'small muted' }, t('hc.freeHow'));
  const startLabel = () => t(withCamera() ? 'hc.startPlaying' : 'tt.start');

  const freeStroke = (s) => {
    const velocity = velocityOf(s.level);
    if (s.parts === null) {
      sound(choice[s.hand], velocity, active?.player);
      played(choice[s.hand], s.hand);
      return;
    }
    showStroke(s);
    if (!s.parts.length) return;
    s.parts.forEach((bol) => sound(bol, velocity, active?.player));
    played(s.bol, s.hand);
  };

  const freeBtn = h('button', {
    class: 'btn btn-primary', type: 'button',
    onClick: async () => {
      if (active?.mode === 'free') { stopActive(); say(''); return; }
      stopActive();
      try {
        const run = await startInput(freeStroke);
        active = { mode: 'free', player: run.player, stop: () => { run.stop(); freeBtn.textContent = startLabel(); } };
        freeBtn.textContent = t('tt.stop');
        if (withCamera()) say(t('hc.playing'), 'good');
        else say(saved() ? t('tt.listening') : t('tt.notSetUp'), saved() ? 'good' : 'warn');
      } catch (err) {
        failed(err);
      }
    },
  });
  const freePanel = h('div', {},
    choices, fingerGuide,
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
  const thekaHow = h('p', { class: 'small muted' });
  const playLabel = () => t(withCamera() ? 'hc.playAlong' : 'tt.play');

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

  const playBtn = h('button', { class: 'btn btn-primary', type: 'button', onClick: () => (active?.mode === 'theka' ? stopActive() : playTheka()) });

  // What a stroke should have been and what it was: { ok, note, parts to sound }.
  function judge(want, s) {
    const wantHand = handOf(want);
    if (s.seen) {
      const check = checkStroke(want, s.seen.stroke, { zones: !!camera.drums?.dayan });
      if (check.ok) return { ok: true, note: '✓', parts: s.parts };
      const note = check.problem === 'hands'
        ? t('tt.needs', { hand: handName(check.need.length === 2 ? 'both' : check.need[0]) })
        : t(`hc.use.${check.need}`);
      return { ok: false, note, parts: s.parts };
    }
    // Only the hand is known (microphone only, or the camera missed it).
    // Your hands decide the sound: the theka's bol when they are right,
    // otherwise what those hands would play, so a wrong hand is heard.
    const ok = !wantHand || wantHand === s.hand;
    const own = s.parts === null ? [choice[s.hand]] : s.parts;
    return { ok, note: ok ? '✓' : t('tt.needs', { hand: handName(wantHand) }), parts: ok ? [want === 'X' ? own[0] : want] : own };
  }

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
    const camMode = withCamera();
    const endRound = () => {
      if (!stats.total) return;
      round++;
      const key = camMode ? (withBeat ? 'hc.round' : 'hc.roundFree') : (withBeat ? 'tt.round' : 'tt.roundFree');
      roundLine.textContent = t(key, { n: round, hands: stats.hands, time: stats.time, total: stats.total });
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
      const run = await startInput((s) => {
        if (!follower || s.time < ignoreBefore) return;
        showStroke(s);
        const res = follower.hit(s.time);
        res.missed.forEach(missed);
        const verdict = judge(res.stroke.bol, s);
        verdict.parts.forEach((bol) => sound(bol, velocityOf(s.level), run.player));
        let note = verdict.note;
        let onTime = true;
        if (res.offset !== null && verdict.ok) {
          const tol = timingTolerance(beat);
          if (res.offset < -tol) { note = t('tt.early'); onTime = false; }
          if (res.offset > tol) { note = t('tt.late'); onTime = false; }
        }
        show(res.stroke, verdict.ok ? 'ok' : 'bad', note);
        if (verdict.ok) stats.hands++;
        if (onTime && res.offset !== null) stats.time++;
        highlight();
      });
      const { player } = run;
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
        // The camera needs a moment longer to say which finger it was.
        const grace = timingTolerance(beat) + 0.5 * beat + (camMode ? 0.25 : 0);
        const overdue = setInterval(() => follower.overdue(player.now(), grace).forEach((s) => { missed(s); highlight(); }), 100);
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
          run.stop();
          clearInterval(metronome);
          timers.forEach((x) => (x.interval ? clearInterval(x.interval) : clearTimeout(x)));
          endRound();
          countEl.textContent = '';
          chips.forEach((c) => c.el.classList.remove('on'));
          playBtn.textContent = playLabel();
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
    thekaHow,
    h('div', { class: 'controls' }, h('label', { class: 'inline' }, t('tt.chooseTaal'), ' ', sourceSelect)),
    tempo,
    checkbox(t('tt.beat'), withBeat, (v) => { withBeat = v; }),
    h('div', { class: 'controls' }, listenBtn, playBtn),
    countEl, chipsBox, roundLine);

  // ---------- Problems with the camera ----------

  const recordNote = h('p', { class: 'small', 'aria-live': 'polite' });
  let recordTimer = 0;
  const recordBtn = h('button', {
    class: 'btn btn-sm', type: 'button',
    onClick: () => {
      if (!camera.running) { recordNote.className = 'small warn-text'; recordNote.textContent = t('hc.recordFirst'); return; }
      if (!camera.record()) return;
      let left = camera.recordSeconds;
      clearInterval(recordTimer);
      const tick = () => {
        recordNote.className = 'small';
        recordNote.textContent = left > 0 && camera.running ? t('hc.recording', { s: left }) : t('hc.recorded');
        if (left <= 0 || !camera.running) clearInterval(recordTimer);
        left--;
      };
      tick();
      recordTimer = setInterval(tick, 1000);
    },
  }, `⏺ ${t('hc.record')}`);
  scope.onCleanup(() => clearInterval(recordTimer));
  const problems = h('details', { class: 'step-card' },
    h('summary', {}, t('hc.problems')),
    h('ul', { class: 'small' }, ['hc.tip.light', 'hc.tip.view', 'hc.tip.swap', 'hc.tip.drums', 'hc.tip.sound'].map((k) => h('li', {}, t(k)))),
    h('p', { class: 'small muted' }, t('hc.recordHelp')),
    h('div', { class: 'controls' }, recordBtn),
    recordNote);

  // ---------- Page ----------

  const howList = h('ul', { class: 'tt-how' });
  const howTips = h('p', { class: 'small muted' });
  const inputTabs = h('div', { class: 'segmented', role: 'group', 'aria-label': t('hc.inputLabel') });
  const inputDesc = h('p', { class: 'small muted' });
  const stage = h('div', { class: 'tt-stage' }, drum.el, camIdle, camera.el);

  const HOW = {
    camera: [['👉', 'hc.how.na'], ['👉', 'hc.how.tin'], ['👉', 'hc.how.tu'], ['✌️', 'hc.how.ti'], ['🤞', 'hc.how.ge'], ['✋', 'hc.how.ke'], ['🙌', 'hc.how.both']],
    mic: [['👉', 'tt.how.right'], ['🤚', 'tt.how.left'], ['🙌', 'tt.how.both']],
  };

  function showInput() {
    stopActive();
    const cam = withCamera();
    inputTabs.replaceChildren(...['camera', 'mic'].map((m) => h('button', {
      class: `seg${m === input ? ' on' : ''}`, type: 'button', 'aria-pressed': String(m === input),
      disabled: m === 'camera' && !canSee(),
      onClick: () => { input = m; store.setSetting(INPUT, m); showInput(); },
    }, t(`hc.input.${m}`))));
    inputDesc.textContent = t(cam ? 'hc.inputCameraDesc' : 'hc.inputMicDesc');
    howList.replaceChildren(...HOW[input].map(([icon, key]) => h('li', {}, h('span', { 'aria-hidden': 'true' }, `${icon} `), t(key))));
    howTips.textContent = t(cam ? 'hc.tips' : 'tt.tips');
    setupCard.hidden = cam;
    drum.el.toggleAttribute('hidden', cam);  // an SVG element: no .hidden property
    camIdle.hidden = !cam || camera.running;
    choices.hidden = cam;
    fingerGuide.hidden = !cam;
    problems.hidden = !cam;
    thekaHow.textContent = t(cam ? 'hc.thekaHow' : 'tt.thekaHow');
    freeBtn.textContent = startLabel();
    playBtn.textContent = playLabel();
    say('');
  }

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
  showInput();
  showSetupState();

  return h('div', { class: 'container c-tabla' },
    h('a', { class: 'back', href: lessonEx ? `#/lesson/${lessonId}/practice` : '#/tools' }, lessonEx ? `← ${lessonEx.title}` : t('tools.back')),
    h('h1', {}, `🪘 ${t('tt.title')}`),
    h('p', { class: 'muted' }, t('tt.intro')),
    h('div', { class: 'step-card' },
      h('h2', {}, t('hc.inputLabel')),
      inputTabs, inputDesc),
    h('div', { class: 'step-card' },
      h('h2', {}, t('tt.howTitle')),
      howList, howTips),
    setupCard,
    h('div', { class: 'step-card' },
      tabs,
      stage,
      status,
      panelBox,
      h('p', { class: 'small muted' }, t('tt.screenPads')),
      pads),
    problems);
}
