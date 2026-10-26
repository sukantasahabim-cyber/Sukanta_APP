// Shared AudioContext plus small building blocks used by every synth.

let ctx = null;
let master = null;
let noiseBuf = null;

let offline = false;   // true while renderOffline() points the synths at an offline context

function masterFor(c) {
  const m = c.createGain();
  m.gain.value = 0.7;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.ratio.value = 4;
  m.connect(comp);
  comp.connect(c.destination);
  return m;
}

export function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC({ latencyHint: 'interactive' });
    master = masterFor(ctx);
  }
  if (!offline && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Renders whatever fn(ctx) schedules into an AudioBuffer, faster than real
// time. Every synth reaches its context through getCtx() and out(), so while
// fn runs (synchronously) they all play into the offline context instead.
export function renderOffline(seconds, fn, sampleRate = 44100) {
  const off = new OfflineAudioContext(2, Math.ceil(seconds * sampleRate), sampleRate);
  const live = [ctx, master];
  ctx = off;
  master = masterFor(off);
  offline = true;
  try {
    fn(off);
  } finally {
    [ctx, master] = live;
    offline = false;
  }
  return off.startRendering();
}

export function out() {
  getCtx();
  return master;
}

function noise(c) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, Math.floor(c.sampleRate * 0.6), c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

function envelope(c, t, peak, attack, decay) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  return g;
}

// A decaying sine (or other waveform) partial, optionally gliding in pitch.
export function toneHit(t, { freq, gain = 0.3, decay = 0.5, attack = 0.003, type = 'sine', bendTo, bendTime = 0.12, dest = out() }) {
  const c = getCtx();
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (bendTo) o.frequency.exponentialRampToValueAtTime(bendTo, t + bendTime);
  const g = envelope(c, t, gain, attack, decay);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + attack + decay + 0.05);
}

// A filtered noise burst: strike transients, claps, slaps.
export function noiseHit(t, { freq = 1000, q = 1, type = 'bandpass', gain = 0.3, decay = 0.05, attack = 0.002, dest = out() }) {
  const c = getCtx();
  const src = c.createBufferSource();
  src.buffer = noise(c);
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = envelope(c, t, gain, attack, decay);
  src.connect(f).connect(g).connect(dest);
  src.start(t, Math.random() * 0.3);
  src.stop(t + attack + decay + 0.05);
}

// Metronome click.
export function click(t, accent = false, level = 1) {
  toneHit(t, { freq: accent ? 1760 : 1100, gain: (accent ? 0.35 : 0.2) * level, decay: 0.03, type: 'triangle' });
}

// Pleasant two-note chime for success moments.
export function chime() {
  const t = getCtx().currentTime + 0.02;
  toneHit(t, { freq: 880, gain: 0.2, decay: 0.6 });
  toneHit(t + 0.12, { freq: 1318.5, gain: 0.2, decay: 0.8 });
}
