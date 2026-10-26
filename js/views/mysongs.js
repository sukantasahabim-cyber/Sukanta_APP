// "My Songs" editor: type a song's notes (and words) line by line, then sing
// it in the Sing-along Studio. Songs stay on this device.
import { h, toast } from '../ui/dom.js';
import { swaraLabel } from '../ui/controls.js';
import { t } from '../i18n/i18n.js';
import { taalName } from '../i18n/names.js';
import { TAALS } from '../data/taals.js';
import { parseMySong, emptySong } from '../data/mysongs.js';
import { getCtx } from '../audio/engine.js';
import { playSwara } from '../audio/voice.js';
import { parseSwara } from '../music.js';
import { store } from '../store.js';

const KEYPAD = ['.P', '.D', '.N', 'S', 'r', 'R', 'g', 'G', 'M', 'm', 'P', 'd', 'D', 'n', 'N', "S'", "R'", "G'", '-'];

export function mySongEditView(scope, id) {
  const existing = id ? store.mySong(id) : null;
  if (id && !existing) { location.replace('#/sing/new'); return h('div'); }
  const draft = existing ? JSON.parse(JSON.stringify(existing)) : emptySong();
  let focused = null;   // the notes field the keypad types into

  const errorsBox = h('div', { class: 'form-errors', role: 'alert', hidden: true });
  const linesBox = h('ol', { class: 'song-lines' });

  function lineRow(line, i) {
    const notes = h('input', {
      class: 'input notes-input', value: line.notes, placeholder: 'S R G - P', 'aria-label': t('mysong.notesN', { n: i + 1 }),
      autocomplete: 'off', autocapitalize: 'off', spellcheck: false,
      onInput: (e) => { line.notes = e.target.value; },
      onFocus: (e) => { focused = { input: e.target, line }; },
    });
    const lyrics = h('input', {
      class: 'input', value: line.lyrics || '', placeholder: t('mysong.lyricsHint'), 'aria-label': t('mysong.lyricsN', { n: i + 1 }),
      onInput: (e) => { line.lyrics = e.target.value; },
    });
    return h('li', { class: 'song-line-edit' },
      h('div', { class: 'line-head' },
        h('b', {}, t('sing.lineScore', { n: i + 1 })),
        h('button', { class: 'btn btn-sm', type: 'button', onClick: () => hear(line) }, t('common.hearIt')),
        draft.lines.length > 1 && h('button', {
          class: 'btn btn-sm', type: 'button', 'aria-label': t('mysong.removeN', { n: i + 1 }),
          onClick: () => { draft.lines.splice(i, 1); renderLines(); },
        }, '✕')),
      h('label', { class: 'field' }, h('span', { class: 'small muted' }, t('mysong.notes')), notes),
      h('label', { class: 'field' }, h('span', { class: 'small muted' }, t('mysong.lyrics')), lyrics));
  }

  function renderLines() {
    linesBox.replaceChildren(...draft.lines.map(lineRow));
  }
  renderLines();

  // Plays a line's notes so the learner can check what they typed.
  function hear(line) {
    const beat = 60 / (Number(draft.bpm) || 80);
    const tokens = line.notes.trim().split(/\s+/).filter(Boolean);
    const t0 = getCtx().currentTime + 0.05;
    tokens.forEach((tok, i) => {
      const sw = tok !== '-' && parseSwara(tok);
      if (!sw) return;
      let holds = 1;
      while (tokens[i + holds] === '-') holds++;
      playSwara(sw.semitone, t0 + i * beat, holds * beat * 0.92);
    });
  }

  function insert(token) {
    const target = focused?.input;
    if (!target) { toast(t('mysong.pickLine')); return; }
    const before = target.value.slice(0, target.selectionStart ?? target.value.length).replace(/\s+$/, '');
    const after = target.value.slice(target.selectionEnd ?? target.value.length).replace(/^\s+/, '');
    target.value = [before, token, after].filter(Boolean).join(' ');
    focused.line.notes = target.value;
    const pos = (before ? before.length + 1 : 0) + token.length;
    target.focus();
    target.setSelectionRange(pos, pos);
    if (token !== '-') playSwara(parseSwara(token).semitone, getCtx().currentTime + 0.02, 0.4);
  }

  const keypad = h('div', { class: 'swara-pad', role: 'group', 'aria-label': t('mysong.keypad') },
    KEYPAD.map((tok) => h('button', {
      class: 'btn btn-sm', type: 'button', title: tok,
      onMousedown: (e) => e.preventDefault(),   // keep the cursor in the notes field
      onClick: () => insert(tok),
    }, tok === '-' ? `– ${t('mysong.hold')}` : swaraLabel(parseSwara(tok)))),
    h('button', {
      class: 'btn btn-sm', type: 'button', onMousedown: (e) => e.preventDefault(),
      onClick: () => {
        const target = focused?.input;
        if (!target) return;
        target.value = target.value.trim().split(/\s+/).slice(0, -1).join(' ');
        focused.line.notes = target.value;
        target.focus();
      },
    }, `⌫ ${t('mysong.backspace')}`));

  function save() {
    const { song, errors } = parseMySong(draft);
    if (errors.length) {
      errorsBox.hidden = false;
      errorsBox.replaceChildren(h('b', {}, t('mysong.fix')), h('ul', {}, errors.map((e) => h('li', {},
        e.line ? `${t('sing.lineScore', { n: e.line })}: ${t(e.key, e.vars)}` : t(e.key, e.vars)))));
      errorsBox.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    store.saveMySong(draft);
    toast(t('mysong.saved'));
    location.hash = `#/sing/${song.id}`;
  }

  return h('div', { class: 'container c-singing my-song-editor' },
    h('a', { class: 'back', href: '#/sing' }, t('sing.backToSongs')),
    h('h1', {}, existing ? t('mysong.editTitle') : t('mysong.new')),
    h('p', { class: 'muted small' }, t('mysong.private')),
    h('div', { class: 'step-card' },
      h('label', { class: 'field' }, h('span', {}, t('mysong.songTitle')),
        h('input', { class: 'input', value: draft.title, onInput: (e) => { draft.title = e.target.value; } })),
      h('div', { class: 'field-row' },
        h('label', { class: 'field' }, h('span', {}, t('taal.taal')),
          h('select', { class: 'select', onChange: (e) => { draft.taal = e.target.value; } },
            Object.entries(TAALS).map(([tid, taal]) => h('option', { value: tid, selected: tid === draft.taal }, `${taalName(tid, taal.name)} (${taal.matras})`)))),
        h('label', { class: 'field' }, h('span', {}, t('mysong.tempo')),
          h('input', { class: 'input', type: 'number', min: 30, max: 200, value: draft.bpm, onInput: (e) => { draft.bpm = e.target.value; } })),
        h('label', { class: 'field' }, h('span', {}, t('mysong.raag')),
          h('input', { class: 'input', value: draft.raag, placeholder: t('mysong.optional'), onInput: (e) => { draft.raag = e.target.value; } })))),
    h('div', { class: 'step-card' },
      h('h2', {}, t('mysong.howTitle')),
      h('ul', { class: 'small' },
        h('li', {}, t('mysong.how1')),
        h('li', {}, t('mysong.how2')),
        h('li', {}, t('mysong.how3'))),
      keypad,
      linesBox,
      h('button', { class: 'btn', type: 'button', onClick: () => { draft.lines.push({ notes: '', lyrics: '' }); renderLines(); } }, `＋ ${t('mysong.addLine')}`)),
    errorsBox,
    h('div', { class: 'controls sticky-actions' },
      h('button', { class: 'btn btn-primary', type: 'button', onClick: save }, `🎙️ ${t('mysong.saveSing')}`),
      existing && h('button', {
        class: 'btn btn-danger', type: 'button',
        onClick: () => {
          if (!confirm(t('mysong.confirmDelete'))) return;
          store.deleteMySong(existing.id);
          toast(t('mysong.deleted'));
          location.hash = '#/sing';
        },
      }, t('mysong.delete'))));
}
