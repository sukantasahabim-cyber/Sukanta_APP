// Sing with your own track: play an audio file from this device (it is never
// uploaded), optionally filter out the original singer, and watch your voice
// on a live pitch line against the swaras of your Sa. Afterwards the singer
// can hear their recording, mix it with the music and save it as an MP3 file.
// With a YouTube video, the video plays in YouTube's own player and only the
// singer's voice is recorded.
import { h, toast } from '../ui/dom.js';
import { toggleButton, checkbox, swaraLabel } from '../ui/controls.js';
import { t } from '../i18n/i18n.js';
import { getCtx, out } from '../audio/engine.js';
import { startListening, listenErrorMessage } from '../audio/listen.js';
import { TakeRecorder, trackPlan, musicChain, scheduleMix, renderMix, saveAudio } from '../audio/takes.js';
import { freqToMidi, midiName, parseSwara } from '../music.js';
import { store } from '../store.js';
import { voiceStats } from '../analysis/singalong.js';
import { youtubeId, searchUrl } from '../data/youtube.js';
import { youtubePlayer, PLAYING } from '../widgets/ytplayer.js';
import { renderBacking } from '../audio/backing.js';
import { SONGS } from '../data/songs.js';
import { findSong, songText } from './singalong.js';
import { takePendingTrack } from '../audio/pending.js';

const VOICE_RANGE = { minFreq: 70, maxFreq: 1100 };
const WINDOW_SECONDS = 8;
const GRID = ['S', 'r', 'R', 'g', 'G', 'M', 'm', 'P', 'd', 'D', 'n', 'N', "S'"];


export function ownTrackView(scope) {
  let buffer = null;
  let fileName = '';
  let source = null;        // playing AudioBufferSourceNode
  let startedAt = 0;        // ctx time when position 0 would have played
  let offset = 0;           // seconds into the track where playback starts
  let reduceVocals = false;
  let volume = 0.8;
  let scoreOn = true;
  let session = null;
  let heard = [];
  let raf = 0;
  let practiceStart = 0;
  let mode = 'file';        // 'file' (a track on this device) or 'youtube' (embedded player)
  let videoId = null;
  let yt = null;            // the YouTube player
  // The recording: every sample sung, plus what is needed to line it up with the music.
  let recorder = null;
  let segments = [];        // each (re)start of the file during the take
  let anchor = null;        // { ctx, video }: a moment when the video was playing
  let take = null;
  let stopPlayback = null;  // stops whatever recording playback is running
  let voiceGain = 1;
  let shift = 0;            // seconds the voice is moved later (+) or earlier (−) against the music
  let reverb = false;
  const reduceInputs = [];  // every "filter the original singer" checkbox, kept in step

  const sa = () => store.setting('saMidi');
  const position = () => (source ? getCtx().currentTime - startedAt : offset);

  // ---------- File ----------
  const fileLabel = h('span', { class: 'small muted' }, t('track.none'));
  const pickFile = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (file) openFile(file);
  };
  const fileInput = h('input', { type: 'file', accept: 'audio/*', class: 'visually-hidden', onChange: pickFile });

  async function openFile(file) {
    stop();
    if (mode !== 'file') setMode('file');
    fileLabel.textContent = t('track.loading');
    let buf;
    try {
      buf = await getCtx().decodeAudioData(await file.arrayBuffer());
    } catch {
      fileLabel.textContent = buffer ? `${fileName} · ${fmt(buffer.duration)}` : t('track.none');
      toast(t('track.badFile'));
      return;
    }
    loadTrack(buf, file.name, Boolean(store.setting('autoRemoveSinger')));
  }

  // Makes a decoded track the one to sing with.
  function loadTrack(buf, name, removeSinger) {
    stop();
    if (mode !== 'file') setMode('file');
    buffer = buf;
    fileName = name;
    offset = 0;
    fileLabel.textContent = `${name} · ${fmt(buffer.duration)}`;
    seek.max = String(Math.floor(buffer.duration));
    seek.value = '0';
    lyricsBox.value = store.trackLyrics(fileName);
    playBtn.disabled = false;
    stereoNote.hidden = buffer.numberOfChannels > 1;
    setReduce(removeSinger && buffer.numberOfChannels > 1);
    draw();
  }

  // ---------- Audio graph ----------
  const trackGain = getCtx().createGain();
  trackGain.gain.value = volume;
  trackGain.connect(out());

  let chain = null;
  function playFrom(at) {
    const ctx = getCtx();
    source?.stop();
    chain?.input.disconnect();
    chain = musicChain(ctx, { reduce: reduceVocals, channels: buffer.numberOfChannels });
    chain.output.connect(trackGain);
    source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(chain.input);
    const when = ctx.currentTime + 0.05;
    source.start(when, at);
    startedAt = when - at;
    if (session) segments.push({ since: when, startedAt });
    const mine = source;
    source.onended = () => { if (source === mine && getCtx().currentTime - startedAt >= buffer.duration - 0.2) finish(); };
  }

  async function start() {
    if (mode === 'file' && !buffer) { toast(t('track.pickFirst')); return false; }
    if (mode === 'youtube' && !videoId) { toast(t('yt.pasteFirst')); return false; }
    heard = [];
    result.hidden = true;
    stopPlayback?.();
    segments = [];
    anchor = null;
    if (scoreOn || mode === 'youtube') {
      recorder = new TakeRecorder(getCtx().sampleRate);
      try {
        session = await startListening({
          pitchRange: VOICE_RANGE,
          onPitch: (f, time) => heard.push({ t: time - session.latency, off: f < 0 ? null : freqToMidi(f) - sa() }),
          onSamples: (chunk) => recorder.push(chunk),
        });
      } catch (err) {
        toast(listenErrorMessage(err));
        return false;
      }
    }
    if (mode === 'file') {
      if (offset >= buffer.duration - 0.5) offset = 0;
      playFrom(offset);
    } else if (yt?.controllable) {
      if (yt.state() === PLAYING) markVideo();
      else yt.play();
    } else {
      toast(t('yt.nowPlay'));
    }
    practiceStart = performance.now();
    const frame = () => {
      draw();
      if (mode === 'file') {
        seek.value = String(Math.floor(position()));
        timeLabel.textContent = `${fmt(position())} / ${fmt(buffer.duration)}`;
      } else {
        timeLabel.textContent = fmt((performance.now() - practiceStart) / 1000);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return true;
  }

  function stop() {
    cancelAnimationFrame(raf);
    if (source) {
      offset = Math.min(position(), buffer ? buffer.duration : 0);
      const s = source;
      source = null;
      try { s.stop(); } catch { /* already stopped */ }
    }
    if (session) {
      if ((performance.now() - practiceStart) / 1000 > 2 && session.rec.t0 != null && recorder.length) {
        take = {
          mode,
          voice: recorder.samples(),
          sampleRate: recorder.sampleRate,
          voiceStart: session.rec.t0 - session.latency,
          segments,
          anchor,
          fileName,
        };
      }
      session.stop();
      session = null;
      recorder = null;
      if (mode === 'youtube' && yt?.controllable) yt.pause();
    }
    if (practiceStart) store.logSeconds((performance.now() - practiceStart) / 1000);
    practiceStart = 0;
    playBtn.setOn?.(false);
  }

  function finish() {
    const hadMic = Boolean(session);
    stop();
    offset = 0;
    if (hadMic) showResults();
  }

  // The video time when it was seen playing during the take, to line the voice up with it later.
  function markVideo() {
    if (session && !anchor && yt?.controllable) anchor = { ctx: getCtx().currentTime, video: yt.time() };
  }

  function showResults() {
    const s = voiceStats(heard);
    result.hidden = false;
    const panel = take && recordingPanel();
    if (!s) {
      result.className = 'ex-result fail';
      result.replaceChildren(h('p', {}, t('sing.noVoice')), panel);
      return;
    }
    result.className = `ex-result ${s.inTune >= 60 ? 'pass' : 'fail'}`;
    result.replaceChildren(
      h('div', { class: 'ex-score' }, t('track.steady', { n: s.inTune })),
      h('p', {}, t('track.range', { low: midiName(sa() + s.low), high: midiName(sa() + s.high), n: s.high - s.low })),
      h('p', {}, s.inTune >= 75 ? t('track.tipGood') : s.inTune >= 50 ? t('track.tipOk') : t('track.tipLow')),
      panel);
  }

  // ---------- The recording: hear it, mix it with the music, save it ----------
  const duration = () => take.voice.length / take.sampleRate;
  const voiceOpts = () => ({ voice: take.voice, sampleRate: take.sampleRate, voiceGain, reverb });
  const musicOpts = () => ({
    track: buffer,
    plan: trackPlan(take.segments, take.voiceStart + shift, duration()),
    reduce: reduceVocals,
    musicGain: volume,
  });
  const canMix = () => take.mode === 'file' && buffer && take.fileName === fileName && take.segments.length > 0;

  // Plays live; returns a function that stops it. `done` runs when it ends by itself.
  function playLive(opts, done, delay = 0, voiceOffset = 0) {
    const ctx = getCtx();
    const stopMix = scheduleMix(ctx, out(), { ...opts, voiceOffset }, ctx.currentTime + 0.05 + delay);
    const timer = setTimeout(done, (delay + duration() - voiceOffset) * 1000 + 300);
    return () => { clearTimeout(timer); stopMix(); };
  }

  // Replays the voice while YouTube's player replays the same part of the video.
  function playWithVideo(done) {
    const v0 = take.anchor.video + (take.voiceStart + shift - take.anchor.ctx);   // video time of the first sample
    let stopVoice = null;
    const begin = () => {
      if (stopVoice) return;
      const lead = yt.time() - v0;
      if (lead > duration()) return;
      stopVoice = playLive(voiceOpts(), done, Math.max(0, -lead), Math.max(0, lead));
    };
    const off = yt.onState((state) => { if (state === PLAYING) begin(); });
    yt.seek(Math.max(0, v0));
    yt.play();
    // If the player was already playing, it may not report starting again.
    const check = setTimeout(() => { if (yt.state() === PLAYING) begin(); }, 1500);
    return () => { clearTimeout(check); off(); stopVoice?.(); yt.pause(); };
  }

  function recordingPanel() {
    const buttons = [];
    const playButton = (label, run) => {
      const btn = h('button', { class: 'btn', type: 'button' }, label);
      btn.dataset.label = label;
      btn.addEventListener('click', () => {
        const wasMine = btn.classList.contains('active');
        stopPlayback?.();
        if (wasMine) return;
        const reset = () => {
          stopPlayback = null;
          buttons.forEach((b) => { b.textContent = b.dataset.label; b.classList.remove('active'); });
        };
        const stopIt = run(reset);
        stopPlayback = () => { stopIt(); reset(); };
        btn.textContent = t('ex.stopPlayback');
        btn.classList.add('active');
      });
      buttons.push(btn);
      return btn;
    };
    const saveButton = (label, save) => h('button', {
      class: 'btn', type: 'button',
      onClick: async (e) => {
        const btn = e.currentTarget;
        btn.disabled = true;
        btn.textContent = t('take.preparing');
        try {
          await save();
          toast(t('take.saved'));
        } catch {
          toast(t('take.saveFailed'));
        } finally {
          btn.disabled = false;
          btn.textContent = label;
        }
      },
    }, label);
    // Changing a setting restarts what is playing, so it is heard at once.
    const restart = () => { const playing = buttons.find((b) => b.classList.contains('active')); if (playing) { stopPlayback(); playing.click(); } };

    const hearVoice = playButton(t('take.hearVoice'), (done) => playLive(voiceOpts(), done));
    const hearMix = canMix() && playButton(t('take.hearMix'), (done) => playLive({ ...voiceOpts(), ...musicOpts() }, done));
    const hearVideo = take.mode === 'youtube' && take.anchor && yt?.controllable && playButton(t('take.hearVideo'), playWithVideo);

    const shiftLabel = h('output', { class: 'small' }, `${Math.round(shift * 1000)} ms`);
    const slider = (label, attrs, onInput, extra) => h('label', { class: 'field' },
      h('span', { class: 'small' }, label, extra && ' ', extra),
      h('input', { type: 'range', ...attrs, onInput, onChange: restart }));

    return h('div', { class: 'take-panel' },
      h('h3', {}, `🎙️ ${t('take.title')}`),
      h('p', { class: 'small' }, t('take.length', { time: fmt(duration()) })),
      h('div', { class: 'controls' }, hearVoice, hearMix, hearVideo),
      canMix() && reduceToggle(),
      canMix() && h('p', { class: 'small muted' }, buffer.numberOfChannels > 1 ? t('take.filterHint') : t('track.mono')),
      slider(t('take.voiceLevel'), { min: 0.2, max: 2, step: 0.05, value: voiceGain }, (e) => { voiceGain = Number(e.target.value); }),
      canMix() && slider(t('track.volume'), { min: 0, max: 1, step: 0.05, value: volume }, (e) => { volume = Number(e.target.value); trackGain.gain.value = volume; }),
      (canMix() || hearVideo) && slider(t('take.timing'), { min: -0.4, max: 0.4, step: 0.01, value: shift, 'aria-describedby': 'take-timing-hint' },
        (e) => { shift = Number(e.target.value); shiftLabel.textContent = `${Math.round(shift * 1000)} ms`; }, shiftLabel),
      (canMix() || hearVideo) && h('p', { class: 'small muted', id: 'take-timing-hint' }, t('take.timingHint')),
      h('div', { class: 'controls' }, checkbox(t('take.reverb'), reverb, (v) => { reverb = v; restart(); })),
      h('div', { class: 'controls' },
        saveButton(`⬇ ${t('take.saveVoice')}`, async () => {
          const buf = await renderMix(voiceOpts());
          await saveAudio([buf.getChannelData(0)], buf.sampleRate, `surtaal-my-voice-${stamp()}`);
        }),
        canMix() && saveButton(`⬇ ${t('take.saveMix')}`, async () => {
          const buf = await renderMix({ ...voiceOpts(), ...musicOpts() });
          await saveAudio([buf.getChannelData(0), buf.getChannelData(1)], buf.sampleRate, `surtaal-${slug(take.fileName)}-with-my-voice`);
        })),
      take.mode === 'youtube' && take.anchor == null && yt?.controllable && h('p', { class: 'small muted' }, t('take.ytNoSync')),
      take.mode === 'youtube' && h('p', { class: 'small privacy-note' }, t('take.ytNote')));
  }

  function setReduce(v) {
    reduceVocals = v;
    reduceInputs.forEach((i) => { i.checked = v; });
    if (source) playFrom(position());
  }
  function reduceToggle() {
    const box = checkbox(t('track.reduceVocals'), reduceVocals, setReduce);
    reduceInputs.push(box.querySelector('input'));
    return h('div', { class: 'controls' }, box);
  }

  scope.onCleanup(() => { stopPlayback?.(); stop(); yt?.destroy(); trackGain.disconnect(); });

  // ---------- Download songs ----------
  // SurTaal's own songs as backing tracks, plus places to get music that may
  // be downloaded legally. A song opened from the device can have its
  // original singer removed automatically.
  function downloadCard() {
    const mine = store.mySongs();
    const songSelect = h('select', { class: 'select', 'aria-label': t('dl.song') },
      h('optgroup', { label: t('sing.builtIn') }, SONGS.map((sg) => h('option', { value: sg.id }, songText(sg, 'title')))),
      mine.length > 0 && h('optgroup', { label: t('mysong.title') }, mine.map((raw) => h('option', { value: raw.id }, raw.title || t('mysong.untitled')))));
    const parts = { guide: true, tabla: true, tanpura: true };
    const status = h('p', { class: 'small muted', role: 'status' });
    const render = async (btn, use) => {
      const song = findSong(songSelect.value);
      if (!song) return;
      const label = btn.textContent;
      btn.disabled = true;
      btn.textContent = t('take.preparing');
      try {
        const buf = await renderBacking(song, { saMidi: sa(), ...parts });
        const title = typeof song.title === 'object' ? songText(song, 'title') : (song.title || 'song');
        await use(buf, `${slug(title)}-${midiName(sa()).replace('#', 's')}${parts.guide ? '' : '-karaoke'}`);
      } catch {
        toast(t('take.saveFailed'));
      } finally {
        btn.disabled = false;
        btn.textContent = label;
      }
    };
    const SOURCES = [
      ['https://www.youtube.com/audiolibrary', 'dl.srcYt.name', 'dl.srcYt.text'],
      ['https://freemusicarchive.org/', 'dl.srcFma.name', 'dl.srcFma.text'],
      ['https://ccmixter.org/', 'dl.srcCc.name', 'dl.srcCc.text'],
      ['https://pixabay.com/music/', 'dl.srcPixabay.name', 'dl.srcPixabay.text'],
      ['https://archive.org/details/audio', 'dl.srcArchive.name', 'dl.srcArchive.text'],
    ];
    return h('div', { class: 'step-card download-card' },
      h('h2', {}, `⬇ ${t('dl.title')}`),
      h('h3', {}, t('dl.ownTitle')),
      h('p', { class: 'small' }, t('dl.ownText')),
      h('label', { class: 'field' }, h('span', { class: 'small' }, t('dl.song')), songSelect),
      h('div', { class: 'controls' },
        checkbox(t('dl.guide'), parts.guide, (v) => { parts.guide = v; }),
        checkbox(t('dl.tabla'), parts.tabla, (v) => { parts.tabla = v; }),
        checkbox(t('dl.tanpura'), parts.tanpura, (v) => { parts.tanpura = v; })),
      h('p', { class: 'small muted' }, t('dl.keyNote')),
      h('div', { class: 'controls' },
        h('button', {
          class: 'btn btn-primary', type: 'button',
          onClick: (e) => render(e.currentTarget, (buf, name) => {
            loadTrack(buf, name, false);
            status.textContent = t('dl.loaded');
            canvas.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }),
        }, `🎤 ${t('dl.singHere')}`),
        h('button', {
          class: 'btn', type: 'button',
          onClick: (e) => render(e.currentTarget, async (buf, name) => {
            await saveAudio([buf.getChannelData(0), buf.getChannelData(1)], buf.sampleRate, name);
            status.textContent = t('take.saved');
          }),
        }, `⬇ ${t('dl.download')}`)),
      status,
      h('h3', {}, t('dl.freeTitle')),
      h('p', { class: 'small' }, t('dl.freeText')),
      h('ul', { class: 'source-list' }, SOURCES.map(([href, name, text]) => h('li', {},
        h('a', { href, target: '_blank', rel: 'noopener' }, t(name)), ' — ', h('span', { class: 'small muted' }, t(text))))),
      h('p', { class: 'small' }, t('dl.openText')),
      h('div', { class: 'controls' },
        h('label', { class: 'btn' }, `📂 ${t('track.choose')}`, h('input', {
          type: 'file', accept: 'audio/*', class: 'visually-hidden',
          onChange: (e) => { pickFile(e); canvas.scrollIntoView({ block: 'center', behavior: 'smooth' }); },
        })),
        checkbox(t('dl.autoRemove'), Boolean(store.setting('autoRemoveSinger')), (v) => store.setSetting('autoRemoveSinger', v))),
      h('p', { class: 'small privacy-note' }, t('dl.legal')));
  }

  // ---------- Pitch line ----------
  const canvas = h('canvas', { class: 'pitch-roll', role: 'img', 'aria-label': t('track.canvasLabel') });
  const g = canvas.getContext('2d');
  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const hgt = canvas.clientHeight;
    if (!w) return;
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(hgt * dpr); }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, hgt);
    const cs = getComputedStyle(canvas);
    const c = (n) => cs.getPropertyValue(n).trim();
    const left = 34;
    const rowH = hgt / 13.5;
    const y = (semi) => hgt - (semi + 0.75) * rowH;
    g.font = '600 12px system-ui, sans-serif';
    g.textBaseline = 'middle';
    GRID.forEach((tok) => {
      const sw = parseSwara(tok);
      const strong = !sw.komal && !sw.tivra;
      g.fillStyle = c('--surface-2');
      if (strong) g.fillRect(left, y(sw.semitone) - rowH * 0.42, w - left, rowH * 0.84);
      g.fillStyle = strong ? c('--muted') : c('--border');
      g.fillText(swaraLabel(sw).textContent + (sw.octave > 0 ? "'" : ''), 4, y(sw.semitone));
    });
    // The voice, folded into one octave above Sa, over the last few seconds.
    const now = getCtx().currentTime - (getCtx().outputLatency || 0);
    const x = (time) => w - 12 - (now - time) * ((w - left - 12) / WINDOW_SECONDS);
    g.lineWidth = 2.5;
    g.lineCap = 'round';
    let prev = null;
    for (let i = Math.max(0, heard.length - 600); i < heard.length; i++) {
      const f = heard[i];
      const px = x(f.t);
      if (f.off == null || px < left) { prev = null; continue; }
      const folded = ((f.off % 12) + 12) % 12;
      const near = Math.abs(folded - Math.round(folded)) * 100 <= 25;
      const py = y(folded > 11.5 ? folded - 12 : folded);
      if (prev && f.t - prev.t < 0.12 && Math.abs(py - prev.py) < rowH * 3) {
        g.strokeStyle = near ? c('--good') : c('--text');
        g.beginPath();
        g.moveTo(prev.px, prev.py);
        g.lineTo(px, py);
        g.stroke();
      }
      prev = { t: f.t, px, py };
    }
  }

  // ---------- Controls ----------
  const playBtn = toggleButton({ onStart: start, onStop: () => { const hadMic = Boolean(session); stop(); if (hadMic) showResults(); } });
  playBtn.disabled = true;
  const timeLabel = h('span', { class: 'small muted' }, '0:00');
  const seek = h('input', {
    type: 'range', class: 'seek', min: 0, max: 0, value: 0, step: 1, 'aria-label': t('track.position'),
    onInput: (e) => { offset = Number(e.target.value); if (source) playFrom(offset); timeLabel.textContent = fmt(offset); },
  });
  const keyLabel = h('span', { class: 'badge' }, t('sa.badge', { note: midiName(sa()) }));
  const setKey = (d) => {
    const v = Math.max(43, Math.min(72, sa() + d));
    store.setSetting('saMidi', v);
    keyLabel.textContent = t('sa.badge', { note: midiName(v) });
  };
  const stereoNote = h('p', { class: 'small muted', hidden: true }, t('track.mono'));
  const lyricsBox = h('textarea', {
    class: 'input lyrics-paste', rows: 6, placeholder: t('track.lyricsHint'), 'aria-label': t('track.lyrics'),
    onInput: (e) => { if (fileName) store.setTrackLyrics(fileName, e.target.value); },
  });
  const result = h('div', { class: 'ex-result', hidden: true });

  // File mode: choose a track, then seek, vocal reduction and volume.
  const fileTop = h('div', { class: 'controls' },
    h('label', { class: 'btn btn-primary' }, `📂 ${t('track.choose')}`, fileInput),
    fileLabel);
  const fileControls = h('div', {},
    seek,
    h('div', { class: 'controls' },
      checkbox(t('sing.score'), scoreOn, (v) => { scoreOn = v; }),
      reduceToggle()),
    stereoNote,
    h('label', { class: 'field' }, h('span', { class: 'small' }, t('track.volume')),
      h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: volume, onInput: (e) => { volume = Number(e.target.value); trackGain.gain.setTargetAtTime(volume, getCtx().currentTime, 0.05); } })));

  // YouTube mode: the video plays in YouTube's own player; SurTaal only listens to you.
  const player = h('div');
  const linkInput = h('input', { class: 'input', type: 'url', inputmode: 'url', placeholder: 'https://youtu.be/…', 'aria-label': t('yt.link') });
  const loadVideo = () => {
    const id = youtubeId(linkInput.value);
    if (!id) { toast(t('yt.badLink')); return; }
    stop();
    videoId = id;
    yt?.destroy();
    yt = youtubePlayer(id, t('yt.playerTitle'));
    yt.onState((state) => { if (state === PLAYING) markVideo(); });
    player.replaceChildren(yt.el);
    playBtn.disabled = false;
  };
  const searchInput = h('input', { class: 'input', placeholder: t('yt.searchHint'), 'aria-label': t('yt.search') });
  const ytBox = h('div', { hidden: true },
    h('p', { class: 'small' }, t('yt.intro')),
    h('div', { class: 'yt-row' }, linkInput, h('button', { class: 'btn btn-primary', type: 'button', onClick: loadVideo }, t('yt.load'))),
    player,
    h('details', { class: 'yt-help' },
      h('summary', {}, `🔎 ${t('yt.findTitle')}`),
      h('p', { class: 'small' }, t('yt.findText')),
      h('div', { class: 'yt-row' }, searchInput,
        h('button', { class: 'btn', type: 'button', onClick: () => { if (searchInput.value.trim()) window.open(searchUrl(searchInput.value.trim()), '_blank', 'noopener'); } }, t('yt.searchBtn')))),
    h('p', { class: 'small muted' }, t('yt.legal')));

  const setMode = (m) => {
    if (m === mode) return;
    stop();
    mode = m;
    [...modeTabs.children].forEach((b) => { b.classList.toggle('on', b.dataset.mode === m); b.setAttribute('aria-pressed', String(b.dataset.mode === m)); });
    fileTop.hidden = m !== 'file';
    fileControls.hidden = m !== 'file';
    ytBox.hidden = m !== 'youtube';
    playBtn.disabled = m === 'file' ? !buffer : !videoId;
    result.hidden = true;
  };
  const modeTabs = h('div', { class: 'segmented', role: 'group', 'aria-label': t('yt.source') },
    h('button', { class: 'seg on', type: 'button', 'aria-pressed': 'true', 'data-mode': 'file', onClick: () => setMode('file') }, `📂 ${t('yt.fromFile')}`),
    h('button', { class: 'seg', type: 'button', 'aria-pressed': 'false', 'data-mode': 'youtube', onClick: () => setMode('youtube') }, `▶ ${t('yt.fromYoutube')}`));

  // A track handed over by another page (the Music Studio's "Sing over it").
  const handed = takePendingTrack();
  if (handed) loadTrack(handed.buffer, handed.name, false);

  return h('div', { class: 'container c-singing' },
    h('a', { class: 'back', href: '#/sing' }, t('sing.backToSongs')),
    h('h1', {}, `🎧 ${t('track.title')}`),
    h('p', { class: 'muted' }, t('track.intro')),
    h('p', { class: 'small privacy-note' }, `🔒 ${t('track.private')}`),
    h('div', { class: 'step-card' },
      modeTabs,
      fileTop,
      ytBox,
      canvas,
      h('div', { class: 'roll-legend small muted' },
        h('span', {}, h('i', { class: 'dot hit' }), t('track.legendSteady')),
        h('span', {}, h('i', { class: 'dot you' }), t('sing.legendYou'))),
      h('div', { class: 'controls' }, playBtn, timeLabel),
      fileControls,
      h('div', { class: 'controls' },
        h('span', { class: 'small' }, t('sing.key')),
        h('button', { class: 'btn btn-sm', 'aria-label': t('sing.keyDown'), onClick: () => setKey(-1) }, '−'),
        keyLabel,
        h('button', { class: 'btn btn-sm', 'aria-label': t('sing.keyUp'), onClick: () => setKey(1) }, '+'),
        h('span', { class: 'small muted' }, t('track.keyHint'))),
      h('p', { class: 'small muted' }, `🎧 ${t('track.headphones')}`),
      h('p', { class: 'small muted' }, `🎙️ ${t('take.intro')}`),
      result),
    downloadCard(),
    h('div', { class: 'step-card' },
      h('h2', {}, t('sing.lyrics')),
      h('p', { class: 'small muted' }, t('track.lyricsNote')),
      lyricsBox));
}

const pad = (n) => String(n).padStart(2, '0');
const stamp = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
const slug = (name) => (name || 'track').replace(/\.[^.]+$/, '').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'track';
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
