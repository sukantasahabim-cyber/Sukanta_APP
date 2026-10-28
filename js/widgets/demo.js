// "Watch demo" for practical exercises: before trying, the learner watches
// and hears the exercise done right. Tabla exercises show an animated tabla
// with the spot each finger strikes; singing exercises draw the pitch line a
// good voice makes on the swara bands while the guide sings it.
import { h, svg } from '../ui/dom.js';
import { swaraLabel } from '../ui/controls.js';
import { t } from '../i18n/i18n.js';
import { bolName } from '../i18n/names.js';
import { getCtx, click } from '../audio/engine.js';
import { playBol, bolStrokes, clap } from '../audio/tabla.js';
import { playSwara, playGlide } from '../audio/voice.js';
import { parseSwara, tokenize } from '../music.js';
import { store } from '../store.js';
import { tablaDemo, voiceDemo, demoPitchAt } from '../data/demos.js';

// ---------- Shared frame ----------

// A collapsed panel: "Watch demo" opens it and plays; the speed can be halved.
function demoFrame(stage, caption, play) {
  let stopFn = null;
  let slow = false;
  const panel = h('div', { class: 'demo-stage', hidden: true }, stage, caption);
  const stop = () => {
    stopFn?.();
    stopFn = null;
    watch.textContent = `▶ ${t('demo.watch')}`;
    watch.classList.remove('active');
  };
  const watch = h('button', {
    class: 'btn btn-demo', type: 'button',
    onClick: () => {
      if (stopFn) { stop(); return; }
      panel.hidden = false;
      watch.textContent = `■ ${t('demo.stop')}`;
      watch.classList.add('active');
      stopFn = play(slow ? 0.5 : 1, stop);
    },
  }, `▶ ${t('demo.watch')}`);
  const speed = h('label', { class: 'check small' },
    h('input', { type: 'checkbox', onChange: (e) => { slow = e.target.checked; } }),
    h('span', {}, `🐢 ${t('demo.slow')}`));
  return { el: h('div', { class: 'demo' }, h('div', { class: 'controls' }, watch, speed), panel), stop };
}

// Runs fn at AudioContext time `when`; returns a cancel function list holder.
function timers() {
  const ids = [];
  return {
    at(when, fn) { ids.push(setTimeout(fn, Math.max(0, (when - getCtx().currentTime) * 1000))); },
    clear() { ids.forEach(clearTimeout); ids.length = 0; },
  };
}

// ---------- Tabla ----------

// Where each basic stroke lands on the drums drawn below (viewBox 0 0 320 190).
const BAYAN = { cx: 92, cy: 92, r: 74 };
const DAYAN = { cx: 236, cy: 92, r: 58 };
const polar = (d, r, deg) => ({ x: d.cx + r * Math.cos((deg * Math.PI) / 180), y: d.cy + r * Math.sin((deg * Math.PI) / 180) });
const STROKE_SPOT = {
  na: { drum: 'dayan', zone: 'kinar', ...polar(DAYAN, 54, -140), size: 9 },
  tin: { drum: 'dayan', zone: 'sur', ...polar(DAYAN, 36, -140), size: 9 },
  tu: { drum: 'dayan', zone: 'syahi', ...polar(DAYAN, 6, -90), size: 9 },
  ti: { drum: 'dayan', zone: 'syahi', ...polar(DAYAN, 6, 60), size: 15 },
  ra: { drum: 'dayan', zone: 'syahi', ...polar(DAYAN, 10, -120), size: 10 },
  ge: { drum: 'bayan', zone: 'maidan', ...polar(BAYAN, 46, -55), size: 13 },
  ke: { drum: 'bayan', zone: 'whole', x: BAYAN.cx + 8, y: BAYAN.cy + 4, size: 34 },
};

// The pair of drums, drawn; strike(['na', 'ge']) lights where those strokes land.
export function tablaSvg() {
  const zone = (name, el) => { el.setAttribute('data-zone', name); return el; };
  const s = svg('svg', { viewBox: '0 0 320 190', class: 'tabla-svg', role: 'img', 'aria-label': t('demo.tablaLabel') },
    // Bayan: big metal bass drum, syahi set towards the player.
    svg('g', { 'data-drum': 'bayan' },
      zone('whole', svg('circle', { cx: BAYAN.cx, cy: BAYAN.cy, r: BAYAN.r, class: 'drum-rim' })),
      zone('maidan', svg('circle', { cx: BAYAN.cx, cy: BAYAN.cy, r: BAYAN.r - 7, class: 'drum-skin' })),
      zone('syahi', svg('circle', { cx: BAYAN.cx + 14, cy: BAYAN.cy + 6, r: 24, class: 'drum-syahi' }))),
    // Dayan: wooden treble drum: rim (kinar), open skin (sur/maidan), syahi.
    svg('g', { 'data-drum': 'dayan' },
      zone('kinar', svg('circle', { cx: DAYAN.cx, cy: DAYAN.cy, r: DAYAN.r, class: 'drum-rim' })),
      zone('sur', svg('circle', { cx: DAYAN.cx, cy: DAYAN.cy, r: DAYAN.r - 9, class: 'drum-skin' })),
      zone('syahi', svg('circle', { cx: DAYAN.cx, cy: DAYAN.cy, r: 21, class: 'drum-syahi' }))),
    svg('text', { x: BAYAN.cx, y: 184, class: 'drum-label' }, t('demo.bayan')),
    svg('text', { x: DAYAN.cx, y: 184, class: 'drum-label' }, t('demo.dayan')));
  const hits = svg('g', { class: 'hits' });
  s.append(hits);
  return {
    el: s,
    strike(strokes) {
      s.querySelectorAll('.lit').forEach((z) => z.classList.remove('lit'));
      for (const name of strokes) {
        const spot = STROKE_SPOT[name];
        s.querySelector(`[data-drum="${spot.drum}"] [data-zone="${spot.zone}"]`)?.classList.add('lit');
        const mark = svg('circle', { cx: spot.x, cy: spot.y, r: spot.size, class: `hit-mark hit-${spot.drum}` });
        hits.append(mark);
        setTimeout(() => mark.remove(), 600);
      }
    },
    reset() { s.querySelectorAll('.lit').forEach((z) => z.classList.remove('lit')); hits.replaceChildren(); },
  };
}

const strokesOf = (bol) => (bol === 'X' ? ['na'] : bolStrokes(bol));

// Clapping exercises (in the singing course): a pair of hands that pulses.
function clapStage() {
  const el = h('div', { class: 'clap-stage', role: 'img', 'aria-label': t('demo.clapLabel') }, '👏');
  return {
    el,
    strike() { el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); },
    reset() { el.classList.remove('hit'); },
  };
}

function tablaDemoWidget(ex) {
  const tokens = tokenize(ex.bols);
  const drum = ex.clap ? clapStage() : tablaSvg();
  const count = h('div', { class: 'demo-count', 'aria-hidden': 'true' }, '');
  const chips = tokens.map((bol) => h('span', { class: `note-chip${bol === '-' ? ' hold' : ''}` }, bol === '-' ? '–' : ex.clap ? '👏' : bolName(bol)));
  const how = h('div', { class: 'demo-how', 'aria-live': 'polite' }, t(ex.clap ? 'demo.clapIntro' : 'demo.tablaIntro'));
  const stage = h('div', {}, h('div', { class: 'demo-drums' }, drum.el, count), h('div', { class: 'notes demo-bols' }, chips), how);
  const describe = (bol) => {
    if (ex.clap) return;
    const parts = strokesOf(bol);
    how.replaceChildren(
      h('b', {}, bolName(bol === 'X' ? 'Na' : bol)),
      parts.length > 1 ? ` = ${parts.map((p) => bolName(p[0].toUpperCase() + p.slice(1))).join(' + ')} ${t('demo.together')}` : '',
      ...parts.map((p) => h('p', { class: 'small' }, t(`demo.stroke.${p}`))));
  };
  const frame = demoFrame(stage, null, (speed, done) => {
    const plan = tablaDemo(ex, speed);
    const t0 = getCtx().currentTime + 0.15;
    const run = timers();
    drum.reset();
    chips.forEach((c) => c.classList.remove('on'));
    plan.clicks.forEach((c, i) => {
      click(t0 + c, i === 0);
      run.at(t0 + c, () => { count.textContent = String(4 - i); });
    });
    plan.events.forEach((e) => {
      if (e.bol !== '-') {
        if (ex.clap) clap(t0 + e.time);
        else playBol(e.bol === 'X' ? 'Na' : e.bol, t0 + e.time);
      }
      run.at(t0 + e.time, () => {
        count.textContent = '';
        chips.forEach((c, i) => c.classList.toggle('on', i === e.k));
        if (e.bol !== '-') { drum.strike(strokesOf(e.bol)); describe(e.bol); }
      });
    });
    run.at(t0 + plan.duration, () => { chips.forEach((c) => c.classList.remove('on')); drum.reset(); done(); });
    return () => { run.clear(); count.textContent = ''; };
  });
  return frame.el;
}

// ---------- Singing ----------

const LOW = -5;    // lower Pa
const HIGH = 12;   // upper Sa
const ROWS = ['.P', '.D', '.N', 'S', 'R', 'G', 'M', 'P', 'D', 'N', "S'"].map(parseSwara);

function voiceDemoWidget(ex) {
  const canvas = h('canvas', { class: 'pitch-roll demo-roll', role: 'img', 'aria-label': t('demo.voiceLabel') });
  const g = canvas.getContext('2d');
  const caption = h('p', { class: 'demo-how' }, t(`demo.${ex.type}`));
  let plan = voiceDemo(ex);
  let elapsed = -1;

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const hgt = canvas.clientHeight;
    if (!w) return;
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(hgt * dpr); }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, hgt);
    const cs = getComputedStyle(canvas);
    const c = (n) => cs.getPropertyValue(n).trim();
    const left = 36;
    const span = HIGH - LOW + 1.5;
    const y = (semi) => hgt - ((semi - LOW + 0.75) / span) * hgt;
    const band = hgt / span;
    const x = (time) => left + (time / plan.duration) * (w - left - 10);
    g.font = '600 11px system-ui, sans-serif';
    g.textBaseline = 'middle';
    for (const sw of ROWS) {
      const target = plan.targets.includes(sw.semitone);
      g.fillStyle = c('--surface-2');
      g.fillRect(left, y(sw.semitone) - band * 0.4, w - left, band * 0.8);
      if (target) {
        g.globalAlpha = 0.16;
        g.fillStyle = c('--good');
        g.fillRect(left, y(sw.semitone) - band * 0.4, w - left, band * 0.8);
        g.globalAlpha = 1;
      }
      g.fillStyle = target ? c('--text') : c('--muted');
      g.fillText(swaraLabel(sw).textContent + (sw.octave > 0 ? "'" : sw.octave < 0 ? ',' : ''), 4, y(sw.semitone));
    }
    // Upcoming notes as faint guides, the sung part as a solid line.
    g.strokeStyle = c('--border');
    g.lineWidth = 3;
    for (const n of plan.notes) {
      g.beginPath();
      g.moveTo(x(n.t), y(n.semi));
      g.lineTo(x(n.t + n.dur), y(n.semi));
      g.stroke();
    }
    if (plan.glide) {
      g.setLineDash([4, 5]);
      g.beginPath();
      plan.glide.forEach((p, i) => (i ? g.lineTo(x(p.t), y(p.semi)) : g.moveTo(x(p.t), y(p.semi))));
      g.stroke();
      g.setLineDash([]);
    }
    if (elapsed < 0) return;
    g.strokeStyle = c('--good');
    g.lineWidth = 3.5;
    g.lineCap = 'round';
    let prev = null;
    let last = null;
    for (let time = 0; time <= Math.min(elapsed, plan.duration); time += 0.02) {
      const semi = demoPitchAt(plan, time);
      if (semi == null) { prev = null; continue; }
      const pt = { x: x(time), y: y(semi) };
      if (prev) { g.beginPath(); g.moveTo(prev.x, prev.y); g.lineTo(pt.x, pt.y); g.stroke(); }
      prev = pt;
      last = pt;
    }
    if (last && elapsed <= plan.duration) {
      g.fillStyle = c('--good');
      g.beginPath();
      g.arc(last.x, last.y, 6, 0, Math.PI * 2);
      g.fill();
    }
  }

  const frame = demoFrame(h('div', {}, canvas), caption, (speed, done) => {
    plan = voiceDemo(ex, speed);
    const ctx = getCtx();
    const t0 = ctx.currentTime + 0.15;
    const sa = store.setting('saMidi');
    if (plan.glide) playGlide(plan.glide.map((p) => ({ t: t0 + p.t, midi: sa + p.semi })));
    plan.notes.forEach((n) => playSwara(n.semi, t0 + n.t, n.dur));
    let raf = 0;
    const frameFn = () => {
      elapsed = getCtx().currentTime - t0 - (getCtx().outputLatency || 0);
      draw();
      if (elapsed > plan.duration) { elapsed = plan.duration; draw(); done(); return; }
      raf = requestAnimationFrame(frameFn);
    };
    raf = requestAnimationFrame(frameFn);
    return () => cancelAnimationFrame(raf);
  });
  // Draw the empty bands once the panel is visible.
  requestAnimationFrame(() => draw());
  frame.el.querySelector('.btn-demo').addEventListener('click', () => requestAnimationFrame(draw));
  return frame.el;
}

// The demo for an exercise, or null when there is none (guitar).
export function exerciseDemo(ex) {
  if (ex.type === 'rhythm' && ex.bols) return tablaDemoWidget(ex);
  if (ex.type === 'sing' || ex.type === 'hold' || ex.type === 'range') return voiceDemoWidget(ex);
  return null;
}
