// Timing for the "Watch demo" animations in practical exercises. Times are in
// seconds from the start of the demo.
import { tokenize, parseSwara } from '../music.js';

export const COUNT_IN = 4;
const NOTE_GAP = 0.7;   // same spacing as the exercises' "Hear it"

// A tabla exercise: four count-in clicks, then one event per bol slot.
export function tablaDemo(ex, speed = 1) {
  const tokens = tokenize(ex.bols);
  const perBeat = ex.perBeat || 1;
  const beat = 60 / ((ex.bpm || 60) * speed);
  const slot = beat / perBeat;
  const start = COUNT_IN * beat;
  return {
    beat,
    start,
    clicks: Array.from({ length: COUNT_IN }, (_, i) => i * beat),
    events: tokens.map((bol, k) => ({ k, bol, time: start + k * slot })),
    duration: start + tokens.length * slot + beat,
  };
}

// A singing exercise: the notes the guide sings, as semitones above Sa.
// `path` is the pitch line to draw ([{ t, semi }]); `notes` what to play.
export function voiceDemo(ex, speed = 1) {
  const gap = NOTE_GAP / speed;
  if (ex.type === 'sing') {
    const sws = tokenize(ex.notes).map(parseSwara).filter(Boolean);
    const notes = sws.map((sw, i) => ({ t: i * gap, dur: gap * 0.88, semi: sw.semitone }));
    return { notes, glide: null, targets: [...new Set(notes.map((n) => n.semi))], duration: sws.length * gap + 0.4 };
  }
  if (ex.type === 'hold') {
    const semi = ex.note ? parseSwara(ex.note).semitone : 0;
    const dur = Math.min(ex.seconds || 3, 5);
    return { notes: [{ t: 0, dur, semi }], glide: null, targets: [semi], duration: dur + 0.4 };
  }
  // range: one smooth siren from lower Pa up to Dha and back.
  const half = Math.min((ex.seconds || 8) / 2, 4) / speed;
  const glide = [{ t: 0, semi: -5 }, { t: half, semi: 9 }, { t: 2 * half, semi: -5 }];
  return { notes: [], glide, targets: [], duration: 2 * half + 0.4 };
}

// Pitch (semitones above Sa) of the demo voice at time `time`, or null when silent.
export function demoPitchAt(plan, time) {
  if (plan.glide) {
    const g = plan.glide;
    if (time < g[0].t || time > g[g.length - 1].t) return null;
    for (let i = 1; i < g.length; i++) {
      if (time <= g[i].t) {
        const p = (time - g[i - 1].t) / (g[i].t - g[i - 1].t);
        return g[i - 1].semi + p * (g[i].semi - g[i - 1].semi);
      }
    }
    return null;
  }
  const n = plan.notes.find((x) => time >= x.t && time <= x.t + x.dur);
  return n ? n.semi : null;
}
