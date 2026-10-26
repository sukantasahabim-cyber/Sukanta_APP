// Plays Music Studio compositions: live (looping) or rendered to audio.
import { getCtx, renderOffline } from './engine.js';
import { Looper } from './looper.js';
import { playBol } from './tabla.js';
import { tanpuraDrone, createTanpura } from './voice.js';
import { playInstrument } from './instruments.js';
import { STEPS_PER_BEAT, TRACKS, DRUM_ROWS, totalSteps, thekaBeat } from '../data/compose.js';

const stepDur = (c) => 60 / c.bpm / STEPS_PER_BEAT;

// Schedules every sound of step `step` (0-based inside the loop). `beat` is the
// absolute beat count since playing started, so a theka keeps its own cycle.
function playStep(c, step, beat, time, saMidi, muted = {}) {
  const sd = stepDur(c);
  for (const key of TRACKS) {
    const track = c.tracks[key];
    if (muted[key] || !track.volume) continue;
    for (const n of track.notes) {
      if (n.s === step) playInstrument(track.instrument, saMidi + n.p, time, n.l * sd * 0.95, track.volume);
    }
  }
  const r = c.rhythm;
  if (muted.rhythm || !r.volume) return;
  if (r.mode === 'theka' && step % STEPS_PER_BEAT === 0) {
    for (const { bol, at } of thekaBeat(r.taal, beat)) playBol(bol, time + at * sd * STEPS_PER_BEAT, 0.8 * r.volume);
  } else if (r.mode === 'grid') {
    for (const bol of DRUM_ROWS) if (r.grid[bol]?.includes(step)) playBol(bol, time, 0.8 * r.volume);
  }
}

// Live player. `get()` returns the composition as it is now, so edits are
// heard on the next loop; onStep(step) marks the playhead.
export function createPlayer({ get, saMidi, onStep, muted = () => ({}) }) {
  let looper = null;
  let tanpura = null;
  let beat = 0;
  return {
    get playing() { return Boolean(looper); },
    start() {
      if (looper) return;
      beat = 0;
      looper = new Looper({
        length: () => totalSteps(get()),
        duration: () => stepDur(get()),
        play: (i, t) => {
          const c = get();
          if (i % STEPS_PER_BEAT === 0 && !(i === 0 && beat === 0)) beat++;
          playStep(c, i, beat, t, saMidi(), muted());
        },
        onStep,
      });
      looper.start();
      if (get().tanpura) { tanpura = createTanpura(); tanpura.start(); }
    },
    stop() {
      looper?.stop();
      looper = null;
      tanpura?.stop();
      tanpura = null;
    },
  };
}

// Renders the composition `repeats` times into an AudioBuffer.
export function renderComposition(c, { saMidi, repeats = 2 }) {
  const sd = stepDur(c);
  const steps = totalSteps(c);
  const seconds = steps * repeats * sd + 2.5;
  return renderOffline(seconds, () => {
    if (c.tanpura) tanpuraDrone(0, seconds - 2.5, saMidi, 0.6);
    let beat = 0;
    for (let r = 0; r < repeats; r++) {
      for (let i = 0; i < steps; i++) {
        if (i % STEPS_PER_BEAT === 0 && (r || i)) beat++;
        playStep(c, i, beat, (r * steps + i) * sd + 0.05, saMidi);
      }
    }
  });
}
