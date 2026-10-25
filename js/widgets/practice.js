// Practical-mode exercises: the app listens through the microphone and marks
// each note, chord or stroke as right or wrong.
import { h } from '../ui/dom.js';
import { toggleButton, checkbox, swaraLabel, swaraText, swaraWord } from '../ui/controls.js';
import { t } from '../i18n/i18n.js';
import { bolName } from '../i18n/names.js';
import { getCtx, click, chime } from '../audio/engine.js';
import { startListening, listenErrorMessage, playTake } from '../audio/listen.js';
import { detectPitch } from '../audio/pitch.js';
import { playSwara } from '../audio/voice.js';
import { playBol } from '../audio/tabla.js';
import { strumChord, pluck } from '../audio/guitar.js';
import { NoteTracker, median } from '../analysis/notes.js';
import { scoreRhythm } from '../analysis/rhythm.js';
import { syncModel, extraPositions } from '../analysis/sync.js';
import { syncMap } from './syncMap.js';
import { analyzeStroke, FAMILY_OF, STROKE_BEFORE, STROKE_AFTER } from '../analysis/strokes.js';
import { strumChroma, judgeChord, STRUM_SECONDS } from '../analysis/chroma.js';
import { CHORDS } from '../data/chords.js';
import { chordDiagram, parseTab } from './guitar.js';
import { store } from '../store.js';
import {
  parseSwara, tokenize, freqToMidi, midiName, noteFromFreq, swaraFromOffset, wrapOctave,
  GUITAR_OPEN, GUITAR_STRING_NAMES,
} from '../music.js';

const VOICE_RANGE = { minFreq: 70, maxFreq: 1100 };
const GUITAR_RANGE = { minFreq: 70, maxFreq: 1100 };
const sa = () => store.setting('saMidi');
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

// Shared frame: start/stop button, status line, result box, practice-time logging.
function shell(scope, { intro, start, onEnd }) {
  const status = h('div', { class: 'ex-status' }, intro);
  const result = h('div', { class: 'ex-result', hidden: true });
  let session = null;
  let startedAt = 0;
  let take = null;
  let stopReplay = null;

  const setStatus = (text, cls = '') => {
    status.textContent = text;
    status.className = `ex-status ${cls}`;
  };

  // Lets the learner hear what the microphone heard on their last attempt.
  const replay = h('button', {
    class: 'btn', hidden: true,
    onClick: () => {
      if (stopReplay) { stopReplay(); return; }
      replay.textContent = t('ex.stopPlayback');
      stopReplay = playTake(take, () => { stopReplay = null; replay.textContent = t('ex.hearAttempt'); });
    },
  }, t('ex.hearAttempt'));

  const end = () => {
    if (!session) return;
    const seconds = (performance.now() - startedAt) / 1000;
    if (seconds > 1) {
      take = session.take();
      replay.hidden = false;
    }
    session.stop();
    session = null;
    store.logSeconds(seconds);
    btn.setOn(false);
    onEnd?.();
  };

  const btn = toggleButton({
    startLabel: t('mic.start'),
    stopLabel: t('ctl.stop'),
    onStart: async () => {
      result.hidden = true;
      stopReplay?.();
      try {
        session = await start();
        startedAt = performance.now();
        return true;
      } catch (err) {
        setStatus(listenErrorMessage(err), 'bad');
        return false;
      }
    },
    onStop: end,
  });
  scope.onCleanup(() => { stopReplay?.(); end(); });

  const showResult = (score, passed, lines) => {
    setStatus(t('ex.finished'));
    result.hidden = false;
    result.className = `ex-result ${passed ? 'pass' : 'fail'}`;
    result.replaceChildren(
      h('div', { class: 'ex-score' }, passed ? t('ex.passed', { score }) : t('ex.failed', { score })),
      ...lines.filter(Boolean).map((l) => h('p', {}, l)));
    if (passed) chime();
  };

  return { status, result, btn, replay, setStatus, showResult, end, session: () => session };
}

// Live readout of the swara being sung.
function liveVoice() {
  const name = h('span', { class: 'live-swara' }, '–');
  const detail = h('span', { class: 'muted small' }, '');
  const el = h('div', { class: 'live-voice dim' }, h('span', { class: 'muted small' }, t('ex.hearing')), name, detail);
  return {
    el,
    update(f) {
      const off = freqToMidi(f) - sa();
      const sw = swaraFromOffset(off);
      el.classList.remove('dim');
      name.replaceChildren(swaraLabel(sw));
      detail.textContent = ` ${noteFromFreq(f).name} · ${sw.cents > 0 ? '+' : ''}${sw.cents}¢`;
    },
    clear() { el.classList.add('dim'); },
  };
}

function resultChip(content) {
  const note = h('small', { class: 'chip-note' }, '');
  const el = h('span', { class: 'note-chip' }, content, note);
  return {
    el,
    set(state, text = '') {
      el.classList.remove('on', 'ok', 'bad');
      if (state) el.classList.add(state);
      note.textContent = text;
    },
  };
}

// ---------- Singing ----------

export function hold(ex, scope, report) {
  const target = ex.note ? parseSwara(ex.note) : null;
  const seconds = ex.seconds || 3;
  const live = liveVoice();
  const fill = h('div', { class: 'bar-fill' });
  let run = null;
  let silent = 0;

  const s = shell(scope, {
    intro: target ? t('hold.introNote', { name: swaraWord(target), n: seconds }) : t('hold.intro', { n: seconds }),
    start: () => startListening({ pitchRange: VOICE_RANGE, onPitch }),
    onEnd: () => { run = null; fill.style.width = '0%'; live.clear(); },
  });

  function finish() {
    const ref = median(run.midis);
    const wobble = Math.sqrt(run.midis.slice(3).reduce((acc, m) => acc + ((m - ref) * 100) ** 2, 0) / Math.max(1, run.midis.length - 3));
    const score = Math.max(50, Math.min(100, Math.round(110 - wobble)));
    const heard = swaraText(ref - sa());
    s.end();
    s.showResult(score, true, [
      t('hold.held', { name: heard, note: midiName(ref), n: seconds }),
      wobble <= 15 ? t('hold.steady') : t('hold.wobble', { n: Math.round(wobble) }),
    ]);
    report(score, true);
  }

  function onPitch(f, t) {
    if (f < 0) {
      if (run && ++silent > 4) {
        run = null;
        fill.style.width = '0%';
        s.setStatus(t('hold.stopped'), 'warn');
      }
      if (!run) live.clear();
      return;
    }
    silent = 0;
    live.update(f);
    const m = freqToMidi(f);
    if (target) {
      const cents = wrapOctave(m - sa() - target.semitone) * 100;
      if (Math.abs(cents) > 50) {
        run = null;
        fill.style.width = '0%';
        s.setStatus(Math.abs(cents) > 150 ? t('hold.wrongNote', { heard: swaraText(m - sa()), name: swaraWord(target) }) : cents < 0 ? t('ex.low') : t('ex.high'), 'warn');
        return;
      }
    }
    if (run && Math.abs(m - median(run.midis.slice(-15))) > 0.5) {
      run = null;
      s.setStatus(t('hold.moved'), 'warn');
    }
    if (!run) run = { start: t, midis: [] };
    run.midis.push(m);
    const p = (t - run.start) / seconds;
    fill.style.width = `${Math.min(100, p * 100)}%`;
    s.setStatus(t('hold.keep'), 'good');
    if (p >= 1) finish();
  }

  return h('div', { class: 'widget exercise' },
    s.status, live.el, h('div', { class: 'bar hold' }, fill),
    h('div', { class: 'controls' },
      s.btn, s.replay,
      target && h('button', { class: 'btn', onClick: () => playSwara(target.semitone, getCtx().currentTime + 0.02, 1.5) }, t('hold.hear', { name: swaraWord(target) }))),
    s.result);
}

export function range(ex, scope, report) {
  const seconds = ex.seconds || 15;
  const need = ex.minSemitones || 7;
  const live = liveVoice();
  const lowEl = h('b', {}, '–');
  const highEl = h('b', {}, '–');
  const timeEl = h('span', { class: 'muted small' }, '');
  let recent = [];
  let lo = null;
  let hi = null;
  let startT = null;

  const s = shell(scope, {
    intro: t('range.intro'),
    start: () => {
      recent = []; lo = null; hi = null; startT = null;
      lowEl.textContent = '–'; highEl.textContent = '–';
      return startListening({ pitchRange: VOICE_RANGE, onPitch });
    },
    onEnd: () => { live.clear(); evaluate(); },
  });

  function evaluate() {
    if (lo == null) {
      s.setStatus(t('range.noVoice'), 'bad');
      return;
    }
    const span = Math.round(hi - lo);
    const passed = span >= need;
    const score = Math.min(100, pct(span, need));
    s.showResult(score, passed, [
      t(span >= 12 ? 'range.resultOctave' : 'range.result', { low: midiName(lo), high: midiName(hi), n: span }),
      passed ? t('range.good') : t('range.more', { n: need }),
    ]);
    report(score, passed);
  }

  function onPitch(f, t) {
    if (f < 0) { recent = []; live.clear(); return; }
    live.update(f);
    startT ??= t;
    recent.push(freqToMidi(f));
    if (recent.length > 5) recent.shift();
    // Only count pitches held for a few frames, so glitches don't stretch the range.
    if (recent.length === 5 && Math.max(...recent) - Math.min(...recent) < 0.6) {
      const m = median(recent);
      lo = lo == null ? m : Math.min(lo, m);
      hi = hi == null ? m : Math.max(hi, m);
      lowEl.textContent = midiName(lo);
      highEl.textContent = midiName(hi);
    }
    const left = Math.ceil(seconds - (t - startT));
    timeEl.textContent = ` ${t('range.left', { n: Math.max(0, left) })}`;
    if (left <= 0) s.end();
  }

  return h('div', { class: 'widget exercise' },
    s.status, live.el,
    h('p', { class: 'range-readout' }, t('range.lowest'), lowEl, ` · ${t('range.highest')}`, highEl, timeEl),
    h('div', { class: 'controls' }, s.btn, s.replay),
    s.result);
}

export function sing(ex, scope, report) {
  const targets = tokenize(ex.notes).map(parseSwara).filter(Boolean);
  const chips = targets.map((sw) => resultChip(swaraLabel(sw)));
  const live = liveVoice();
  let results = [];
  let tracker = null;
  let lastMidi = null;
  let active = false;

  const highlight = () => chips.forEach((c, k) => {
    const r = results[k];
    if (r) c.set(r.ok ? 'ok' : 'bad', r.ok ? '✓' : r.heard);
    else c.set(k === results.length && active ? 'on' : '');
  });

  const s = shell(scope, {
    intro: t('sing.intro'),
    start: async () => {
      results = []; lastMidi = null; tracker = new NoteTracker();
      const session = await startListening({ pitchRange: VOICE_RANGE, onPitch });
      active = true;
      s.setStatus(t('sing.sing', { name: swaraWord(targets[0]) }), '');
      highlight();
      return session;
    },
    onEnd: () => { active = false; live.clear(); highlight(); },
  });

  function onPitch(f, t) {
    if (f < 0) { live.clear(); tracker.frame(null, t); return; }
    live.update(f);
    const note = tracker.frame(freqToMidi(f), t);
    if (note) onNote(note.midi);
  }

  function onNote(midi) {
    const k = results.length;
    if (k >= targets.length) return;
    const target = targets[k];
    // Re-sounding the note we just counted is not a new note — unless the next target repeats it.
    const repeatExpected = k > 0 && Math.abs(wrapOctave(target.semitone - targets[k - 1].semitone)) < 0.5;
    if (lastMidi !== null && !repeatExpected && Math.abs(midi - lastMidi) < 0.5) return;
    lastMidi = midi;
    const off = midi - sa();
    const cents = Math.round(wrapOctave(off - target.semitone) * 100);
    const ok = Math.abs(cents) <= 40;
    results.push({ ok, heard: ok ? '' : swaraText(off), cents });
    highlight();
    if (results.length < targets.length) {
      s.setStatus(ok ? t('sing.nextOk', { name: swaraWord(targets[results.length]) }) : t('sing.nextBad', { heard: swaraText(off), name: swaraWord(targets[results.length]) }), ok ? 'good' : 'warn');
      return;
    }
    s.end();
    const correct = results.filter((r) => r.ok).length;
    const score = pct(correct, targets.length);
    const wrong = results.map((r, i) => (r.ok ? null : t('sing.youSang', { name: swaraWord(targets[i]), heard: r.heard }))).filter(Boolean);
    s.showResult(score, score >= 80, [
      t('sing.result', { n: correct, total: targets.length }),
      wrong.length ? t('sing.practise', { list: wrong.join(', ') }) : t('sing.perfect'),
    ]);
    report(score, score >= 80);
  }

  const hearIt = () => {
    const t0 = getCtx().currentTime + 0.05;
    targets.forEach((sw, i) => playSwara(sw.semitone, t0 + i * 0.7, 0.62));
    const session = s.session();
    if (session) session.muteUntil(t0 + targets.length * 0.7 + session.latency + 0.3);
  };

  return h('div', { class: 'widget exercise' },
    h('div', { class: 'notes' }, h('div', { class: 'note-group' }, chips.map((c) => c.el))),
    s.status, live.el,
    h('div', { class: 'controls' }, s.btn, s.replay, h('button', { class: 'btn', onClick: hearIt }, t('common.hearIt')), h('span', { class: 'badge' }, t('sa.badge', { note: midiName(sa()) }))),
    s.result);
}

// ---------- Guitar ----------

// Median pitch of a plucked note, measured shortly after its onset.
function pluckedPitch(rec, idx, sr) {
  const seg = rec.slice(idx + Math.round(0.05 * sr), Math.round(0.27 * sr));
  const found = [];
  for (let start = 0; start + 2048 <= seg.length; start += 512) {
    const f = detectPitch(seg.subarray(start, start + 2048), sr, GUITAR_RANGE);
    if (f > 0) found.push(f);
  }
  return found.length >= 2 ? median(found) : -1;
}
const PLUCK_WAIT = 0.33;

// Compares a heard frequency with an expected MIDI note (an octave slip counts as the note).
function judgeNote(f, expected, tolerance) {
  const diff = freqToMidi(f) - expected;
  const octaves = Math.round(diff / 12);
  const cents = Math.round((diff - 12 * octaves) * 100);
  const right = Math.abs(octaves) <= 1 && Math.abs(cents) <= 50;
  const ok = right && (tolerance == null || Math.abs(cents) <= tolerance);
  const n = noteFromFreq(f);
  return { ok, right, cents, heard: `${n.name}${n.octave}` };
}

function noteChecker({ expected, labels, tolerance, hints, onDone, setStatus, chips, mutedCounts = false }) {
  let results = [];
  let last = -Infinity;
  return {
    reset() { results = []; last = -Infinity; },
    results: () => results,
    onset(session, idx, t) {
      if (t - last < 0.15 || results.length >= expected.length) return;
      last = t;
      const { rec } = session;
      rec.when(idx + Math.round(PLUCK_WAIT * rec.sr), () => {
        const k = results.length;
        if (k >= expected.length) return;
        const f = pluckedPitch(rec, idx, rec.sr);
        let r;
        if (f < 0) {
          if (!mutedCounts) return;  // a knock or fret noise: ignore
          r = { ok: false, text: t('notes.mutedShort'), message: t('notes.muted', { label: labels[k], hint: hints?.[k] || '' }) };
        } else {
          const j = judgeNote(f, expected[k], tolerance);
          const flat = j.cents < 0 ? t('notes.flat') : t('notes.sharp');
          r = {
            ok: j.ok,
            text: j.ok ? '✓' : j.right ? `${j.cents > 0 ? '+' : ''}${j.cents}¢` : j.heard,
            message: j.ok
              ? (Math.abs(j.cents) > 15 ? t('notes.okSlightly', { label: labels[k], dir: flat }) : t('notes.ok', { label: labels[k] }))
              : j.right
                ? t('notes.outOfTune', { label: labels[k], n: Math.abs(j.cents), dir: flat })
                : t('notes.wrong', { label: labels[k], heard: j.heard, expected: midiName(expected[k]), hint: hints?.[k] || '' }),
          };
        }
        results.push(r);
        chips[k].set(r.ok ? 'ok' : 'bad', r.text);
        if (chips[k + 1]) chips[k + 1].set('on');
        setStatus(r.message, r.ok ? 'good' : 'warn');
        if (results.length === expected.length) onDone(results);
      });
    },
  };
}

export function notes(ex, scope, report) {
  const cols = parseTab(ex.notes).filter((c) => c.length);
  const expected = cols.map(([n]) => GUITAR_OPEN[6 - n.s] + n.f);
  const labels = cols.map(([n]) => (n.f === 0 ? t('notes.stringOpen', { s: n.s }) : t('notes.stringFret', { s: n.s, f: n.f })));
  const chips = cols.map(([n]) => resultChip(h('span', {}, `${n.s}·${n.f}`)));
  let checker;

  const s = shell(scope, {
    intro: t('notes.intro'),
    start: async () => {
      checker.reset();
      chips.forEach((c, k) => c.set(k === 0 ? 'on' : ''));
      return startListening({ onOnset: (idx, t) => checker.onset(s.session(), idx, t) });
    },
  });

  checker = noteChecker({
    expected, labels, chips, tolerance: ex.tolerance, setStatus: s.setStatus,
    onDone: (results) => {
      s.end();
      const correct = results.filter((r) => r.ok).length;
      const score = pct(correct, results.length);
      s.showResult(score, score >= 80, [
        t('notes.result', { n: correct, total: results.length }),
        ...results.filter((r) => !r.ok).map((r) => r.message),
      ]);
      report(score, score >= 80);
    },
  });

  const demo = () => {
    const t0 = getCtx().currentTime + 0.05;
    expected.forEach((m, i) => pluck(m, t0 + i * 0.5, { string: 6 - cols[i][0].s, gain: 0.55 }));
  };

  return h('div', { class: 'widget exercise' },
    h('div', { class: 'notes' }, h('div', { class: 'note-group' }, chips.map((c) => c.el))),
    h('p', { class: 'muted small' }, t('notes.legend')),
    s.status,
    h('div', { class: 'controls' }, s.btn, s.replay, h('button', { class: 'btn', onClick: demo }, t('common.hearIt'))),
    s.result);
}

const chordNotes = (name) => CHORDS[name].frets.map((f, i) => (f < 0 ? null : { string: i, midi: GUITAR_OPEN[i] + f, fret: f, finger: CHORDS[name].fingers[i] })).filter(Boolean);
const CANDIDATES = Object.entries(CHORDS).map(([name, c]) => ({ name, label: c.name, midis: chordNotes(name).map((n) => n.midi) }));

export function chord(ex, scope, report) {
  const name = ex.chord;
  const ch = CHORDS[name];
  let mode = 'strum';
  const strumChips = [1, 2, 3].map((n) => resultChip(h('span', {}, t('chord.strumN', { n }))));
  const strings = chordNotes(name);
  const stringChips = strings.map((n) => resultChip(h('span', {}, `${6 - n.string} ${GUITAR_STRING_NAMES[n.string]}`)));
  let strumResults = [];
  let lockUntil = 0;
  let checker;

  const s = shell(scope, {
    intro: t('chord.intro', { name: ch.name }),
    start: async () => {
      strumResults = []; lockUntil = 0; checker.reset();
      strumChips.forEach((c, k) => c.set(k === 0 ? 'on' : ''));
      stringChips.forEach((c, k) => c.set(k === 0 ? 'on' : ''));
      s.setStatus(mode === 'strum' ? t('chord.strumNow', { name: ch.name }) : t('chord.pickFirst', { s: 6 - strings[0].string }));
      return startListening({ onOnset });
    },
  });

  function onOnset(idx, t) {
    if (mode === 'strings') { checker.onset(s.session(), idx, t); return; }
    if (t < lockUntil || strumResults.length >= 3) return;
    lockUntil = t + 0.9;
    const { rec } = s.session();
    rec.when(idx + Math.round(STRUM_SECONDS * rec.sr), () => {
      const k = strumResults.length;
      if (k >= 3) return;
      const j = judgeChord(strumChroma(rec.slice(idx, Math.round(STRUM_SECONDS * rec.sr)), rec.sr), name, CANDIDATES, rec.sr);
      strumResults.push(j);
      strumChips[k].set(j.ok ? 'ok' : 'bad', j.ok ? '✓' : `${j.heard}?`);
      if (strumChips[k + 1]) strumChips[k + 1].set('on');
      s.setStatus(j.ok ? t('chord.right', { name: ch.name }) : t('chord.wrong', { heard: j.heard }), j.ok ? 'good' : 'warn');
      if (strumResults.length === 3) {
        s.end();
        const correct = strumResults.filter((r) => r.ok).length;
        const score = pct(correct, 3);
        s.showResult(score, correct >= 2, [
          t('chord.result', { n: correct, name: ch.name }),
          correct >= 2 ? t('chord.tipPass') : t('chord.tipFail'),
        ]);
        report(score, correct >= 2);
      }
    });
  }

  const hints = strings.map((n) => (n.fret === 0
    ? t('chord.hintOpen')
    : t('chord.hintFret', { fret: n.fret, finger: n.finger || 1 })));

  checker = noteChecker({
    expected: strings.map((n) => n.midi),
    labels: strings.map((n) => t('chord.stringLabel', { s: 6 - n.string, name: GUITAR_STRING_NAMES[n.string] })),
    hints, chips: stringChips, mutedCounts: true, setStatus: s.setStatus,
    onDone: (results) => {
      s.end();
      const correct = results.filter((r) => r.ok).length;
      const score = pct(correct, results.length);
      s.showResult(score, score >= 80, [
        t('chord.stringsResult', { n: correct, total: results.length }),
        ...results.filter((r) => !r.ok).map((r) => r.message),
      ]);
      report(score, score >= 80);
    },
  });

  const strumRow = h('div', { class: 'notes' }, h('div', { class: 'note-group' }, strumChips.map((c) => c.el)));
  const stringRow = h('div', { class: 'notes', hidden: true }, h('div', { class: 'note-group' }, stringChips.map((c) => c.el)));
  const modeSwitch = h('div', { class: 'segmented', role: 'group', 'aria-label': 'Check mode' },
    [['strum', t('chord.strumCheck')], ['strings', t('guitar.stringByString')]].map(([id, label]) => h('button', {
      class: `seg${id === mode ? ' on' : ''}`,
      onClick: (e) => {
        s.end();
        mode = id;
        [...e.target.parentNode.children].forEach((b) => b.classList.toggle('on', b === e.target));
        strumRow.hidden = mode !== 'strum';
        stringRow.hidden = mode !== 'strings';
        s.setStatus(mode === 'strum'
          ? t('chord.intro', { name: ch.name })
          : t('chord.stringsIntro'));
      },
    }, label)));

  return h('div', { class: 'widget exercise' },
    h('div', { class: 'strum-layout' }, h('div', { class: 'mini-diagram' }, chordDiagram(ch)), h('div', { class: 'grow' }, modeSwitch, strumRow, stringRow)),
    s.status,
    h('div', { class: 'controls' }, s.btn, s.replay, h('button', { class: 'btn', onClick: () => strumChord(ch) }, t('common.hearIt'))),
    s.result);
}

export function changes(ex, scope, report) {
  const order = Array.from({ length: ex.rounds || 1 }, () => ex.chords).flat();
  const chips = order.map((c) => resultChip(h('span', {}, CHORDS[c].name)));
  const big = h('div', { class: 'change-current' });
  let results = [];
  let lockUntil = 0;

  const show = () => {
    const k = results.length;
    chips.forEach((c, i) => { if (i >= k) c.set(i === k ? 'on' : ''); });
    if (k < order.length) {
      big.replaceChildren(
        h('div', { class: 'change-name' }, CHORDS[order[k]].name),
        h('div', { class: 'mini-diagram' }, chordDiagram(CHORDS[order[k]])),
        order[k + 1] ? h('div', { class: 'muted small' }, t('changes.then', { name: CHORDS[order[k + 1]].name })) : null);
    }
  };
  show();

  const s = shell(scope, {
    intro: t('changes.intro'),
    start: async () => {
      results = []; lockUntil = 0;
      chips.forEach((c) => c.set(''));
      show();
      s.setStatus(t('changes.strum', { name: CHORDS[order[0]].name }));
      return startListening({ onOnset });
    },
  });

  function onOnset(idx, t) {
    if (t < lockUntil || results.length >= order.length) return;
    lockUntil = t + 1.0;
    const { rec } = s.session();
    rec.when(idx + Math.round(STRUM_SECONDS * rec.sr), () => {
      const k = results.length;
      if (k >= order.length) return;
      const j = judgeChord(strumChroma(rec.slice(idx, Math.round(STRUM_SECONDS * rec.sr)), rec.sr), order[k], CANDIDATES, rec.sr);
      results.push(j);
      chips[k].set(j.ok ? 'ok' : 'bad', j.ok ? '✓' : `${j.heard}?`);
      if (results.length < order.length) {
        s.setStatus(j.ok ? t('changes.nowOk', { name: CHORDS[order[k + 1]].name }) : t('changes.nowBad', { heard: j.heard, name: CHORDS[order[k + 1]].name }), j.ok ? 'good' : 'warn');
        show();
        return;
      }
      s.end();
      const correct = results.filter((r) => r.ok).length;
      const score = pct(correct, order.length);
      const missed = [...new Set(order.filter((c, i) => !results[i].ok).map((c) => CHORDS[c].name))];
      s.showResult(score, score >= 75, [
        t('changes.result', { n: correct, total: order.length }),
        missed.length ? t('changes.workOn', { list: missed.join(', ') }) : t('changes.clean'),
      ]);
      report(score, score >= 75);
    });
  }

  return h('div', { class: 'widget exercise' },
    h('div', { class: 'notes' }, h('div', { class: 'note-group' }, chips.map((c) => c.el))),
    big, s.status,
    h('div', { class: 'controls' }, s.btn, s.replay),
    s.result);
}

// ---------- Rhythm (tabla and strumming) ----------

const RHYTHM_PASS = 75;

export function rhythm(ex, scope, report) {
  const isPattern = Boolean(ex.pattern);
  const tokens = isPattern ? ex.pattern.split('') : tokenize(ex.bols);
  const slots = tokens.map((tok) => tok !== '-');
  const perBeat = ex.perBeat || (isPattern ? 2 : 1);
  const bpm = ex.bpm || 60;
  const beat = 60 / bpm;
  const slotDur = beat / perBeat;
  const canCheckSounds = !isPattern && tokens.some((tok) => FAMILY_OF[tok.toLowerCase()]);
  let checkSounds = canCheckSounds;

  const chips = tokens.map((tok) => resultChip(h('span', {}, isPattern ? ({ D: '↓', U: '↑', '-': '·' }[tok]) : bolName(tok))));
  chips.forEach((c, i) => { if (!slots[i]) c.el.classList.add('hold'); });
  const groups = [];
  for (let i = 0; i < chips.length; i += perBeat * 4) groups.push(h('div', { class: 'note-group' }, chips.slice(i, i + perBeat * 4).map((c) => c.el)));
  const countEl = h('div', { class: 'count-in' }, '');
  let timers = [];
  let onsets = [];

  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const at = (ctxTime, fn) => timers.push(setTimeout(fn, Math.max(0, (ctxTime - getCtx().currentTime) * 1000)));

  const s = shell(scope, {
    intro: t('rhythm.intro', { bpm }),
    start: async () => {
      onsets = [];
      chips.forEach((c) => c.set(''));
      const session = await startListening({ onOnset: (idx, t) => onsets.push({ idx, t }) });
      const ctx = getCtx();
      const t0 = ctx.currentTime + 0.5;
      const L = session.latency;
      for (let i = 0; i < 4; i++) {
        click(t0 + i * beat, i === 0);
        at(t0 + i * beat + L, () => { countEl.textContent = String(4 - i); s.setStatus(t('rhythm.ready')); });
      }
      const start = t0 + 4 * beat;
      at(start + L, () => { countEl.textContent = '▶'; s.setStatus(t('rhythm.play'), 'good'); });
      tokens.forEach((_, k) => at(start + k * slotDur + L, () => chips.forEach((c, i) => c.el.classList.toggle('on', i === k))));
      const endT = start + tokens.length * slotDur + Math.max(0.7, beat) + L;
      at(endT, () => evaluate(session, start + L, endT));
      return session;
    },
    onEnd: () => { clearTimers(); countEl.textContent = ''; chips.forEach((c) => c.el.classList.remove('on')); },
  });

  function evaluate(session, start, endT) {
    const { rec } = session;
    const sr = rec.sr;
    // Strokes after the last expected one (the learner carrying on) don't count as extras.
    const last = start + (tokens.length - 0.5) * slotDur;
    const heard = onsets.filter((o) => o.t >= start - 0.5 * slotDur && o.t <= last);
    s.end();
    countEl.textContent = '';
    if (!heard.length) {
      s.setStatus(t('rhythm.nothing'), 'bad');
      return;
    }
    const scored = scoreRhythm(heard.map((o) => o.t), slots, slotDur);
    let correct = 0;
    const problems = { early: 0, late: 0, missed: 0, sound: 0 };
    const soundHints = {};
    const states = {};
    scored.results.forEach((r) => {
      const token = tokens[r.slot];
      let state = r.status;
      let text = r.status === 'ok' ? '✓' : t(`rhythm.${r.status}`);
      if (r.status !== 'missed' && checkSounds) {
        const want = FAMILY_OF[token.toLowerCase()];
        if (want) {
          const o = heard[r.onset];
          const next = heard[r.onset + 1];
          const length = next ? next.idx - o.idx : Math.round(STROKE_AFTER * sr);
          const a = analyzeStroke(rec.slice(o.idx - Math.round(STROKE_BEFORE * sr), Math.round((STROKE_BEFORE + STROKE_AFTER) * sr)), sr, length);
          if (a.certain && a.family !== want) {
            state = 'sound';
            text = `≈${bolName({ both: 'Dha', bayan: 'Ge', dayan: 'Na', closed: 'Ti', slap: 'Ke' }[a.family])}`;
            soundHints[token] = a.family;
          }
        }
      }
      states[r.slot] = state;
      if (state === 'ok') correct++;
      else problems[state]++;
      chips[r.slot].set(state === 'ok' ? 'ok' : 'bad', text);
    });
    const expectedCount = scored.results.length;
    const extras = scored.extras.length;
    const score = pct(correct, expectedCount + extras);
    const passed = score >= RHYTHM_PASS;
    const played = Math.round(bpm * scored.tempoRatio);
    const tips = [];
    if (problems.missed) tips.push(t('rhythm.tipMissed', { n: problems.missed }));
    if (problems.late > problems.early && problems.late > 1) tips.push(t('rhythm.tipLate'));
    if (problems.early > problems.late && problems.early > 1) tips.push(t('rhythm.tipEarly'));
    for (const [token, fam] of Object.entries(soundHints)) {
      tips.push(t('rhythm.tipSound', { bol: bolName(token), heard: t(`family.${fam}`), want: t(`family.${FAMILY_OF[token.toLowerCase()]}`) }));
    }
    if (extras) tips.push(t('rhythm.tipExtra', { n: extras }));
    s.showResult(score, passed, [
      t('rhythm.result', { n: correct, total: expectedCount, played, bpm }),
      ...tips,
    ]);
    s.result.append(syncMap(
      syncModel(scored, slots, perBeat, states),
      extraPositions(heard.map((o) => o.t), scored, slots, perBeat), perBeat));
    report(score, passed);
  }

  const demo = () => {
    const t0 = getCtx().currentTime + 0.1;
    tokens.forEach((tok, k) => {
      const t = t0 + k * slotDur;
      if (isPattern) {
        if (tok !== '-') strumChord(CHORDS.Em, t, tok);
      } else if (tok === 'X') {
        playBol('Na', t);
      } else if (tok !== '-') {
        playBol(tok, t);
      }
    });
  };

  return h('div', { class: 'widget exercise' },
    h('div', { class: 'rhythm-head' }, h('div', { class: 'notes' }, groups), countEl),
    h('p', { class: 'muted small' }, t(perBeat === 1 ? 'rhythm.legend1' : 'rhythm.legendN', { bpm, n: perBeat })),
    s.status,
    h('div', { class: 'controls' },
      s.btn, s.replay,
      h('button', { class: 'btn', onClick: demo }, t('common.hearIt')),
      canCheckSounds && checkbox(t('rhythm.checkSounds'), checkSounds, (v) => { checkSounds = v; })),
    s.result);
}
