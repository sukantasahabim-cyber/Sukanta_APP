// Music Studio: compose on a grid — two melody parts, tabla (a taal's theka
// or your own beat) and a tanpura drone — then play, save, share, download,
// sing over it or practise singing it.
import { h, toast } from '../ui/dom.js';
import { toggleButton, checkbox, tempoControl, swaraLabel, swaraWord } from '../ui/controls.js';
import { t } from '../i18n/i18n.js';
import { bolName, taalName } from '../i18n/names.js';
import { getCtx } from '../audio/engine.js';
import { playBol } from '../audio/tabla.js';
import { playInstrument } from '../audio/instruments.js';
import { createPlayer, renderComposition } from '../audio/composition.js';
import { saveAudio } from '../audio/takes.js';
import { setPendingTrack } from '../audio/pending.js';
import { TAALS } from '../data/taals.js';
import { newSongId } from '../data/mysongs.js';
import {
  STEPS_PER_BEAT, LENGTHS, NOTE_LENGTHS, INSTRUMENTS, DRUM_ROWS, SCALES,
  rowsFor, tokenOf, totalSteps, newComposition, noteAt, toggleNote, toggleDrum,
  setLength, gridFromTheka, toMySong, encodeShare, decodeShare, exampleCompositions,
} from '../data/compose.js';
import { parseSwara, midiName } from '../music.js';
import { store } from '../store.js';

const EXAMPLE_KEYS = { 'example-morning': 'composer.ex.morning', 'example-dance': 'composer.ex.dance', 'example-beat': 'composer.ex.beat' };
const titleOf = (c) => c.title?.trim() || t('composer.untitled');
const slug = (name) => name.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'composition';

// ---------- List ----------

export function studioListView() {
  const mine = store.compositions();
  const open = (c) => {
    store.saveComposition(c);
    location.hash = `#/studio/${c.id}`;
  };
  return h('div', { class: 'container c-studio' },
    h('h1', {}, `🎼 ${t('composer.title')}`),
    h('p', { class: 'muted' }, t('composer.intro')),
    h('div', { class: 'controls' },
      h('button', { class: 'btn btn-primary', type: 'button', onClick: () => open(newComposition()) }, t('composer.new'))),
    h('h2', { class: 'section-title' }, t('composer.mine')),
    mine.length
      ? h('ul', { class: 'song-list' }, mine.map((c) => h('li', {},
        h('a', { class: 'song-card', href: `#/studio/${c.id}` },
          h('span', { class: 'song-icon', 'aria-hidden': 'true' }, '🎼'),
          h('span', { class: 'song-main' }, h('b', {}, titleOf(c)),
            h('span', { class: 'small muted' }, `${t('composer.beats', { n: c.beats })} · ${t(`composer.scale.${c.scale}`)}`)),
          h('span', { class: 'resume-go', 'aria-hidden': 'true' }, '▶')))))
      : h('p', { class: 'muted small' }, t('composer.none')),
    h('h2', { class: 'section-title' }, t('composer.examples')),
    h('ul', { class: 'song-list' }, exampleCompositions().map((ex) => h('li', {},
      h('button', {
        class: 'song-card', type: 'button',
        onClick: () => open({ ...ex, id: newComposition().id, title: t(EXAMPLE_KEYS[ex.id]) }),
      },
      h('span', { class: 'song-icon', 'aria-hidden': 'true' }, '✨'),
      h('span', { class: 'song-main' }, h('b', {}, t(EXAMPLE_KEYS[ex.id])),
        h('span', { class: 'small muted' }, `${t('composer.beats', { n: ex.beats })} · ${t(`composer.scale.${ex.scale}`)}`)),
      h('span', { class: 'resume-go', 'aria-hidden': 'true' }, '＋'))))));
}

// ---------- Editor ----------

export function studioEditView(scope, id) {
  const saved = store.composition(id);
  if (!saved) { location.replace('#/studio'); return h('div'); }
  return editor(scope, JSON.parse(JSON.stringify(saved)), false);
}

export function studioSharedView(scope, data) {
  const c = decodeShare(data);
  if (!c) {
    return h('div', { class: 'container c-studio' },
      h('a', { class: 'back', href: '#/studio' }, t('composer.back')),
      h('p', { class: 'ex-result fail' }, t('composer.badLink')));
  }
  return editor(scope, c, true);
}

function editor(scope, initial, shared) {
  let comp = initial;
  let isShared = shared;
  let tab = 'melody';
  let noteLen = STEPS_PER_BEAT;
  const history = [];
  let saveTimer = 0;
  const sa = () => store.setting('saMidi');

  const savedNote = h('span', { class: 'small muted', role: 'status' }, isShared ? '' : t('composer.saved'));
  const persist = () => {
    if (isShared) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { store.saveComposition(comp); savedNote.textContent = t('composer.saved'); }, 300);
  };
  scope.onCleanup(() => { if (!isShared) { clearTimeout(saveTimer); store.saveComposition(comp); } });

  // Every change goes through here: it can be undone and is saved.
  const change = (next, redraw = true) => {
    history.push(comp);
    if (history.length > 60) history.shift();
    comp = next;
    undoBtn.disabled = false;
    persist();
    if (redraw) render();
  };
  const undoBtn = h('button', {
    class: 'btn', type: 'button', disabled: true,
    onClick: () => {
      if (!history.length) return;
      comp = history.pop();
      undoBtn.disabled = !history.length;
      persist();
      render();
    },
  }, t('composer.undo'));

  // ---------- Playback ----------
  const player = createPlayer({
    get: () => comp,
    saMidi: sa,
    onStep: (step) => {
      gridBox.querySelectorAll('.now').forEach((el) => el.classList.remove('now'));
      gridBox.querySelectorAll(`[data-step="${step}"]`).forEach((el) => el.classList.add('now'));
    },
  });
  const playBtn = toggleButton({ onStart: () => player.start(), onStop: () => stopPlaying() });
  const stopPlaying = () => {
    player.stop();
    playBtn.setOn?.(false);
    gridBox.querySelectorAll('.now').forEach((el) => el.classList.remove('now'));
  };
  scope.onCleanup(stopPlaying);

  // ---------- Settings ----------
  const titleInput = h('input', {
    class: 'input studio-title', value: comp.title, placeholder: t('composer.untitled'), 'aria-label': t('composer.name'),
    onChange: (e) => change({ ...comp, title: e.target.value.slice(0, 80) }, false),
  });
  const keyLabel = h('span', { class: 'badge' }, t('sa.badge', { note: midiName(sa()) }));
  const setKey = (d) => {
    const v = Math.max(43, Math.min(72, sa() + d));
    store.setSetting('saMidi', v);
    keyLabel.textContent = t('sa.badge', { note: midiName(v) });
  };
  const select = (label, value, options, onChange) => h('label', { class: 'field' },
    h('span', { class: 'small' }, label),
    h('select', { class: 'select', onChange: (e) => onChange(e.target.value) },
      options.map(([v, text]) => h('option', { value: v, selected: String(v) === String(value) }, text))));

  const settings = h('div', { class: 'studio-settings' });
  function renderSettings() {
    settings.replaceChildren(
      h('div', { class: 'controls' }, playBtn, undoBtn),
      tempoControl({ value: comp.bpm, min: 40, max: 200, onChange: (v) => { comp = { ...comp, bpm: v }; persist(); } }),
      h('div', { class: 'controls' },
        h('span', { class: 'small' }, t('sing.key')),
        h('button', { class: 'btn btn-sm', type: 'button', 'aria-label': t('sing.keyDown'), onClick: () => setKey(-1) }, '−'),
        keyLabel,
        h('button', { class: 'btn btn-sm', type: 'button', 'aria-label': t('sing.keyUp'), onClick: () => setKey(1) }, '+'),
        checkbox(t('composer.tanpura'), comp.tanpura, (v) => {
          change({ ...comp, tanpura: v }, false);
          if (player.playing) { player.stop(); player.start(); }
        })),
      h('div', { class: 'field-row' },
        select(t('composer.length'), comp.beats, LENGTHS.map((n) => [n, t('composer.beats', { n })]), (v) => change(setLength(comp, Number(v)))),
        select(t('composer.scale'), comp.scale, Object.keys(SCALES).map((s) => [s, t(`composer.scale.${s}`)]), (v) => change({ ...comp, scale: v }))));
  }

  // ---------- Parts ----------
  const tabs = h('div', { class: 'segmented', role: 'group', 'aria-label': t('composer.parts') });
  const panel = h('div', { class: 'studio-panel' });
  const gridBox = h('div', { class: 'studio-grid-wrap' });

  function renderTabs() {
    tabs.replaceChildren(...[['melody', 'composer.tabMelody'], ['second', 'composer.tabSecond'], ['rhythm', 'composer.tabRhythm']].map(([k, key]) => h('button', {
      class: `seg${tab === k ? ' on' : ''}`, type: 'button', 'aria-pressed': String(tab === k),
      onClick: () => { tab = k; render(); },
    }, t(key))));
  }

  function renderPanel() {
    if (tab === 'rhythm') {
      const r = comp.rhythm;
      const taal = TAALS[r.taal];
      const modeBtns = h('div', { class: 'segmented', role: 'group', 'aria-label': t('composer.rhythmMode') },
        [['off', 'composer.rhythmOff'], ['theka', 'composer.rhythmTheka'], ['grid', 'composer.rhythmGrid']].map(([m, key]) => h('button', {
          class: `seg${r.mode === m ? ' on' : ''}`, type: 'button', 'aria-pressed': String(r.mode === m),
          onClick: () => change({ ...comp, rhythm: { ...r, mode: m } }),
        }, t(key))));
      panel.replaceChildren(...[
        modeBtns,
        r.mode !== 'off' && h('div', { class: 'field-row' },
          select(t('composer.taal'), r.taal, Object.entries(TAALS).map(([tid, tl]) => [tid, `${taalName(tid, tl.name)} (${tl.matras})`]), (v) => change({ ...comp, rhythm: { ...r, taal: v } })),
          h('label', { class: 'field' }, h('span', { class: 'small' }, t('composer.volume')),
            h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: r.volume, onChange: (e) => change({ ...comp, rhythm: { ...r, volume: Number(e.target.value) } }, false) }))),
        r.mode === 'theka' && h('p', { class: 'small muted' }, t('composer.thekaHelp', { taal: taalName(r.taal, taal.name), n: taal.matras })),
        r.mode !== 'off' && comp.beats % taal.matras !== 0 && h('p', { class: 'small warn-text' }, t('composer.cycleHint', { beats: comp.beats, taal: taalName(r.taal, taal.name), n: taal.matras })),
        r.mode === 'grid' && h('p', { class: 'small muted' }, t('composer.drumHelp')),
        r.mode === 'grid' && h('div', { class: 'controls' },
          h('button', { class: 'btn btn-sm', type: 'button', onClick: () => change({ ...comp, rhythm: { ...r, grid: gridFromTheka(r.taal, comp.beats) } }) }, t('composer.fillTheka', { taal: taalName(r.taal, taal.name) })),
          h('button', {
            class: 'btn btn-sm', type: 'button',
            onClick: () => { if (confirm(t('composer.confirmClear'))) change({ ...comp, rhythm: { ...r, grid: Object.fromEntries(DRUM_ROWS.map((b) => [b, []])) } }); },
          }, t('composer.clear'))),
      ].filter(Boolean));
      return;
    }
    const track = comp.tracks[tab];
    const setTrack = (patch, redraw) => change({ ...comp, tracks: { ...comp.tracks, [tab]: { ...track, ...patch } } }, redraw);
    panel.replaceChildren(
      h('div', { class: 'field-row' },
        select(t('composer.instrument'), track.instrument, INSTRUMENTS.map((k) => [k, t(`composer.inst.${k}`)]), (v) => setTrack({ instrument: v }, false)),
        h('label', { class: 'field' }, h('span', { class: 'small' }, t('composer.volume')),
          h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: track.volume, onChange: (e) => setTrack({ volume: Number(e.target.value) }, false) }))),
      h('div', { class: 'controls' },
        h('span', { class: 'small' }, t('composer.noteLength')),
        h('div', { class: 'chips', role: 'group', 'aria-label': t('composer.noteLength') }, NOTE_LENGTHS.map((len) => h('button', {
          class: `chip${noteLen === len ? ' on' : ''}`, type: 'button', 'aria-pressed': String(noteLen === len),
          onClick: () => { noteLen = len; renderPanel(); },
        }, t(`composer.len${len}`)))),
        h('button', {
          class: 'btn btn-sm', type: 'button',
          onClick: () => { if (track.notes.length && confirm(t('composer.confirmClear'))) setTrack({ notes: [] }, true); },
        }, t('composer.clear'))),
      h('p', { class: 'small muted' }, t('composer.gridHelp')));
  }

  const beatName = (step) => `${Math.floor(step / STEPS_PER_BEAT) + 1}${step % STEPS_PER_BEAT ? '½' : ''}`;
  const cellClass = (step) => `cell${step % STEPS_PER_BEAT === 0 ? ' beat' : ''}${step % (STEPS_PER_BEAT * 4) === 0 ? ' bar' : ''}`;

  function renderGrid() {
    const steps = totalSteps(comp);
    const grid = h('div', { class: 'studio-grid', role: 'grid', style: { gridTemplateColumns: `4.2rem repeat(${steps}, 1.7rem)` } });
    if (tab === 'rhythm') {
      grid.setAttribute('aria-label', t('composer.gridLabel', { part: t('composer.tabRhythm') }));
      const r = comp.rhythm;
      for (const bol of DRUM_ROWS) {
        grid.append(h('div', { class: 'row-label', role: 'rowheader' }, bolName(bol)));
        for (let step = 0; step < steps; step++) {
          const on = r.mode === 'grid' && r.grid[bol]?.includes(step);
          grid.append(h('button', {
            class: `${cellClass(step)}${on ? ' on drum' : ''}`, type: 'button', 'data-step': step, disabled: r.mode !== 'grid',
            'aria-pressed': String(Boolean(on)), 'aria-label': t('composer.cell', { note: bolName(bol), beat: beatName(step) }),
            onClick: () => {
              if (!on) playBol(bol, getCtx().currentTime + 0.01, 0.8);
              change({ ...comp, rhythm: { ...r, grid: toggleDrum(r.grid, bol, step) } });
            },
          }));
        }
      }
    } else {
      const track = comp.tracks[tab];
      const other = comp.tracks[tab === 'melody' ? 'second' : 'melody'];
      grid.setAttribute('aria-label', t('composer.gridLabel', { part: t(tab === 'melody' ? 'composer.tabMelody' : 'composer.tabSecond') }));
      for (const semi of rowsFor(comp.scale)) {
        const sw = parseSwara(tokenOf(semi));
        const name = `${swaraWord(sw)}${sw.octave > 0 ? ` (${t('swara.upper')})` : sw.octave < 0 ? ` (${t('swara.lower')})` : ''}`;
        grid.append(h('div', { class: `row-label${semi % 12 === 0 ? ' sa' : ''}`, role: 'rowheader' }, swaraLabel(sw)));
        for (let step = 0; step < steps; step++) {
          const note = noteAt(track.notes, step, semi);
          const ghost = !note && noteAt(other.notes, step, semi);
          let cls = cellClass(step);
          if (note) cls += note.s === step ? ' on start' : ' on held';
          if (note && note.s + note.l - 1 === step) cls += ' end';
          if (ghost) cls += ' ghost';
          grid.append(h('button', {
            class: cls, type: 'button', 'data-step': step,
            'aria-pressed': String(Boolean(note)), 'aria-label': t('composer.cell', { note: name, beat: beatName(step) }),
            onClick: () => {
              if (!note) playInstrument(track.instrument, sa() + semi, getCtx().currentTime + 0.01, Math.min(1.2, noteLen * 60 / comp.bpm / STEPS_PER_BEAT), track.volume);
              change({ ...comp, tracks: { ...comp.tracks, [tab]: { ...track, notes: toggleNote(track.notes, step, semi, noteLen, steps) } } });
            },
          }));
        }
      }
    }
    const scroll = gridBox.firstElementChild?.scrollLeft || 0;
    gridBox.replaceChildren(h('div', { class: 'studio-scroll' }, grid));
    gridBox.firstElementChild.scrollLeft = scroll;
  }

  function render() {
    renderSettings();
    renderTabs();
    renderPanel();
    renderGrid();
  }

  // ---------- Export, share, sing ----------
  const busy = async (btn, work) => {
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = t('take.preparing');
    try { await work(); } catch { toast(t('take.saveFailed')); } finally { btn.disabled = false; btn.textContent = label; }
  };
  let repeats = 2;
  const shareBox = h('input', { class: 'input', readonly: true, hidden: true, 'aria-label': t('composer.shareLabel'), onFocus: (e) => e.target.select() });
  const saveCopyBtn = h('button', {
    class: 'btn btn-primary', type: 'button', hidden: !isShared,
    onClick: () => {
      comp = { ...comp, id: newComposition().id };
      isShared = false;
      store.saveComposition(comp);
      toast(t('composer.saved'));
      location.hash = `#/studio/${comp.id}`;
    },
  }, t('composer.saveCopy'));

  const actions = h('div', { class: 'step-card studio-actions' },
    isShared && h('p', { class: 'small privacy-note' }, t('composer.sharedNote')),
    h('div', { class: 'controls' }, saveCopyBtn, !isShared && savedNote),
    h('div', { class: 'controls' },
      h('label', { class: 'inline small' }, `${t('composer.repeat')} `,
        h('select', { class: 'select', onChange: (e) => { repeats = Number(e.target.value); } }, [1, 2, 4].map((n) => h('option', { value: n, selected: n === repeats }, `× ${n}`)))),
      h('button', {
        class: 'btn', type: 'button',
        onClick: (e) => busy(e.currentTarget, async () => {
          const buf = await renderComposition(comp, { saMidi: sa(), repeats });
          await saveAudio([buf.getChannelData(0), buf.getChannelData(1)], buf.sampleRate, `surtaal-${slug(titleOf(comp))}`);
          toast(t('take.saved'));
        }),
      }, t('composer.download'))),
    h('div', { class: 'controls' },
      h('button', {
        class: 'btn', type: 'button', title: t('composer.singOverDesc'),
        onClick: (e) => busy(e.currentTarget, async () => {
          stopPlaying();
          const buf = await renderComposition(comp, { saMidi: sa(), repeats: 4 });
          setPendingTrack(buf, `${titleOf(comp)}.mp3`);
          location.hash = '#/sing/track';
        }),
      }, t('composer.singOver')),
      h('button', {
        class: 'btn', type: 'button', title: t('composer.practiseDesc'),
        onClick: () => {
          const raw = toMySong(comp, newSongId());
          if (!raw) { toast(t('composer.noMelody')); return; }
          stopPlaying();
          store.saveMySong(raw);
          location.hash = `#/sing/${raw.id}`;
        },
      }, t('composer.practise'))),
    h('p', { class: 'small muted' }, `${t('composer.singOverDesc')} ${t('composer.practiseDesc')}`),
    h('div', { class: 'controls' },
      h('button', {
        class: 'btn', type: 'button',
        onClick: async () => {
          const url = `${location.origin}${location.pathname}#/studio/open/${encodeShare(comp)}`;
          shareBox.hidden = false;
          shareBox.value = url;
          try { await navigator.clipboard.writeText(url); toast(t('composer.shareCopied')); } catch { shareBox.focus(); }
        },
      }, t('composer.share')),
      !isShared && h('button', {
        class: 'btn btn-danger', type: 'button',
        onClick: () => {
          if (!confirm(t('composer.confirmDelete'))) return;
          stopPlaying();
          clearTimeout(saveTimer);
          isShared = true;   // nothing more to save
          store.deleteComposition(comp.id);
          toast(t('composer.deleted'));
          location.hash = '#/studio';
        },
      }, t('composer.delete'))),
    shareBox);

  render();
  return h('div', { class: 'container c-studio studio' },
    h('a', { class: 'back', href: '#/studio' }, t('composer.back')),
    h('h1', { class: 'visually-hidden' }, t('composer.title')),
    titleInput,
    h('div', { class: 'step-card' }, settings),
    h('div', { class: 'step-card' }, tabs, panel, gridBox),
    actions);
}
