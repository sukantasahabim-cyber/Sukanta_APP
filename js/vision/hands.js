// The camera and the hand tracker (Google MediaPipe Hand Landmarker). It runs
// on the device: no picture leaves it. Its files are large (about 19 MB), so
// they are fetched only when the camera is first used; the service worker
// then keeps them for offline use.
import { t } from '../i18n/i18n.js';

const BASE = new URL('../../vision/', import.meta.url);
const FILES = {
  bundle: new URL('tasks-vision-0.10.35/vision_bundle.js', BASE).href,
  loader: new URL('tasks-vision-0.10.35/wasm/vision_wasm_internal.js', BASE).href,
  wasm: new URL('tasks-vision-0.10.35/wasm/vision_wasm_internal.wasm', BASE).href,
  model: new URL('hand_landmarker-float16-v1.task', BASE).href,
};
const SIZES = { wasm: 11153617, model: 7819105 };
export const DOWNLOAD_MB = Math.round((SIZES.wasm + SIZES.model) / 1e6);

// Errors carry a translation key in `code`.
const fail = (code) => Object.assign(new Error(code), { code });

export function cameraErrorMessage(err) {
  if (err?.name === 'NotAllowedError') return t('cam.denied');
  if (err?.name === 'NotFoundError' || err?.name === 'OverconstrainedError') return t('cam.notFound');
  if (err?.name === 'NotReadableError') return t('cam.busy');
  if (err?.code) return t(err.code);
  return t('cam.failed');
}

// The tracker needs WebAssembly with SIMD (every browser since 2021–2023).
const SIMD_TEST = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]);
const simd = () => WebAssembly.instantiate(SIMD_TEST).then(() => true, () => false);

async function download(url, onBytes) {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw fail('cam.download');
  const reader = res.body.getReader();
  const parts = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parts.push(value);
    onBytes(value.length);
  }
  return new Blob(parts);
}

let loading = null;

// Loads the tracker once. onProgress(share 0–1) while its files download.
export function loadHandTracker(onProgress = () => {}) {
  loading ??= (async () => {
    if (typeof WebAssembly !== 'object' || !(await simd())) throw fail('cam.tooOld');
    let got = 0;
    const bytes = (n) => { got += n; onProgress(Math.min(1, got / (SIZES.wasm + SIZES.model))); };
    const [{ HandLandmarker }, wasm, modelFile] = await Promise.all([
      import(FILES.bundle),
      download(FILES.wasm, bytes),
      download(FILES.model, bytes),
    ]);
    const model = new Uint8Array(await modelFile.arrayBuffer());
    const fileset = {
      wasmLoaderPath: FILES.loader,
      wasmBinaryPath: URL.createObjectURL(new Blob([wasm], { type: 'application/wasm' })),
    };
    const options = (delegate) => ({
      baseOptions: { modelAssetBuffer: model.slice(), delegate },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    // The graphics chip is much faster; not every device lets a page use it.
    try {
      return await HandLandmarker.createFromOptions(fileset, options('GPU'));
    } catch {
      return HandLandmarker.createFromOptions(fileset, options('CPU'));
    }
  })();
  loading.catch(() => { loading = null; });
  return loading;
}

// Opens the front camera and tracks hands in every new frame:
// onFrame({ time, aspect, hands: [{ points, label }] }, video), where time is
// when the frame was taken (performance.now() ms) and points are 21 [x, y, z]
// per hand. Returns { video, stop(), fps() }.
export async function startHandCamera({ onFrame, onProgress }) {
  if (!navigator.mediaDevices?.getUserMedia) throw fail('cam.unsupported');
  const tracker = await loadHandTracker(onProgress);
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 60 } },
  });
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.srcObject = stream;
  let running = true;
  const stop = () => {
    running = false;
    stream.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
  };
  try {
    await video.play();
  } catch (err) {
    stop();
    throw err;
  }
  let last = -1;
  let lastMedia = -1;
  const times = [];
  const step = (now, meta) => {
    if (!running) return;
    // Without frame callbacks, skip repaints that show no new frame.
    if (meta || video.currentTime !== lastMedia) {
      lastMedia = video.currentTime;
      // When the frame was taken. Browsers that do not say are guessed to
      // show a frame about 40 ms after taking it; the rest is learned.
      const time = meta?.captureTime || (meta?.presentationTime ?? now) - 40;
      const stamp = Math.max(last + 1, Math.round(time));
      last = stamp;
      try {
        if (video.videoWidth) {
          const res = tracker.detectForVideo(video, stamp);
          times.push(now);
          while (times.length > 30) times.shift();
          onFrame({
            time,
            aspect: video.videoWidth / video.videoHeight,
            hands: res.landmarks.map((pts, i) => ({
              points: pts.map((p) => [p.x, p.y, p.z]),
              label: res.handedness[i]?.[0]?.categoryName || null,
            })),
          }, video);
        }
      } catch (err) {
        console.error(err);
      }
    }
    next();
  };
  const next = () => {
    if (!running) return;
    if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(step);
    else requestAnimationFrame((now) => step(now, null));
  };
  next();
  return {
    video,
    stop,
    // Frames tracked per second, lately.
    fps: () => (times.length > 1 ? Math.round((1000 * (times.length - 1)) / (times[times.length - 1] - times[0])) : 0),
  };
}
