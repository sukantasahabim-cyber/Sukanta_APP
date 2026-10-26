import { mp3Bytes } from './mp3.js';

// Full-length recordings of the singer, and mixing them on this device with a
// backing track — optionally with the original singer filtered out — to hear
// again or save as an MP3 file.

// Keeps every sample heard (as 16-bit, to save memory) up to maxSeconds.
export class TakeRecorder {
  constructor(sampleRate, maxSeconds = 900) {
    this.sampleRate = sampleRate;
    this.max = Math.round(sampleRate * maxSeconds);
    this.chunks = [];
    this.length = 0;
  }

  push(chunk) {
    const n = Math.min(chunk.length, this.max - this.length);
    if (n <= 0) return;
    const c = new Int16Array(n);
    for (let i = 0; i < n; i++) c[i] = Math.max(-1, Math.min(1, chunk[i])) * 32767;
    this.chunks.push(c);
    this.length += n;
  }

  // The whole take as floats, scaled so its loudest moment sits at `peak`.
  samples(peak = 0.9) {
    const out = new Float32Array(this.length);
    let o = 0;
    let max = 0;
    for (const c of this.chunks) {
      for (let i = 0; i < c.length; i++) {
        const v = c[i] / 32767;
        out[o++] = v;
        if (Math.abs(v) > max) max = Math.abs(v);
      }
    }
    if (max > 0.001) {
      const k = peak / max;
      for (let i = 0; i < out.length; i++) out[i] *= k;
    }
    return out;
  }
}

// Where the backing track must play under a take. `segments` list each time
// the track (re)started during the take: { since: when it started, in
// AudioContext time; startedAt: the context time its position 0 would have
// played }. `voiceStart` is the context time the take's first sample was sung.
// Returns [{ at, offset, until }]: from `at` to `until` seconds into the take,
// play the track from `offset` seconds.
export function trackPlan(segments, voiceStart, duration) {
  const plan = [];
  segments.forEach((seg, i) => {
    const next = segments[i + 1];
    const at = Math.max(seg.since - voiceStart, 0);
    const until = next ? Math.min(next.since - voiceStart, duration) : duration;
    if (until > at) plan.push({ at, offset: Math.max(0, voiceStart + at - seg.startedAt), until });
  });
  return plan;
}

// The music path. With `reduce`, the original singer is filtered out: a lead
// voice is usually mixed equally into both channels, so left minus right
// cancels it while instruments panned to the sides stay. That also cancels the
// bass and kick drum (they sit in the centre too), so the low end of the
// centre is added back.
export function musicChain(ctx, { reduce = false, channels = 2 } = {}) {
  const input = ctx.createGain();
  const output = ctx.createGain();
  if (!reduce || channels < 2) {
    input.connect(output);
    return { input, output };
  }
  const split = ctx.createChannelSplitter(2);
  input.connect(split);
  const side = ctx.createGain();
  const invert = ctx.createGain();
  invert.gain.value = -1;
  split.connect(side, 0);
  split.connect(invert, 1).connect(side);
  side.connect(output);
  const mid = ctx.createGain();
  mid.gain.value = 0.5;
  split.connect(mid, 0);
  split.connect(mid, 1);
  // A steep cut, so a low male voice in the centre does not come back with the bass.
  let low = mid;
  for (let i = 0; i < 3; i++) {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 110;
    f.Q.value = Math.SQRT1_2;
    low = low.connect(f);
  }
  low.connect(output);
  return { input, output };
}

// A soft room echo, made from decaying noise.
function reverbNode(ctx) {
  const seconds = 1.6;
  const len = Math.round(ctx.sampleRate * seconds);
  const ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  }
  const conv = ctx.createConvolver();
  conv.buffer = ir;
  return conv;
}

// Schedules the voice (and, if given, the music under it) on any context —
// live or offline. Returns a function that stops everything.
//   voice: Float32Array; sampleRate; voiceOffset: seconds into the take to start from
//   track: AudioBuffer; plan: from trackPlan; reduce: filter the original singer
export function scheduleMix(ctx, dest, {
  voice, sampleRate, voiceGain = 1, reverb = false, voiceOffset = 0,
  track = null, plan = [], reduce = false, musicGain = 0.8,
}, when) {
  const sources = [];
  const nodes = [];
  const keep = (n) => { nodes.push(n); return n; };
  const bus = keep(ctx.createGain());
  const limiter = keep(ctx.createDynamicsCompressor());
  limiter.threshold.value = -6;
  limiter.ratio.value = 12;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.15;
  bus.connect(limiter).connect(dest);

  if (voice?.length) {
    const buf = ctx.createBuffer(1, voice.length, sampleRate);
    buf.copyToChannel(voice, 0);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const rumble = keep(ctx.createBiquadFilter());
    rumble.type = 'highpass';
    rumble.frequency.value = 80;
    const even = keep(ctx.createDynamicsCompressor());
    even.threshold.value = -24;
    even.ratio.value = 3;
    const gain = keep(ctx.createGain());
    gain.gain.value = voiceGain;
    src.connect(rumble).connect(even).connect(gain).connect(bus);
    if (reverb) {
      const wet = keep(ctx.createGain());
      wet.gain.value = 0.22;
      gain.connect(keep(reverbNode(ctx))).connect(wet).connect(bus);
    }
    src.start(when, Math.max(0, voiceOffset));
    sources.push(src);
  }

  if (track) {
    const chain = musicChain(ctx, { reduce, channels: track.numberOfChannels });
    nodes.push(chain.input, chain.output);
    const gain = keep(ctx.createGain());
    gain.gain.value = musicGain;
    chain.output.connect(gain).connect(bus);
    for (const p of plan) {
      if (p.until <= voiceOffset || p.offset >= track.duration) continue;
      const skip = Math.max(0, voiceOffset - p.at);
      const src = ctx.createBufferSource();
      src.buffer = track;
      src.connect(chain.input);
      src.start(when + Math.max(0, p.at - voiceOffset), p.offset + skip, p.until - p.at - skip);
      sources.push(src);
    }
  }

  return () => {
    sources.forEach((s) => { try { s.stop(); } catch { /* already stopped */ } });
    nodes.forEach((n) => n.disconnect());
  };
}

// Renders a mix to an AudioBuffer as fast as the device allows.
export function renderMix(opts) {
  const length = Math.max(1, opts.voice.length);
  const off = new OfflineAudioContext(2, length, opts.sampleRate);
  scheduleMix(off, off.destination, { ...opts, voiceOffset: 0 }, 0);
  return off.startRendering();
}

// A 16-bit PCM WAV file from one or more channels of samples.
export function wavBytes(channels, sampleRate) {
  const n = channels.length;
  const frames = channels[0]?.length || 0;
  const bytes = new Uint8Array(44 + frames * n * 2);
  const v = new DataView(bytes.buffer);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) bytes[o + i] = s.charCodeAt(i); };
  str(0, 'RIFF');
  v.setUint32(4, 36 + frames * n * 2, true);
  str(8, 'WAVE');
  str(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, n, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * n * 2, true);
  v.setUint16(32, n * 2, true);
  v.setUint16(34, 16, true);
  str(36, 'data');
  v.setUint32(40, frames * n * 2, true);
  let o = 44;
  for (let i = 0; i < frames; i++) {
    for (let ch = 0; ch < n; ch++) {
      const s = Math.max(-1, Math.min(1, channels[ch][i]));
      v.setInt16(o, s < 0 ? s * 32768 : s * 32767, true);
      o += 2;
    }
  }
  return bytes;
}

function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

// Saves audio as an MP3 file named `base`.mp3, or as WAV if MP3 cannot be made.
export async function saveAudio(channels, sampleRate, base) {
  try {
    const bytes = await mp3Bytes(channels, sampleRate);
    saveBlob(new Blob([bytes], { type: 'audio/mpeg' }), `${base}.mp3`);
  } catch {
    saveBlob(new Blob([wavBytes(channels, sampleRate)], { type: 'audio/wav' }), `${base}.wav`);
  }
}
