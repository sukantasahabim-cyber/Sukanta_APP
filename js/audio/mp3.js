// MP3 files, made on the device with the bundled LAME encoder (loaded only
// when the first MP3 is made). Encoding yields to the page now and then so a
// long song does not freeze it.

const FRAME = 1152;               // samples per MP3 frame
const FRAMES_PER_SLICE = 200;     // about 5 seconds of audio between pauses

const toInt16 = (f) => {
  const out = new Int16Array(f.length);
  for (let i = 0; i < f.length; i++) {
    const s = Math.max(-1, Math.min(1, f[i]));
    out[i] = s < 0 ? s * 32768 : s * 32767;
  }
  return out;
};

// One or two channels of float samples → MP3 bytes.
export async function mp3Bytes(channels, sampleRate, kbps = 160) {
  const { Mp3Encoder } = await import('../vendor/lamejs.js');
  const enc = new Mp3Encoder(channels.length, sampleRate, kbps);
  const [left, right] = channels.map(toInt16);
  const parts = [];
  for (let i = 0, n = 0; i < left.length; i += FRAME, n++) {
    const chunk = right
      ? enc.encodeBuffer(left.subarray(i, i + FRAME), right.subarray(i, i + FRAME))
      : enc.encodeBuffer(left.subarray(i, i + FRAME));
    if (chunk.length) parts.push(chunk);
    if (n % FRAMES_PER_SLICE === FRAMES_PER_SLICE - 1) await new Promise((r) => setTimeout(r, 0));
  }
  const tail = enc.flush();
  if (tail.length) parts.push(tail);
  const bytes = new Uint8Array(parts.reduce((a, p) => a + p.length, 0));
  let o = 0;
  for (const p of parts) { bytes.set(p, o); o += p.length; }
  return bytes;
}
