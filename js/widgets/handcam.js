// Table Tabla's eyes: runs the camera and the hand tracker, shows the hands
// with every finger named, and says which hand and finger made each stroke
// the microphone hears. Strokes the camera sees that were too soft to hear
// are reported through onSeen.
import { h } from '../ui/dom.js';
import { t } from '../i18n/i18n.js';
import { startHandCamera } from '../vision/hands.js';
import { handView } from './handview.js';
import {
  SIDES, FINGERS, HandSides, HandHistory, CameraStrikes, ClockLink, strikeAt, strokeOf, landingTime, placeDrums,
  sameLanding, landingsOf,
} from '../analysis/handstrikes.js';

const AFTER = 40;     // ms of pictures after a hit needed to judge it…
const WAIT = 200;     // …waited for at most this long
const HEAR = 160;     // ms a stroke only the camera saw waits for the microphone
const SAME = 120;     // ms within which a heard and a seen stroke are one stroke…
const NEAR = 250;     // …or this, before the two clocks are matched
const NUDGES = [-33, 33, -67, 67, -100, 100];  // ms to look either side of a hit the camera did not place
const STEADY = 1000;  // ms the resting hands stay still before the drums are placed
const RECORD_SECONDS = 30;

const round = (v, n = 4) => +v.toFixed(n);
const palmCentre = (points) => [0, 5, 9, 13, 17].reduce((a, i) => [a[0] + points[i][0] / 5, a[1] + points[i][1] / 5, 0], [0, 0, 0]);

export function handCamera({ onSeen } = {}) {
  const view = handView();
  const sides = new HandSides();
  const link = new ClockLink();
  let history = new HandHistory();
  let spotter = new CameraStrikes();
  let cam = null;
  let drums = null;
  let aspect = 4 / 3;
  let hands = { right: null, left: null };
  let waiting = [];
  let heardAt = [];   // { cam, audio, matched } for strokes the microphone heard
  let landings = [];  // { time, matched } for strokes the camera saw land
  let lastLanding = {}; // per hand, where its last stroke landed
  let rec = null;
  let seenState = '';

  const seenLine = h('p', { class: 'small hc-seen' });
  const legend = h('p', { class: 'small muted hc-legend' },
    FINGERS.map((f) => `${t(`hc.short.${f}`)} ${t(`hc.finger.${f}`)}`).join(' · '));
  const note = h('p', { class: 'small', 'aria-live': 'polite' });
  const say = (text, tone = 'muted') => { note.className = `small ${tone === 'warn' ? 'warn-text' : tone === 'good' ? 'good-text' : 'muted'}`; note.textContent = text; };
  const drumsBtn = h('button', {
    class: 'btn btn-sm', type: 'button',
    onClick: () => {
      if (!hands.right || !hands.left) { say(t('hc.drumsNeedHands'), 'warn'); return; }
      drums = placeDrums(hands.right, hands.left, aspect);
      say(t('hc.drumsDone'), 'good');
    },
  }, `🥁 ${t('hc.drums')}`);
  const swapBtn = h('button', { class: 'btn btn-sm', type: 'button', onClick: () => { sides.swap = !sides.swap; drums = null; } }, `⇄ ${t('hc.swap')}`);
  const el = h('div', { class: 'hc-wrap', hidden: true },
    view.el, legend, seenLine, h('div', { class: 'controls hc-tools' }, drumsBtn, swapBtn), note);

  function showSeen() {
    const state = hands.right && hands.left ? 'both' : hands.right ? 'right' : hands.left ? 'left' : 'none';
    if (state === seenState) return;
    seenState = state;
    seenLine.className = `small hc-seen ${state === 'both' ? 'good-text' : 'warn-text'}`;
    seenLine.textContent = t(`hc.seen.${state}`);
  }

  // Once both hands rest still in view, the drums are drawn under them.
  function placeWhenSteady() {
    const now = history.latest.time;
    const recent = history.between(now - STEADY, now);
    if (recent.length < 8 || now - recent[0].time < STEADY * 0.8 || recent.some((f) => !f.hands.right || !f.hands.left)) return;
    const still = SIDES.every((s) => {
      const xs = recent.map((f) => f.hands[s].points[0][0]);
      const ys = recent.map((f) => f.hands[s].points[0][1]);
      return Math.max(...xs) - Math.min(...xs) < 0.03 && Math.max(...ys) - Math.min(...ys) < 0.03;
    });
    if (still) drums = placeDrums(hands.right, hands.left, aspect);
  }

  function onFrame(frame, video) {
    aspect = frame.aspect;
    hands = sides.assign(frame.hands, aspect);
    history.push(frame.time, hands, aspect);
    if (!drums) placeWhenSteady();
    view.setMirror(sides.facing >= 0);
    view.draw(video, hands, drums);
    showSeen();
    for (const s of spotter.update(history)) {
      landings = landings.filter((l) => l.time > s.time - 2000);
      landings.push({ time: s.time });
      match();
      setTimeout(() => seenOnly(s), HEAR);
    }
    const latest = frame.time;
    const due = waiting.filter((w) => latest >= w.until);
    waiting = waiting.filter((w) => latest < w.until);
    due.forEach((w) => w.done());
    rec?.frames.push({
      t: Math.round(frame.time - rec.t0),
      hands: frame.hands.map((x) => ({ label: x.label, p: x.points.map((q) => q.map((v) => round(v))) })),
    });
  }

  // Pairs strokes heard with strokes seen landing, to learn how far apart
  // the microphone's and the camera's clocks are.
  function match() {
    for (const l of landings) {
      if (l.matched) continue;
      const gap = (x) => Math.abs(link.toCamera(x.audio) - l.time);
      const near = heardAt.filter((x) => !x.matched && gap(x) < NEAR).sort((a, b) => gap(a) - gap(b))[0];
      if (!near) continue;
      near.matched = l.matched = true;
      link.learn(near.audio, l.time);
    }
  }

  // A stroke the camera saw land that the microphone did not hear.
  function seenOnly(s) {
    const same = link.learned >= 2 ? SAME : NEAR;
    if (!cam || heardAt.some((x) => Math.abs(link.toCamera(x.audio) - s.time) < same)) return;
    const strike = strikeAt(history, s.time);
    if (!strike.sides.length || sameLanding(history, strike, lastLanding)) return;
    lastLanding = { ...lastLanding, ...landingsOf(strike) };
    const stroke = strokeOf(strike, drums);
    rec?.seen.push({ t: Math.round(s.time - rec.t0), sides: strike.sides, bol: stroke.bol });
    onSeen?.({ audioTime: link.base === null ? null : link.toAudio(s.time), strike, stroke });
  }

  function save() {
    if (!rec) return;
    const data = {
      app: 'SurTaal Table Tabla',
      kind: 'hand-recording',
      version: 1,
      saved: new Date().toISOString(),
      browser: navigator.userAgent,
      fps: cam?.fps() ?? null,
      aspect,
      facing: sides.facing,
      swap: sides.swap,
      clockShift: round(link.shift, 1),
      drums,
      ...rec,
    };
    rec = null;
    const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
    const a = h('a', { href: url, download: `surtaal-hands-${data.saved.slice(0, 19).replace(/[:T]/g, '-')}.json` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  return {
    el,
    get running() { return cam !== null; },
    get drums() { return drums; },

    async start(onProgress) {
      if (cam) return;
      history = new HandHistory();
      spotter = new CameraStrikes();
      lastLanding = {};
      drums = null;
      seenState = '';
      say('');
      cam = await startHandCamera({ onFrame, onProgress });
      el.hidden = false;
    },

    stop() {
      cam?.stop();
      cam = null;
      const pending = waiting;
      waiting = [];
      pending.forEach((w) => w.done());
      if (rec) save();
      el.hidden = true;
    },

    // For each piece of microphone sound, so the two clocks can be matched.
    heard(audioTime) { link.heard(audioTime, performance.now()); },

    // Which hand and finger made the hit the microphone heard at audioTime
    // (AudioContext seconds): resolves to { strike, stroke } once the camera
    // has pictures from just after it.
    strokeAt(audioTime, info = {}) {
      const at = link.toCamera(audioTime);
      heardAt = heardAt.filter((x) => x.cam > at - 2000);
      heardAt.push({ cam: at, audio: audioTime });
      match();
      return new Promise((resolve) => {
        const deadline = performance.now() + WAIT;
        const judge = () => {
          const when = link.toCamera(audioTime);
          let strike = strikeAt(history, when);
          for (const d of strike.sides.length ? [] : NUDGES) {
            const nearby = strikeAt(history, when + d);
            if (nearby.sides.length) { strike = nearby; break; }
          }
          // A finger still on its way down: wait for the next picture to see
          // where it lands (it decides between Na, Tin and Tu).
          if (!strike.settled && cam && performance.now() < deadline) {
            waiting.push({ until: history.latest.time + 1, done: judge });
            return;
          }
          // One stroke can be heard twice (a thump rings on); it is still
          // one stroke until that finger rises again.
          const repeat = sameLanding(history, strike, lastLanding);
          if (!repeat) lastLanding = { ...lastLanding, ...landingsOf(strike) };
          const landed = landingTime(strike);
          if (!repeat && landed !== null && strike.sides.length === 1 && strike[strike.sides[0]].activity >= 0.25) link.learn(audioTime, landed);
          const stroke = strokeOf(strike, drums);
          rec?.hits.push({
            t: Math.round(at - rec.t0), audio: round(audioTime, 4), ...info, sides: strike.sides, bol: stroke.bol, repeat,
            moves: Object.fromEntries(SIDES.map((s) => [s, strike.moves[s] && {
              palm: round(strike.moves[s].palmDrop, 3),
              drops: Object.fromEntries(FINGERS.map((f) => [f, round(strike.moves[s].drops[f], 3)])),
            }])),
          });
          resolve({ strike, stroke, repeat });
        };
        if (history.latest && history.latest.time >= at + AFTER) { judge(); return; }
        waiting.push({ until: at + AFTER, done: judge });
        // Pictures stopped coming (camera covered or stopped): judge anyway.
        const check = () => {
          if (!waiting.some((w) => w.done === judge)) return;
          if (performance.now() < deadline) { setTimeout(check, 20); return; }
          waiting = waiting.filter((w) => w.done !== judge);
          judge();
        };
        setTimeout(check, WAIT);
      });
    },

    // Rings the fingers (or palm) that made a stroke, with its bol.
    flash({ strike }, text) {
      strike.sides.forEach((side, i) => {
        const move = strike[side];
        const latest = history.latest?.hands[side];
        const points = move.flat ? (latest ? [palmCentre(latest.points)] : [])
          : move.fingers.map((f) => (f === move.landing?.part ? move.landing.point : move.contact[f]?.point)).filter(Boolean);
        view.flash(points, i === 0 ? text : '', side);
      });
    },

    say,

    // Keeps the next RECORD_SECONDS of finger positions and hits, then saves
    // them as a file for whoever helps tune the app.
    record() {
      if (!cam || rec) return false;
      rec = { t0: performance.now(), frames: [], hits: [], seen: [] };
      setTimeout(save, RECORD_SECONDS * 1000);
      return true;
    },
    recordSeconds: RECORD_SECONDS,
  };
}
