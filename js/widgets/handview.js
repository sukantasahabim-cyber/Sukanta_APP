// The camera picture, shown like a mirror when the camera faces the learner,
// with the drums to play on, each hand's bones and name, a letter on every
// fingertip, and a flash where each stroke lands.
import { h } from '../ui/dom.js';
import { t } from '../i18n/i18n.js';
import { HAND_LINES, TIPS, FINGERS, SIDES, RINGS } from '../analysis/handstrikes.js';

export const HAND_COLOR = { right: '#ff8a3d', left: '#38a3ff' };
const FLASH_MS = 700;

export function handView() {
  const canvas = h('canvas', { class: 'hand-view', width: 640, height: 480, role: 'img', 'aria-label': t('hc.viewLabel') });
  const g = canvas.getContext('2d');
  let flashes = [];
  let mirror = true;
  const unit = () => canvas.width / 30;
  const px = (p) => [(mirror ? 1 - p[0] : p[0]) * canvas.width, p[1] * canvas.height];

  function label(text, x, y, color, scale = 1) {
    const size = Math.round(unit() * scale);
    g.font = `600 ${size}px system-ui, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const w = g.measureText(text).width;
    g.fillStyle = 'rgba(0, 0, 0, 0.6)';
    g.beginPath();
    const box = [x - w / 2 - size * 0.3, y - size * 0.7, w + size * 0.6, size * 1.4];
    if (g.roundRect) g.roundRect(...box, size * 0.4); else g.rect(...box);
    g.fill();
    g.fillStyle = color;
    g.fillText(text, x, y + size * 0.05);
  }

  function drum(d, kind) {
    if (!d) return;
    const [cx, cy] = px([d.x, d.y]);
    const rx = d.rx * canvas.width;
    const ry = d.ry * canvas.height;
    const ring = (k, dy = 0) => { g.beginPath(); g.ellipse(cx, cy + dy * ry, rx * k, ry * k, 0, 0, 2 * Math.PI); };
    g.save();
    g.lineWidth = Math.max(2, canvas.width / 240);
    g.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ring(1);
    g.fillStyle = kind === 'dayan' ? 'rgba(245, 225, 185, 0.28)' : 'rgba(205, 205, 220, 0.24)';
    g.fill();
    g.stroke();
    if (kind === 'dayan') {
      g.setLineDash([canvas.width / 90, canvas.width / 90]);
      ring(RINGS.sur);
      g.stroke();
      g.setLineDash([]);
    }
    // The syahi: in the middle of the dayan, towards the learner on the bayan.
    ring(kind === 'dayan' ? RINGS.syahi : 0.38, kind === 'dayan' ? 0 : 0.25);
    g.fillStyle = 'rgba(25, 25, 35, 0.55)';
    g.fill();
    g.restore();
    // Named above the drum, where the hands do not cover it.
    label(t(`hc.${kind}`), cx, Math.max(unit() * 0.8, cy - ry - unit() * 0.7), '#fff', 0.75);
  }

  function hand(points, side) {
    const color = HAND_COLOR[side];
    const line = Math.max(2, canvas.width / 220);
    g.save();
    g.strokeStyle = color;
    g.lineWidth = line;
    g.globalAlpha = 0.85;
    g.beginPath();
    for (const [a, b] of HAND_LINES) {
      g.moveTo(...px(points[a]));
      g.lineTo(...px(points[b]));
    }
    g.stroke();
    g.restore();
    for (const f of FINGERS) {
      const [x, y] = px(points[TIPS[f]]);
      const r = unit() * 0.48;
      g.beginPath();
      g.arc(x, y, r, 0, 2 * Math.PI);
      g.fillStyle = color;
      g.fill();
      g.font = `700 ${Math.round(r * 1.25)}px system-ui, sans-serif`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = '#111';
      g.fillText(t(`hc.short.${f}`), x, y + r * 0.08);
    }
    const [wx, wy] = px(points[0]);
    label(t(`hc.hand.${side}`), wx, Math.min(canvas.height - unit(), wy + unit() * 1.3), color, 0.85);
  }

  return {
    el: canvas,

    // Draws one camera frame with the hands ({ right, left } points) and drums.
    draw(video, hands, drums) {
      if (video.videoWidth && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      g.save();
      if (mirror) { g.translate(canvas.width, 0); g.scale(-1, 1); }
      g.drawImage(video, 0, 0, canvas.width, canvas.height);
      g.restore();
      drum(drums?.bayan, 'bayan');
      drum(drums?.dayan, 'dayan');
      for (const side of SIDES) if (hands[side]) hand(hands[side], side);
      const now = performance.now();
      flashes = flashes.filter((f) => now < f.until);
      for (const f of flashes) {
        const fade = (f.until - now) / FLASH_MS;
        g.save();
        g.globalAlpha = fade;
        g.strokeStyle = HAND_COLOR[f.side];
        g.lineWidth = unit() * 0.25;
        for (const p of f.points) {
          const [x, y] = px(p);
          g.beginPath();
          g.arc(x, y, unit() * (0.8 + 0.8 * (1 - fade)), 0, 2 * Math.PI);
          g.stroke();
        }
        g.restore();
        if (f.text) {
          const [x, y] = px(f.points[0]);
          label(f.text, x, Math.max(unit(), y - unit() * 2), HAND_COLOR[f.side], 1.3);
        }
      }
    },

    // Mirror the picture (the camera faces the learner) or not.
    setMirror(on) { mirror = on; },

    // A stroke landed at these points (fingertips, or the palm), showing `text`.
    flash(points, text, side) {
      if (points.length) flashes.push({ points, text, side, until: performance.now() + FLASH_MS });
    },
  };
}
