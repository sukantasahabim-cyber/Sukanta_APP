// Recorded tabla strokes: public-domain (CC0) recordings by freesound.org user
// dio_333, as bundled with Sonic Pi (see licenses/). They load the first time
// tabla is played; until then (or if they cannot load) tabla.js synthesizes
// the strokes instead.
import { getCtx, out } from './engine.js';

const BASE = new URL('../../sounds/tabla/', import.meta.url);
// Each basic stroke and its recordings; one is picked at random each time,
// as no two real strokes sound quite alike.
export const RECORDINGS = {
  na: ['na'],
  tin: ['tin1', 'tin2'],
  tu: ['tun1', 'tun2', 'tun3'],
  ti: ['te1', 'te2', 'te3'],
  ra: ['re'],
  ge: ['ge1', 'ge2'],
  ke: ['ke1', 'ke2', 'ke3'],
};
export const FILE_NAMES = [...new Set(Object.values(RECORDINGS).flat())];
// The dayan in the recordings is tuned to about 280 Hz (its Sa).
export const RECORDED_SA = 280;
// How loud each stroke sits next to the others.
const LEVEL = { na: 0.8, tin: 0.75, tu: 0.85, ti: 0.8, ra: 0.75, ge: 1, ke: 0.85 };

const buffers = {};   // name → { buffer, start (s of silence to skip) }
let loading = null;

export const recordingsReady = () => FILE_NAMES.every((n) => buffers[n]);

// Where the stroke begins: MP3 files can start with a few ms of silence.
function firstSound(buffer) {
  const d = buffer.getChannelData(0);
  let peak = 0;
  for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]));
  const at = d.findIndex((v) => Math.abs(v) > 0.02 * peak);
  return Math.max(0, at / buffer.sampleRate - 0.001);
}

// Starts loading the recordings (once). Resolves to true when they are ready.
// They are decoded in an offline context, so the page's sound does not have
// to start before the learner taps anything.
export function loadRecordings() {
  if (typeof OfflineAudioContext === 'undefined') return Promise.resolve(false);
  loading ??= (() => {
    const decoder = new OfflineAudioContext(1, 1, 44100);
    return Promise.all(FILE_NAMES.map(async (name) => {
      const res = await fetch(new URL(`${name}.mp3`, BASE));
      if (!res.ok) throw new Error(`${name}: ${res.status}`);
      const buffer = await decoder.decodeAudioData(await res.arrayBuffer());
      buffers[name] = { buffer, start: firstSound(buffer) };
    })).then(() => true, (err) => {
      console.warn('Tabla recordings unavailable, using synthesized strokes', err);
      return false;
    });
  })();
  return loading;
}

// Plays one basic stroke (na, tin, tu, ti, ra, ge, ke) at `time`. `rate`
// retunes it (1 = as recorded). Returns a voice that can be damped (a finger
// left on the skin) or bent in pitch (the bayan), or null if the recordings
// are not ready.
export function playRecording(stroke, time, velocity = 1, rate = 1) {
  const names = RECORDINGS[stroke];
  if (!names || !recordingsReady()) return null;
  const { buffer, start } = buffers[names[Math.floor(Math.random() * names.length)]];
  const c = getCtx();
  const src = c.createBufferSource();
  src.buffer = buffer;
  src.playbackRate.value = rate;
  const gain = c.createGain();
  gain.gain.value = LEVEL[stroke] * Math.max(0.05, velocity) ** 1.3;
  src.connect(gain).connect(out());
  src.start(time, start);
  return {
    stroke,
    // Stops the ringing quickly, as a finger pressed on the skin does.
    damp(at = getCtx().currentTime, quick = 0.02) {
      gain.gain.cancelScheduledValues(at);
      gain.gain.setValueAtTime(gain.gain.value, at);
      gain.gain.setTargetAtTime(0, at, quick);
      try { src.stop(at + quick * 8); } catch { /* already stopped */ }
    },
    // Glides the pitch to `to` times the recorded pitch.
    bend(to, at = getCtx().currentTime) {
      src.playbackRate.setTargetAtTime(rate * to, at, 0.03);
    },
  };
}
