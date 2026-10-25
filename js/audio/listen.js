// Listening sessions for practical exercises: captures raw audio (from the
// microphone, or any node for testing), keeps a rolling buffer and reports
// onsets and pitch readings with AudioContext timestamps.
import { getCtx } from './engine.js';
import { detectPitch } from './pitch.js';
import { OnsetDetector } from '../analysis/onsets.js';
import { store } from '../store.js';

// How easily the app reacts to sound. "quiet" suits a soft instrument or a far
// microphone; "noisy" ignores more background sound (fans, traffic, TV).
export const SENSITIVITY = {
  quiet: { label: 'Quiet room / soft playing', onsets: { rise: 2.5, floorRatio: 6, minEnergy: 5e-8 }, minRms: 0.004 },
  normal: { label: 'Normal', onsets: { rise: 3, floorRatio: 10, minEnergy: 2e-7 }, minRms: 0.01 },
  noisy: { label: 'Noisy room', onsets: { rise: 4, floorRatio: 16, minEnergy: 1e-6 }, minRms: 0.02 },
};
export const currentSensitivity = () => SENSITIVITY[store.setting('micSensitivity')] || SENSITIVITY.normal;

let workletReady = null;

async function captureNode(source, onChunk) {
  const ctx = getCtx();
  if (!ctx.audioWorklet) throw new Error('This browser cannot analyse live audio. Please use a recent Chrome, Edge, Firefox or Safari.');
  workletReady ??= ctx.audioWorklet.addModule(new URL('./capture-worklet.js', import.meta.url));
  await workletReady;
  const node = new AudioWorkletNode(ctx, 'surtaal-capture', { channelCount: 1, channelCountMode: 'explicit' });
  node.port.onmessage = (e) => onChunk(e.data.samples, e.data.time);
  // The worklet only runs while connected to the output, so feed it into silence.
  const sink = ctx.createGain();
  sink.gain.value = 0;
  source.connect(node);
  node.connect(sink).connect(ctx.destination);
  return () => {
    node.port.onmessage = null;
    try { source.disconnect(node); } catch { /* already disconnected */ }
    node.disconnect();
    sink.disconnect();
  };
}

async function captureMic(onChunk) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('This browser cannot use the microphone. Open the app over https in Chrome, Edge, Firefox or Safari.');
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  });
  const source = getCtx().createMediaStreamSource(stream);
  const stopNode = await captureNode(source, onChunk);
  return () => {
    stopNode();
    stream.getTracks().forEach((t) => t.stop());
  };
}

// Rolling sample buffer addressed by absolute sample index.
class Recording {
  constructor(sr, seconds = 30) {
    this.sr = sr;
    this.buf = new Float32Array(Math.round(sr * seconds));
    this.written = 0;
    this.t0 = null;
    this.tasks = [];
  }

  push(chunk, time) {
    this.t0 ??= time - this.written / this.sr;
    const size = this.buf.length;
    for (let i = 0; i < chunk.length; i++) this.buf[(this.written + i) % size] = chunk[i];
    this.written += chunk.length;
    const due = this.tasks.filter((t) => t.until <= this.written);
    this.tasks = this.tasks.filter((t) => t.until > this.written);
    due.forEach((t) => t.fn());
  }

  timeOf(index) { return this.t0 + index / this.sr; }

  slice(start, length) {
    const out = new Float32Array(length);
    const size = this.buf.length;
    for (let i = 0; i < length; i++) {
      const idx = start + i;
      if (idx >= 0 && idx < this.written && idx >= this.written - size) out[i] = this.buf[idx % size];
    }
    return out;
  }

  // Run fn once samples up to `until` have arrived.
  when(until, fn) {
    if (until <= this.written) fn();
    else this.tasks.push({ until, fn });
  }
}

const HOP = 1024;
const WINDOW = 2048;
const WARMUP = 0.3;  // seconds of onsets ignored when listening starts

// onOnset(index, time), onPitch(freq | -1, time) and onSamples(chunk) are optional.
export async function startListening({ onOnset, onPitch, onSamples, pitchRange = {}, source = null }) {
  const ctx = getCtx();
  const rec = new Recording(ctx.sampleRate);
  const sens = currentSensitivity();
  const onsets = onOnset ? new OnsetDetector(ctx.sampleRate, sens.onsets) : null;
  const pitchOpts = { minRms: sens.minRms, ...pitchRange };
  let mutedUntil = -Infinity;
  let pending = 0;

  const onChunk = (samples, time) => {
    rec.push(samples, time);
    onSamples?.(samples);
    if (onsets) {
      for (const idx of onsets.push(samples)) {
        const t = rec.timeOf(idx);
        // The first moments of listening can start mid-sound and look like a new hit.
        if (t >= mutedUntil && idx >= WARMUP * ctx.sampleRate) onOnset(idx, t);
      }
    }
    if (onPitch) {
      pending += samples.length;
      while (pending >= HOP) {
        pending -= HOP;
        const end = rec.written - pending;
        const t = rec.timeOf(end);
        const f = t < mutedUntil ? -1 : detectPitch(rec.slice(end - WINDOW, WINDOW), ctx.sampleRate, pitchOpts);
        onPitch(f, t);
      }
    }
  };

  const stop = source ? await captureNode(source, onChunk) : await captureMic(onChunk);
  return {
    rec,
    stop,
    // Ignore everything heard until AudioContext time t (e.g. while a reference note plays).
    muteUntil(t) { mutedUntil = Math.max(mutedUntil, t); },
    // Rough round-trip delay between scheduling a sound and hearing it back.
    latency: (ctx.outputLatency || 0) + (ctx.baseLatency || 0) + 0.02,
    // Everything heard so far (up to the buffer length), for playback.
    take() {
      const length = Math.min(rec.written, rec.buf.length);
      return { samples: rec.slice(rec.written - length, length), sampleRate: rec.sr };
    },
  };
}

// Plays back a recorded take. Returns a function that stops playback.
export function playTake({ samples, sampleRate }, onEnded) {
  const ctx = getCtx();
  const buf = ctx.createBuffer(1, samples.length, sampleRate);
  buf.copyToChannel(samples, 0);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(ctx.destination);
  src.onended = onEnded;
  src.start();
  return () => { try { src.stop(); } catch { /* already stopped */ } };
}

export function listenErrorMessage(err) {
  if (err?.name === 'NotAllowedError') return 'Microphone permission was denied. Allow microphone access in your browser settings and try again.';
  if (err?.name === 'NotFoundError') return 'No microphone was found on this device.';
  return err?.message || 'Could not start listening.';
}
