// A YouTube video in YouTube's own embedded player, controlled through the
// official IFrame Player API so SurTaal can start, pause and line the video up
// with a recording of the singer. The video's sound never passes through
// SurTaal. If the API cannot load, the plain embed is shown instead and the
// learner uses the video's own controls.
import { h } from '../ui/dom.js';
import { embedUrl } from '../data/youtube.js';

const API_URL = 'https://www.youtube.com/iframe_api';
const API_TIMEOUT = 8000;
export const PLAYING = 1;

let api = null;
function loadApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  api ??= new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT); };
    const s = document.createElement('script');
    s.src = API_URL;
    s.async = true;
    s.onerror = () => { api = null; reject(new Error('YouTube API unavailable')); };
    document.head.append(s);
  });
  return api;
}

const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

// Returns { el, controllable, play(), pause(), seek(s), time(), state(),
// onState(fn) → unsubscribe, destroy() }. `ready` resolves once controls work
// (true) or the plain embed is used (false).
export function youtubePlayer(id, title) {
  const el = h('div', { class: 'yt-player' });
  const mount = h('div');
  el.append(mount);
  const listeners = new Set();
  let player = null;
  let gone = false;

  const fallback = () => {
    if (gone) return;
    player = null;
    el.replaceChildren(h('iframe', {
      src: embedUrl(id), title, loading: 'lazy',
      allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen', allowfullscreen: true, referrerpolicy: 'strict-origin-when-cross-origin',
    }));
  };

  const ready = Promise.race([
    loadApi().then((YT) => new Promise((resolve, reject) => {
      if (gone) { reject(new Error('gone')); return; }
      player = new YT.Player(mount, {
        videoId: id,
        host: 'https://www.youtube-nocookie.com',
        playerVars: { rel: 0, playsinline: 1, modestbranding: 1, origin: location.origin },
        events: {
          onReady: () => { player.getIframe?.()?.setAttribute('title', title); resolve(); },
          onStateChange: (e) => listeners.forEach((fn) => fn(e.data)),
          onError: () => reject(new Error('player error')),
        },
      });
    })),
    timeout(API_TIMEOUT),
  ]).then(() => !gone, () => { try { player?.destroy?.(); } catch { /* ignore */ } fallback(); return false; });

  const ctl = {
    el,
    ready,
    get controllable() { return Boolean(player?.playVideo) && !gone; },
    play() { player?.playVideo?.(); },
    pause() { player?.pauseVideo?.(); },
    seek(s) { player?.seekTo?.(s, true); },
    time() { return player?.getCurrentTime?.() ?? 0; },
    state() { return player?.getPlayerState?.() ?? -1; },
    onState(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    destroy() {
      gone = true;
      listeners.clear();
      try { player?.destroy?.(); } catch { /* ignore */ }
      player = null;
    },
  };
  return ctl;
}
