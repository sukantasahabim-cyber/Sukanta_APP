// Sing-along Studio: sing original songs with guide voice, tabla and
// tanpura, watch your voice on a live pitch line and get every note marked.
import { h, toast } from '../ui/dom.js';
import { toggleButton, checkbox, tempoControl, swaraLabel } from '../ui/controls.js';
import { t, lang } from '../i18n/i18n.js';
import { SONGS, getSong } from '../data/songs.js';
import { TAALS } from '../data/taals.js';
import { songNotes, centsFromTarget, scoreNote, summarize, stars, noteAt, estimateLag, noteFrames } from '../analysis/singalong.js';
import { getCtx, click } from '../audio/engine.js';
import { playNote, createTanpura } from '../audio/voice.js';
import { playBol } from '../audio/tabla.js';
import { startListening, listenErrorMessage, playTake } from '../audio/listen.js';
import { freqToMidi, midiName, parseSwara } from '../music.js';
import { store } from '../store.js';
import { taalName } from '../i18n/names.js';
import { notFound } from './notfound.js';

const VOICE_RANGE = { minFreq: 70, maxFreq: 1100 };
const LOOKAHEAD = 0.15;
const COUNT_IN = 4;
const VISIBLE_BEATS = 8;

const songText = (song, key) => song[key][lang()] || song[key].en;

export function singAlongListView() {
  return h('div', { class: 'container c-singing' },
    h('a', { class: 'back', href: '#/course/singing' }, t('sing.backToCourse')),
    h('h1', {}, `🎙️ ${t('sing.title')}`),
    h('p', { class: 'muted' }, t('sing.intro')),
    h('ul', { class: 'song-list' }, SONGS.map((song) => {
      const best = store.songBest(song.id);
      return h('li', {}, h('a', { class: 'song-card', href: `#/sing/${song.id}` },
        h('span', { class: 'song-icon', 'aria-hidden': 'true' }, song.language === 'sargam' ? '🎼' : '🎵'),
        h('span', { class: 'song-main' },
          h('b', {}, songText(song, 'title')),
          h('span', { class: 'small muted' }, songText(song, 'about')),
          h('span', { class: 'small' }, t('sing.meta', { raag: t(`raag.${song.raag.toLowerCase()}`), taal: taalName(song.taal, TAALS[song.taal].name), n: song.level }))),
        best != null && h('span', { class: 'song-best' }, `${'★'.repeat(stars(best)) || '☆'} ${best}%`)));
    })));
}

export function singAlongView(scope, id) {
  const song = getSong(id);
  if (!song) return notFound();
  const model = songNotes(song);
  const taal = TAALS[song.taal];
  const tokens = [...new Set(model.notes.map((n) => n.semitone))];
  const lowest = Math.min(...tokens) - 2;
  const highest = Math.max(...tokens) + 2;

  let bpm = song.bpm;
  let guideOn = true;
  let tablaOn = true;
  let scoreOn = true;
  let loopLine = null;
  let run = null;          // the playback in progress
  let results = [];        // per note: scoreNote() result
  let heard = [];          // pitch frames { t, off } of the current run
  let lastTake = null;
  let stopTake = null;

  const sa = () => store.setting('saMidi');

  // ---------- Lyrics ----------
  const showRoman = song.language !== 'sargam' && song.language !== lang();
  const sylEls = [];
  const lineEls = song.lines.map((ln, li) => {
    const words = model.notes.filter((n) => n.line === li).map((n) => {
      const el = h('span', { class: 'syl' }, song.language === 'sargam' ? swaraLabel(parseSwara(n.token)) : n.syllable);
      sylEls[n.n] = el;
      return el;
    });
    const roman = showRoman && ln.roman && h('span', { class: 'lyric-roman' }, ln.roman.filter((w) => w !== '_').join(' '));
    return h('button', {
      class: 'lyric-line', type: 'button', 'aria-pressed': 'false',
      onClick: () => setLoop(loopLine === li ? null : li),
    }, h('span', { class: 'line-num' }, li + 1), h('span', {}, h('span', { class: 'lyric-words' }, words), roman));
  });
  const loopNote = h('p', { class: 'small muted', 'aria-live': 'polite' }, t('sing.tapLine'));

  // The line being sung, large, right under the pitch line, with the next line below it.
  const nowBox = h('div', { class: 'now-lyrics' });
  let nowLine = -1;
  let nowEls = [];
  const wordFor = (n) => (song.language === 'sargam' ? swaraLabel(parseSwara(n.token)) : n.syllable);
  function showNow(li, current) {
    if (li !== nowLine) {
      nowLine = li;
      const notes = model.notes.filter((n) => n.line === li);
      nowEls = notes.map((n) => ({ n, el: h('span', { class: 'syl' }, wordFor(n)) }));
      const next = song.lines[li + 1] && model.notes.filter((n) => n.line === li + 1);
      const roman = showRoman && song.lines[li].roman;
      nowBox.replaceChildren(
        h('div', { class: 'now-words' }, nowEls.map((x) => x.el)),
        roman && h('div', { class: 'lyric-roman' }, roman.filter((w) => w !== '_').join(' ')),
        next && h('div', { class: 'next-words' }, next.map((n) => (song.language === 'sargam' ? swaraLabel(parseSwara(n.token)) : n.syllable)).reduce((acc, w) => [...acc, ' ', w], []).slice(1)));
    }
    for (const { n, el } of nowEls) {
      el.classList.toggle('now', current?.n === n.n);
      el.classList.toggle('hit', Boolean(results[n.n]?.hit));
      el.classList.toggle('miss', Boolean(results[n.n] && !results[n.n].hit));
    }
  }

  function setLoop(li) {
    loopLine = li;
    lineEls.forEach((el, k) => { el.classList.toggle('looping', k === li); el.setAttribute('aria-pressed', String(k === li)); });
    loopNote.textContent = li == null ? t('sing.tapLine') : t('sing.loop', { n: li + 1 });
    if (run) {
      stop();
      start().then((ok) => { if (ok) playBtn.setOn(true); });
    }
  }

  // ---------- Pitch roll ----------
  const canvas = h('canvas', { class: 'pitch-roll', role: 'img', 'aria-label': t('sing.canvasLabel') });
  const ctx2d = canvas.getContext('2d');
  const status = h('div', { class: 'ex-status' }, t('sing.ready'));
  const result = h('div', { class: 'ex-result', hidden: true });

  function colors() {
    const cs = getComputedStyle(canvas);
    const v = (name) => cs.getPropertyValue(name).trim();
    return { course: v('--course'), good: v('--good'), bad: v('--bad'), text: v('--text'), muted: v('--muted'), border: v('--border'), surface: v('--surface-2') };
  }

  function draw(nowBeat) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const hgt = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(hgt * dpr); }
    const g = ctx2d;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, hgt);
    const c = colors();
    const rows = highest - lowest + 1;
    const rowH = hgt / rows;
    const y = (semi) => hgt - (semi - lowest + 0.5) * rowH;
    const left = 34;
    const ppb = (w - left) / VISIBLE_BEATS;
    const nowX = left + ppb * 1.5;
    const x = (beat) => nowX + (beat - nowBeat) * ppb;

    // Rows for the song's notes, with their names.
    g.font = '600 12px system-ui, sans-serif';
    g.textBaseline = 'middle';
    for (const semi of tokens) {
      g.fillStyle = c.surface;
      g.fillRect(left, y(semi) - rowH / 2, w - left, rowH);
      const name = model.notes.find((n) => n.semitone === semi).token;
      g.fillStyle = c.muted;
      g.fillText(swaraLabel(parseSwara(name)).textContent + (name.includes("'") ? "'" : name.startsWith('.') ? '.' : ''), 4, y(semi));
    }
    // Target notes.
    for (const n of model.notes) {
      const x0 = x(n.start);
      const x1 = x(n.start + n.beats);
      if (x1 < left || x0 > w) continue;
      const r = results[n.n];
      g.fillStyle = r ? (r.hit ? c.good : c.bad) : c.course;
      g.globalAlpha = r ? 0.85 : (nowBeat >= n.start && nowBeat < n.start + n.beats ? 0.9 : 0.45);
      roundRect(g, Math.max(left, x0 + 1), y(n.semitone) - rowH * 0.35, Math.min(w, x1 - 1) - Math.max(left, x0 + 1), rowH * 0.7, 4);
      g.fill();
    }
    g.globalAlpha = 1;
    // The singer's voice.
    g.strokeStyle = c.text;
    g.lineWidth = 2.5;
    g.lineCap = 'round';
    g.beginPath();
    let prev = null;
    for (let i = Math.max(0, heard.length - 400); i < heard.length; i++) {
      const f = heard[i];
      if (f.off == null || !run) { prev = null; continue; }
      const beat = toBeat(f.t - run.lag);
      const n = noteAt(model.notes, beat);
      const px = x(beat);
      if (!n || px < left || px > nowX + 2) { prev = null; continue; }
      const py = y(n.semitone + Math.max(-600, Math.min(600, centsFromTarget(f.off, n.semitone))) / 100);
      if (prev != null && beat - prev < 0.3) g.lineTo(px, py); else g.moveTo(px, py);
      prev = beat;
    }
    g.stroke();
    // "Now" line.
    g.strokeStyle = c.course;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(nowX, 0);
    g.lineTo(nowX, hgt);
    g.stroke();
  }

  // ---------- Playback ----------
  const beatDur = () => 60 / bpm;
  const range = () => (loopLine == null
    ? [0, model.totalBeats]
    : [model.lineStarts[loopLine], model.lineStarts[loopLine] + song.lines[loopLine].notes.length]);

  function resetScores(lines) {
    for (const n of model.notes) {
      if (lines == null || lines.includes(n.line)) results[n.n] = undefined;
    }
    sylEls.forEach((el, k) => { if (lines == null || lines.includes(model.notes[k].line)) el.classList.remove('hit', 'miss', 'now'); });
    heard = [];
  }

  // Song beat of a moment in AudioContext time, for the current run.
  const toBeat = (time) => run.from + (time - run.t0) / beatDur();

  const lineOf = (beat) => {
    let li = 0;
    model.lineStarts.forEach((s, k) => { if (beat >= s) li = k; });
    return li;
  };

  async function start() {
    const ac = getCtx();
    const [from, to] = range();
    const lines = loopLine == null ? null : [loopLine];
    resetScores(lines);
    result.hidden = true;
    stopTake?.();
    let session = null;
    if (scoreOn) {
      try {
        session = await startListening({ pitchRange: VOICE_RANGE, onPitch });
      } catch (err) {
        status.textContent = listenErrorMessage(err);
        status.className = 'ex-status bad';
        return false;
      }
    }
    const t0 = ac.currentTime + 0.3 + COUNT_IN * beatDur();
    for (let i = 0; i < COUNT_IN; i++) click(t0 - (COUNT_IN - i) * beatDur(), i === 0);
    run = { session, from, to, t0, lines, next: from, started: performance.now(), timer: 0, raf: 0, lag: 0,
      notes: model.notes.filter((n) => n.start >= from && n.start < to) };
    run.timer = setInterval(schedule, 25);
    schedule();
    status.textContent = t('sing.countIn');
    status.className = 'ex-status';
    const frame = () => {
      if (!run) return;
      const now = getCtx().currentTime - (getCtx().outputLatency || 0);
      const beat = run.from + (now - run.t0) / beatDur();
      animate(beat);
      run.raf = requestAnimationFrame(frame);
    };
    run.raf = requestAnimationFrame(frame);
    return true;
  }

  // Schedules tabla and guide notes a little ahead of time; loops or ends the song.
  function schedule() {
    const ac = getCtx();
    while (run && run.next < run.to && run.t0 + (run.next - run.from) * beatDur() < ac.currentTime + LOOKAHEAD) {
      const b = run.next;
      const time = run.t0 + (b - run.from) * beatDur();
      if (tablaOn) {
        const bols = taal.bols[b % taal.matras];
        bols.forEach((bol, k) => { if (bol !== '-') playBol(bol, time + (k * beatDur()) / bols.length, 0.7); });
      }
      const n = model.notes.find((x) => x.start === b);
      if (guideOn && n) playNote(sa() + n.semitone, time, n.beats * beatDur() * 0.95, 0.16);
      run.next++;
    }
    if (run && run.next >= run.to) {
      const end = run.t0 + (run.to - run.from) * beatDur();
      if (ac.currentTime > end + 0.8) {
        if (loopLine != null) {
          scoreDue(Infinity);
          showLineResult();
          run.t0 = end + beatDur();
          run.next = run.from;
          resetScores(run.lines);
        } else {
          finish(false);
        }
      }
    }
  }

  function onPitch(f, time) {
    if (!run) return;
    heard.push({ t: time - run.session.latency, off: f < 0 ? null : freqToMidi(f) - sa() });
  }

  // Judges every note whose time has passed, after re-measuring the delay
  // between the music and the voice (automatic sync).
  function scoreDue(beat) {
    if (!run?.session) return;
    // Wait until even the latest-arriving voice (LAGS) for the note is in.
    const due = run.notes.filter((n) => !results[n.n] && n.start + n.beats <= beat - 0.7 / beatDur());
    if (!due.length) return;
    run.lag = estimateLag(heard, run.notes, toBeat);
    for (const n of due) {
      results[n.n] = scoreNote(noteFrames(heard, n, toBeat, run.lag));
      sylEls[n.n].classList.add(results[n.n].hit ? 'hit' : 'miss');
    }
  }

  function animate(beat) {
    run.lastBeat = beat;
    scoreDue(beat);
    const current = noteAt(model.notes, beat);
    sylEls.forEach((el, k) => el.classList.toggle('now', current?.n === k));
    const li = beat >= run.from ? lineOf(Math.max(beat, 0)) : null;
    lineEls.forEach((el, k) => el.classList.toggle('current', k === li));
    if (beat >= run.from && status.textContent === t('sing.countIn')) {
      status.textContent = scoreOn ? t('sing.singNow') : t('sing.listenNow');
      status.className = 'ex-status good';
    }
    showNow(li ?? run.lines?.[0] ?? 0, current);
    draw(beat);
  }

  function showLineResult() {
    if (!run?.session) return;
    const s = summarize(model, results, run.lines);
    status.textContent = t('sing.lineResult', { n: loopLine + 1, score: s.score });
    status.className = `ex-status ${s.score >= 70 ? 'good' : 'warn'}`;
  }

  // Ends the run and shows the results; `early` when the singer pressed Stop.
  function finish(early) {
    if (!run) return;
    const { session, lines: loopLines } = run;
    const reached = early ? (run.lastBeat ?? run.from) : Infinity;
    if (session) scoreDue(reached);
    stop();
    const played = song.lines.map((_, i) => i)
      .filter((i) => model.lineStarts[i] < reached && (loopLines == null || loopLines.includes(i)));
    if (!session || !played.length) { status.textContent = t('sing.ready'); status.className = 'ex-status'; return; }
    if (!heard.some((f) => f.off != null)) {
      status.textContent = t('sing.noVoice');
      status.className = 'ex-status bad';
      return;
    }
    const s = summarize(model, results, played);
    // Only a whole song, sung to the end, counts as a best score.
    if (!early && loopLines == null) store.recordSong(song.id, s.score);
    status.textContent = t('ex.finished');
    status.className = 'ex-status';
    showResults(s);
  }

  function showResults(s) {
    const weak = s.lines.filter((l) => l.score < 70);
    result.hidden = false;
    result.className = `ex-result ${s.score >= 70 ? 'pass' : 'fail'}`;
    result.replaceChildren(
      h('div', { class: 'ex-score' }, `${'★'.repeat(stars(s.score))}${'☆'.repeat(3 - stars(s.score))} ${t('sing.result', { n: s.score })}`),
      h('ul', { class: 'line-scores' }, s.lines.map((l) => h('li', {},
        h('span', {}, t('sing.lineScore', { n: l.line + 1 })),
        h('div', { class: 'bar' }, h('div', { class: `bar-fill${l.score < 70 ? ' weak' : ''}`, style: { width: `${l.score}%` } })),
        h('span', { class: 'small' }, `${l.score}%`),
        l.score < 70 && h('button', { class: 'btn btn-sm', onClick: () => { setLoop(l.line); if (!run) playBtn.click(); } }, t('sing.practiseLine'))))),
      h('p', {}, weak.length ? t('sing.weakLines', { list: weak.map((l) => l.line + 1).join(', ') }) : t('sing.perfectLines')),
      lastTake && h('button', {
        class: 'btn',
        onClick: (e) => {
          if (stopTake) { stopTake(); return; }
          e.target.textContent = t('ex.stopPlayback');
          stopTake = playTake(lastTake, () => { stopTake = null; e.target.textContent = t('ex.hearAttempt'); });
        },
      }, t('ex.hearAttempt')));
  }

  function stop() {
    if (!run) return;
    clearInterval(run.timer);
    cancelAnimationFrame(run.raf);
    const seconds = (performance.now() - run.started) / 1000;
    if (run.session) {
      if (seconds > 2) lastTake = run.session.take();
      run.session.stop();
    }
    store.logSeconds(seconds);
    run = null;
    if (nowLine >= 0) { const li = nowLine; nowLine = -1; showNow(li, null); }
    sylEls.forEach((el) => el.classList.remove('now'));
    lineEls.forEach((el) => el.classList.remove('current'));
    playBtn.setOn?.(false);
  }

  scope.onCleanup(() => { stopTake?.(); stop(); tanpura.stop(); });

  // ---------- Controls ----------
  const playBtn = toggleButton({ onStart: start, onStop: () => finish(true) });
  const tanpura = createTanpura();
  const tanpuraBtn = toggleButton({ startLabel: t('tanpura.on'), stopLabel: t('tanpura.off'), className: 'btn', onStart: () => tanpura.start(), onStop: () => tanpura.stop() });
  const keyLabel = h('span', { class: 'badge' }, t('sa.badge', { note: midiName(sa()) }));
  const setKey = (d) => {
    const v = Math.max(43, Math.min(72, sa() + d));
    store.setSetting('saMidi', v);
    keyLabel.textContent = t('sa.badge', { note: midiName(v) });
    if (tanpura.running) { tanpura.stop(); tanpura.start(); }
  };

  const view = h('div', { class: 'container c-singing singalong' },
    h('a', { class: 'back', href: '#/sing' }, t('sing.backToSongs')),
    h('h1', {}, songText(song, 'title')),
    h('p', { class: 'muted' }, songText(song, 'about')),
    h('p', { class: 'small' }, t('sing.meta', { raag: t(`raag.${song.raag.toLowerCase()}`), taal: taalName(song.taal, taal.name), n: song.level })),
    h('div', { class: 'step-card' },
      canvas,
      nowBox,
      h('div', { class: 'roll-legend small muted' },
        h('span', {}, h('i', { class: 'dot target' }), t('sing.legendTarget')),
        h('span', {}, h('i', { class: 'dot hit' }), t('sing.legendHit')),
        h('span', {}, h('i', { class: 'dot miss' }), t('sing.legendMiss')),
        h('span', {}, h('i', { class: 'dot you' }), t('sing.legendYou'))),
      status,
      h('div', { class: 'controls' }, playBtn, tanpuraBtn),
      h('div', { class: 'controls' },
        checkbox(t('sing.score'), scoreOn, (v) => { scoreOn = v; }),
        checkbox(t('sargam.guide'), guideOn, (v) => { guideOn = v; }),
        checkbox(t('sing.tabla', { taal: taalName(song.taal, taal.name) }), tablaOn, (v) => { tablaOn = v; })),
      h('div', { class: 'controls' },
        h('span', { class: 'small' }, t('sing.key')),
        h('button', { class: 'btn btn-sm', 'aria-label': t('sing.keyDown'), onClick: () => setKey(-1) }, '−'),
        keyLabel,
        h('button', { class: 'btn btn-sm', 'aria-label': t('sing.keyUp'), onClick: () => setKey(1) }, '+')),
      tempoControl({ value: bpm, min: 40, max: 160, onChange: (v) => { bpm = v; } }),
      result),
    h('div', { class: 'step-card' },
      h('h2', {}, t('sing.lyrics')),
      loopNote,
      h('ol', { class: 'lyrics' }, lineEls.map((el) => h('li', {}, el)))));

  showNow(0, null);
  requestAnimationFrame(() => draw(-1.5));
  return view;
}

function roundRect(g, x, y, w, hgt, r) {
  if (w <= 0) return;
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + hgt, r);
  g.arcTo(x + w, y + hgt, x, y + hgt, r);
  g.arcTo(x, y + hgt, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}
