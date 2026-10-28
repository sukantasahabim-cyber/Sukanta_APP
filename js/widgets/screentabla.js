// A tabla on the screen, played with the fingers like a real one (the rules
// are in analysis/screenstrokes.js). Drawn as seen from above: the bayan
// (metal, left) and the dayan (wood, right), each with its gajra (braided
// rim), kinar, open skin and black syahi. Every touch sounds at once with a
// recorded stroke; onStroke(stroke) hears about each stroke a moment later,
// with its bol and the AudioContext time of the touch.
//
// On a computer the keys play it too: F Ge, D Ke (bayan); J Na, K Tin,
// L Tu, ; Ti (dayan).
import { h } from '../ui/dom.js';
import { t } from '../i18n/i18n.js';
import { bolName } from '../i18n/names.js';
import { getCtx } from '../audio/engine.js';
import { playBol } from '../audio/tabla.js';
import { loadRecordings } from '../audio/tablasamples.js';
import { drumLayout, zoneAt, TouchStrokes, ZONES, BAYAN_SYAHI } from '../analysis/screenstrokes.js';

const KEYS = {
  f: ['bayan', 'maidan'], d: ['bayan', 'syahi'],
  j: ['dayan', 'kinar'], k: ['dayan', 'sur'], l: ['dayan', 'syahi'], ';': ['dayan', 'syahi', 2],
};
const GLOW_MS = 260;
const RIPPLE_MS = 420;
const NAME_MS = 900;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ---------- Drawing ----------

function ring(g, cx, cy, r0, r1, fill) {
  g.beginPath();
  g.arc(cx, cy, r1, 0, 2 * Math.PI);
  g.arc(cx, cy, r0, 0, 2 * Math.PI, true);
  g.fillStyle = fill;
  g.fill();
}

function disc(g, cx, cy, r, fill) {
  g.beginPath();
  g.arc(cx, cy, r, 0, 2 * Math.PI);
  g.fillStyle = fill;
  g.fill();
}

function radial(g, cx, cy, r, stops) {
  const grad = g.createRadialGradient(cx - r * 0.25, cy - r * 0.3, r * 0.05, cx, cy, r);
  stops.forEach(([at, color]) => grad.addColorStop(at, color));
  return grad;
}

// The black syahi, with its layers and a sheen.
function syahi(g, cx, cy, r) {
  disc(g, cx, cy, r, radial(g, cx, cy, r, [[0, '#35302b'], [0.6, '#16130f'], [1, '#0a0807']]));
  g.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  g.lineWidth = Math.max(1, r * 0.03);
  for (const k of [0.8, 0.6, 0.4]) { g.beginPath(); g.arc(cx, cy, r * k, 0, 2 * Math.PI); g.stroke(); }
  g.save();
  g.translate(cx - r * 0.3, cy - r * 0.34);
  g.rotate(-0.6);
  g.beginPath();
  g.ellipse(0, 0, r * 0.38, r * 0.15, 0, 0, 2 * Math.PI);
  g.fillStyle = 'rgba(255, 255, 255, 0.14)';
  g.fill();
  g.restore();
}

// The braided gajra round the head.
function gajra(g, cx, cy, r0, r1) {
  ring(g, cx, cy, r0, r1, '#3f2614');
  const mid = (r0 + r1) / 2;
  const n = Math.max(16, Math.round(mid / 4));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 2 * Math.PI;
    g.save();
    g.translate(cx + mid * Math.cos(a), cy + mid * Math.sin(a));
    g.rotate(a + Math.PI / 2 + 0.5);
    g.beginPath();
    g.ellipse(0, 0, ((Math.PI * mid) / n) * 1.1, (r1 - r0) * 0.38, 0, 0, 2 * Math.PI);
    g.fillStyle = i % 2 ? '#6e4527' : '#563419';
    g.fill();
    g.restore();
  }
}

function shadow(g, cx, cy, r) {
  g.save();
  g.shadowColor = 'rgba(0, 0, 0, 0.6)';
  g.shadowBlur = r * 0.3;
  g.shadowOffsetY = r * 0.08;
  disc(g, cx, cy, r, '#24150b');
  g.restore();
}

function drawDayan(g, { cx, cy, r }) {
  shadow(g, cx, cy, r * 1.26);
  // The wooden shell, with the leather straps (baddhi) running down it.
  ring(g, cx, cy, r * 1.1, r * 1.26, radial(g, cx, cy, r * 1.26, [[0.75, '#a86a33'], [0.9, '#8a5226'], [1, '#5c3416']]));
  g.strokeStyle = 'rgba(35, 18, 8, 0.6)';
  g.lineWidth = r * 0.045;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * 2 * Math.PI + 0.1;
    g.beginPath();
    g.moveTo(cx + r * 1.11 * Math.cos(a), cy + r * 1.11 * Math.sin(a));
    g.lineTo(cx + r * 1.26 * Math.cos(a + 0.05), cy + r * 1.26 * Math.sin(a + 0.05));
    g.stroke();
  }
  gajra(g, cx, cy, r, r * 1.11);
  // The skin: the kinar ring, then the open skin (sur, maidan).
  ring(g, cx, cy, r * 0.88, r, '#d8c49c');
  disc(g, cx, cy, r * 0.88, radial(g, cx, cy, r * 0.88, [[0, '#f6ecd6'], [1, '#e1cfa8']]));
  g.strokeStyle = 'rgba(120, 90, 50, 0.45)';
  g.lineWidth = Math.max(1, r * 0.012);
  g.beginPath();
  g.arc(cx, cy, r * 0.88, 0, 2 * Math.PI);
  g.stroke();
  syahi(g, cx, cy, r * ZONES.syahi);
}

function drawBayan(g, { cx, cy, r }) {
  shadow(g, cx, cy, r * 1.22);
  // The metal (copper) shell.
  const metal = g.createLinearGradient(cx - r * 1.2, cy - r * 1.2, cx + r * 1.2, cy + r * 1.2);
  metal.addColorStop(0, '#e2a868');
  metal.addColorStop(0.35, '#a8642c');
  metal.addColorStop(0.65, '#7c4519');
  metal.addColorStop(1, '#c5884b');
  ring(g, cx, cy, r * 1.07, r * 1.22, metal);
  g.strokeStyle = 'rgba(255, 240, 210, 0.35)';
  g.lineWidth = r * 0.03;
  g.beginPath();
  g.arc(cx, cy, r * 1.17, Math.PI * 1.05, Math.PI * 1.45);
  g.stroke();
  gajra(g, cx, cy, r, r * 1.08);
  ring(g, cx, cy, r * 0.92, r, '#d3be95');
  disc(g, cx, cy, r * 0.92, radial(g, cx, cy, r * 0.92, [[0, '#f1e5cc'], [1, '#d9c59e']]));
  syahi(g, cx, cy + r * BAYAN_SYAHI.dy, r * BAYAN_SYAHI.r);
}

function drawNames(g, layout) {
  const { dayan: d, bayan: b } = layout;
  const write = (text, x, y, size, color) => {
    g.font = `700 ${Math.round(size)}px system-ui, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = color;
    g.fillText(text, x, y);
  };
  const ink = 'rgba(80, 52, 24, 0.75)';
  write(bolName('Na'), d.cx, d.cy - d.r * 0.94, d.r * 0.15, ink);
  write(bolName('Tin'), d.cx, d.cy - d.r * 0.62, d.r * 0.17, ink);
  write(bolName('Tu'), d.cx, d.cy, d.r * 0.17, 'rgba(255, 255, 255, 0.8)');
  write(bolName('Ge'), b.cx, b.cy - b.r * 0.48, b.r * 0.17, ink);
  write(bolName('Ke'), b.cx, b.cy + b.r * BAYAN_SYAHI.dy, b.r * 0.15, 'rgba(255, 255, 255, 0.8)');
  // Where the heel of the hand rests.
  write('✋', b.cx, b.cy + b.r * 0.84, b.r * 0.13, 'rgba(80, 52, 24, 0.55)');
}

// The part of a drum a stroke lit up.
function glowPath(g, layout, drum, zone) {
  const d = layout[drum];
  g.beginPath();
  if (drum === 'dayan') {
    const [r0, r1] = { kinar: [ZONES.sur, 1.1], sur: [ZONES.syahi, ZONES.sur], syahi: [0, ZONES.syahi] }[zone];
    g.arc(d.cx, d.cy, d.r * r1, 0, 2 * Math.PI);
    if (r0) g.arc(d.cx, d.cy, d.r * r0, 0, 2 * Math.PI, true);
  } else if (zone === 'syahi') {
    g.arc(d.cx, d.cy + d.r * BAYAN_SYAHI.dy, d.r * BAYAN_SYAHI.r, 0, 2 * Math.PI);
  } else {
    g.arc(d.cx, d.cy, d.r, 0, 2 * Math.PI);
  }
}

// ---------- The instrument ----------

export function screenTabla({ onStroke } = {}) {
  loadRecordings();
  const canvas = h('canvas', { class: 'st-canvas', tabindex: '0', role: 'application', 'aria-label': t('st.label') });
  const g = canvas.getContext('2d');
  const prompt = h('div', { class: 'st-prompt', 'aria-live': 'polite' });
  const fullBtn = h('button', { class: 'btn btn-sm st-full-btn', type: 'button', onClick: () => setFull(!full) }, `⛶ ${t('st.full')}`);
  const el = h('div', { class: 'st' }, h('div', { class: 'st-bar' }, prompt, fullBtn), canvas);

  let W = 0;
  let H = 0;
  let layout = drumLayout(1, 1);
  let names = true;
  let full = false;
  let art = null;           // the drums drawn once per size
  const fx = [];            // { drum, zone, x, y, at } glows and ripples
  const held = new Map();   // pointer id → { x, y }
  let shown = null;         // { bol, at } the last stroke's name
  let frame = 0;

  const strokes = new TouchStrokes({
    play: (bol, velocity) => playBol(bol, getCtx().currentTime, velocity),
    report: (stroke) => {
      shown = { bol: stroke.parts.map(bolName).join(' + '), at: performance.now() };
      if (stroke.parts.length > 1) shown.bol = bolName(stroke.bol);
      animate();
      onStroke?.(stroke);
    },
  });

  function paintArt() {
    art = document.createElement('canvas');
    art.width = canvas.width;
    art.height = canvas.height;
    const a = art.getContext('2d');
    const dpr = canvas.width / W;
    a.scale(dpr, dpr);
    const floor = a.createLinearGradient(0, 0, 0, H);
    floor.addColorStop(0, '#3b2617');
    floor.addColorStop(1, '#1b1009');
    a.fillStyle = floor;
    a.fillRect(0, 0, W, H);
    a.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    a.lineWidth = 1;
    for (let y = 5; y < H; y += 9) {
      a.beginPath();
      a.moveTo(0, y);
      a.bezierCurveTo(W * 0.3, y + 4, W * 0.6, y - 4, W, y + 2);
      a.stroke();
    }
    drawBayan(a, layout.bayan);
    drawDayan(a, layout.dayan);
    if (names) drawNames(a, layout);
  }

  function resize() {
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    W = box.width;
    H = box.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    layout = drumLayout(W, H);
    paintArt();
    draw();
  }

  function draw() {
    if (!art) return;
    const now = performance.now();
    const dpr = canvas.width / W;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(art, 0, 0);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (let i = fx.length - 1; i >= 0; i--) {
      const f = fx[i];
      const age = now - f.at;
      if (age > RIPPLE_MS) { fx.splice(i, 1); continue; }
      const color = f.drum === 'dayan' ? '255, 214, 130' : '140, 195, 255';
      if (age < GLOW_MS) {
        g.save();
        glowPath(g, layout, f.drum, f.zone);
        g.fillStyle = `rgba(${color}, ${0.3 * (1 - age / GLOW_MS)})`;
        g.fill('evenodd');
        g.restore();
      }
      const r = layout[f.drum].r;
      g.beginPath();
      g.arc(f.x, f.y, r * (0.12 + 0.4 * (age / RIPPLE_MS)), 0, 2 * Math.PI);
      g.strokeStyle = `rgba(${color}, ${0.9 * (1 - age / RIPPLE_MS)})`;
      g.lineWidth = Math.max(2, r * 0.04);
      g.stroke();
    }
    for (const p of held.values()) {
      g.beginPath();
      g.arc(p.x, p.y, layout.dayan.r * 0.13, 0, 2 * Math.PI);
      g.fillStyle = 'rgba(255, 255, 255, 0.28)';
      g.fill();
    }
    if (shown && now - shown.at < NAME_MS) {
      const fade = 1 - (now - shown.at) / NAME_MS;
      g.font = `800 ${Math.round(Math.min(H * 0.13, W * 0.07))}px system-ui, sans-serif`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = `rgba(255, 244, 220, ${fade})`;
      g.shadowColor = 'rgba(0, 0, 0, 0.7)';
      g.shadowBlur = 6;
      g.fillText(shown.bol, W * 0.51, H > W * 1.15 ? H * 0.07 : H * 0.1);
      g.shadowBlur = 0;
    }
    const busy = fx.length || held.size || (shown && now - shown.at < NAME_MS);
    frame = busy ? requestAnimationFrame(draw) : 0;
  }

  const animate = () => { if (!frame) frame = requestAnimationFrame(draw); };

  // How hard a touch was, where the screen can tell (pressure, or how much
  // finger touches the glass); a palm is far bigger than a fingertip.
  let usual = 0;
  function measure(e) {
    const size = Math.max(e.width || 0, e.height || 0);
    const palm = usual > 2 && size > 2.2 * usual;
    if (size > 2 && !palm) usual = usual ? 0.9 * usual + 0.1 * size : size;
    if (e.pointerType === 'touch' && e.pressure > 0 && e.pressure !== 0.5 && e.pressure !== 1) return { velocity: clamp(0.45 + 0.7 * e.pressure, 0.5, 1.15), palm };
    if (size > 2 && usual) return { velocity: clamp(0.55 + 0.45 * (size / usual), 0.55, 1.15), palm };
    return { velocity: 0.85 + 0.1 * Math.random(), palm };
  }

  const local = (e) => {
    const box = canvas.getBoundingClientRect();
    return { x: e.clientX - box.left, y: e.clientY - box.top };
  };

  function press(id, where, x, y, how) {
    const d = layout[where.drum];
    strokes.down(id, where, { ...how, y, radius: d.r, time: getCtx().currentTime });
    if (where.zone !== 'heel') fx.push({ ...where, x, y, at: performance.now() });
    held.set(id, { x, y });
    animate();
  }

  canvas.addEventListener('pointerdown', (e) => {
    const p = local(e);
    const where = zoneAt(layout, p.x, p.y);
    if (!where) return;
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch { /* not supported */ }
    press(e.pointerId, where, p.x, p.y, measure(e));
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!held.has(e.pointerId)) return;
    const p = local(e);
    held.set(e.pointerId, p);
    strokes.move(e.pointerId, p.y);
    animate();
  });
  const lift = (e) => {
    if (!held.delete(e.pointerId)) return;
    strokes.up(e.pointerId);
    animate();
  };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((type) => canvas.addEventListener(type, lift));
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // The keyboard, on a computer.
  const keyDown = (e) => {
    const key = e.key.toLowerCase();
    if (!KEYS[key] || e.repeat || e.ctrlKey || e.metaKey || e.altKey || !el.isConnected || el.closest('[hidden]')) return;
    if (/^(input|select|textarea)$/i.test(e.target.tagName)) return;
    e.preventDefault();
    const [drum, zone, fingers = 1] = KEYS[key];
    const d = layout[drum];
    const y = zone === 'syahi' && drum === 'bayan' ? d.cy + d.r * BAYAN_SYAHI.dy : zone === 'kinar' ? d.cy - d.r * 0.92 : zone === 'sur' ? d.cy - d.r * 0.6 : zone === 'maidan' ? d.cy - d.r * 0.5 : d.cy;
    for (let k = 0; k < fingers; k++) press(`key:${key}:${k}`, { drum, zone }, d.cx + k * d.r * 0.1, y, { velocity: 0.9 });
  };
  const keyUp = (e) => {
    const key = e.key.toLowerCase();
    if (!KEYS[key]) return;
    for (let k = 0; k < 2; k++) { if (held.delete(`key:${key}:${k}`)) strokes.up(`key:${key}:${k}`); }
    animate();
  };
  document.addEventListener('keydown', keyDown);
  document.addEventListener('keyup', keyUp);

  // Full screen: the whole screen becomes the tabla (turned sideways where
  // the phone allows it).
  async function setFull(on) {
    full = on;
    el.classList.toggle('st-is-full', on);
    document.documentElement.classList.toggle('st-lock', on);
    fullBtn.textContent = on ? '✕' : `⛶ ${t('st.full')}`;
    fullBtn.setAttribute('aria-label', on ? t('st.exitFull') : t('st.full'));
    if (on) {
      try { await el.requestFullscreen?.({ navigationUI: 'hide' }); } catch { /* the page still fills the screen */ }
      try { await screen.orientation?.lock?.('landscape'); } catch { /* not allowed here */ }
    } else {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      try { screen.orientation?.unlock?.(); } catch { /* not supported */ }
    }
    requestAnimationFrame(resize);
  }
  const onFullChange = () => { if (!document.fullscreenElement && full) setFull(false); };
  document.addEventListener('fullscreenchange', onFullChange);

  const observer = new ResizeObserver(() => resize());
  observer.observe(canvas);

  return {
    el,
    setPrompt(text) { prompt.textContent = text || ''; },
    setNames(on) { names = on; if (W) { paintArt(); draw(); } },
    destroy() {
      observer.disconnect();
      document.removeEventListener('keydown', keyDown);
      document.removeEventListener('keyup', keyUp);
      document.removeEventListener('fullscreenchange', onFullChange);
      if (full) setFull(false);
      cancelAnimationFrame(frame);
    },
  };
}
