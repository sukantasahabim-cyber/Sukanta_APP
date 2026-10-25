import { getCtx } from './engine.js';
import { detectPitch } from './pitch.js';

// Listens to the microphone and reports a smoothed pitch (Hz, or -1) every frame.
// Resolves to a stop() function.
export async function listenPitch(onPitch) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('This browser cannot use the microphone. Try Chrome, Edge, Firefox or Safari over https.');
  }
  const ctx = getCtx();
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  });
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);
  const buf = new Float32Array(analyser.fftSize);
  const recent = [];
  let raf = 0;
  let active = true;

  const loop = () => {
    if (!active) return;
    analyser.getFloatTimeDomainData(buf);
    const f = detectPitch(buf, ctx.sampleRate);
    if (f > 0) {
      recent.push(f);
      if (recent.length > 5) recent.shift();
      const sorted = [...recent].sort((a, b) => a - b);
      onPitch(sorted[sorted.length >> 1]);
    } else {
      recent.length = 0;
      onPitch(-1);
    }
    raf = requestAnimationFrame(loop);
  };
  loop();

  return () => {
    active = false;
    cancelAnimationFrame(raf);
    stream.getTracks().forEach((t) => t.stop());
    source.disconnect();
  };
}

export function micErrorMessage(err) {
  if (err?.name === 'NotAllowedError') return 'Microphone permission was denied. Allow microphone access in your browser settings and try again.';
  if (err?.name === 'NotFoundError') return 'No microphone was found on this device.';
  return err?.message || 'Could not start the microphone.';
}
