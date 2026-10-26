import { h } from '../ui/dom.js';
import { t, lang } from '../i18n/i18n.js';
import { store } from '../store.js';
import { findLesson } from '../data/courses.js';
import { midiName } from '../music.js';
import { accountsEnabled } from '../config.js';
import { account } from '../online/account.js';
import { askTeacher, aiAvailable, takePendingQuestion } from '../online/ai.js';
import { signInThen } from './account.js';
import { notFound } from './notfound.js';

const MAX_SENT = 16;
const chats = new Map(); // 'general' or lesson id → messages, kept while the app is open

const plainText = (html) => String(html || '')
  .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&[a-z]+;/g, ' ')
  .replace(/\s+/g, ' ').trim();

// What the teacher is told about the learner: the lesson on screen, their
// scores in it and their overall progress. No name or email is sent.
export function learnerContext(lessonId) {
  const lines = [];
  const found = lessonId && findLesson(lessonId);
  if (found) {
    const { course, lesson, index, list } = found;
    lines.push(`Lesson open now: "${lesson.title}" (lesson ${index + 1} of ${list.length} in the "${course.name}" course).`);
    const text = lesson.steps.map((s) => [s.title, plainText(s.body)].filter(Boolean).join(': ')).filter(Boolean).join(' | ');
    if (text) lines.push(`What the lesson teaches: ${text.slice(0, 1500)}`);
    const scores = (lesson.practice || []).map((ex, i) => {
      const best = store.practiceBest(lesson.id, i);
      return best == null ? null : `${ex.title}: best ${best}%${store.practicePassed(lesson.id, i) ? ' (passed)' : ' (not passed yet)'}`;
    }).filter(Boolean);
    if (scores.length) lines.push(`Their practical scores in this lesson: ${scores.join('; ')}.`);
  }
  const s = store.get();
  lines.push(`Overall: ${Object.keys(s.completed).length} theory lessons and ${Object.keys(s.practiceDone).length} practicals finished, a ${store.streak()}-day practice streak, ${store.totalMinutes()} minutes practised in all.`);
  const last = store.lastLesson() && store.lastLesson() !== lessonId && findLesson(store.lastLesson());
  if (last) lines.push(`Most recent lesson: "${last.lesson.title}" (${last.course.name}).`);
  lines.push(`Their Sa (home note) is ${midiName(store.setting('saMidi'))}.`);
  return lines.join('\n').slice(0, 3000);
}

// Answers use a little Markdown: "- " lists, "1." lists and **bold**. They are
// built as elements, never as HTML, so nothing in an answer can run.
const inline = (text) => text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? h('b', {}, part) : part.replace(/(^|\s)\*(\S)/g, '$1$2')));
export function richText(text) {
  const blocks = [];
  let list = null;
  for (const raw of String(text).split('\n')) {
    const line = raw.trim();
    const bullet = /^[-*•]\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (bullet || numbered) {
      const kind = bullet ? 'UL' : 'OL';
      if (list?.tagName !== kind) { list = h(kind.toLowerCase(), {}); blocks.push(list); }
      list.append(h('li', {}, inline((bullet || numbered)[1])));
    } else {
      list = null;
      if (line) blocks.push(h('p', {}, inline(line.replace(/^#+\s*/, ''))));
    }
  }
  return blocks;
}

export function teacherView(scope, lessonId) {
  const found = lessonId ? findLesson(lessonId) : null;
  if (lessonId && !found) return notFound();
  const key = lessonId || 'general';
  if (!chats.has(key)) chats.set(key, []);
  const messages = chats.get(key);
  let busy = false;
  let alive = true;
  scope.onCleanup(() => { alive = false; });

  const log = h('div', { class: 'chat-log' });
  const status = h('p', { class: 'small', role: 'status', 'aria-live': 'polite' });
  const input = h('textarea', {
    class: 'input chat-input', rows: 3, maxlength: 2000, 'aria-label': t('ai.placeholder'), placeholder: t('ai.placeholder'),
    onKeydown: (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(input.value); } },
  });
  const sendBtn = h('button', { class: 'btn btn-primary', type: 'submit' }, t('ai.send'));
  const clearBtn = h('button', {
    class: 'btn btn-ghost', type: 'button',
    onClick: () => { messages.length = 0; status.textContent = ''; draw(); input.focus(); },
  }, t('ai.newChat'));
  const composer = h('form', { class: 'chat-composer', onSubmit: (e) => { e.preventDefault(); send(input.value); } },
    input, h('div', { class: 'controls' }, sendBtn, clearBtn));
  const body = h('div', {}, h('p', { class: 'muted small' }, t('ai.checking')));

  const suggestions = () => h('div', { class: 'chat-suggest' },
    h('p', { class: 'muted small' }, t('ai.tryAsking')),
    (lessonId ? ['explain', 'practise', 'mistakes'] : ['plan', 'sa', 'breath', 'tabla']).map((id) => h('button', {
      class: 'chip', type: 'button', onClick: () => send(t(`ai.suggest.${id}`)),
    }, t(`ai.suggest.${id}`))));

  function draw() {
    log.replaceChildren(...[
      ...messages.map((m) => h('div', { class: `chat-msg ${m.role === 'user' ? 'me' : 'guru'}` },
        h('span', { class: 'visually-hidden' }, m.role === 'user' ? t('ai.you') : t('ai.teacher')),
        m.role === 'user' ? h('p', {}, m.text) : richText(m.text))),
      busy && h('div', { class: 'chat-msg guru thinking' }, t('ai.thinking')),
      !messages.length && !busy && suggestions(),
    ].filter(Boolean));
    clearBtn.hidden = !messages.length;
  }

  async function send(text) {
    text = String(text || '').trim();
    if (!text || busy) return;
    messages.push({ role: 'user', text });
    input.value = '';
    busy = true;
    sendBtn.disabled = true;
    status.textContent = '';
    draw();
    log.lastElementChild?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    try {
      const answer = await askTeacher({ messages: messages.slice(-MAX_SENT), context: learnerContext(lessonId), lang: lang() });
      messages.push({ role: 'model', text: answer });
    } catch (err) {
      messages.pop();
      if (alive && !input.value) input.value = text;
      status.className = 'small warn-text';
      status.textContent = t(err.code || 'ai.failed');
    } finally {
      busy = false;
      sendBtn.disabled = false;
      if (alive) {
        draw();
        log.lastElementChild?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }

  function signInCard() {
    return h('div', { class: 'step-card' },
      h('p', {}, t('ai.signInFirst')),
      h('button', {
        class: 'btn btn-primary', type: 'button',
        onClick: () => { signInThen(location.hash); location.hash = '#/account'; },
      }, t('account.signIn')));
  }

  function show(ready) {
    if (!alive) return;
    if (!ready) { body.replaceChildren(h('p', { class: 'step-card muted' }, t('ai.notReady'))); return; }
    if (accountsEnabled() && !account.user()) { body.replaceChildren(signInCard()); return; }
    body.replaceChildren(log, status, composer, h('p', { class: 'muted small' }, t('ai.disclaimer')));
    draw();
    const pending = takePendingQuestion(key);
    if (pending) send(pending);
  }
  aiAvailable().then(show);
  let signedIn = Boolean(account.user());
  scope.onCleanup(account.subscribe(() => {
    if (Boolean(account.user()) === signedIn) return;
    signedIn = !signedIn;
    aiAvailable().then(show);
  }));

  return h('div', { class: `container teacher${found ? ` c-${found.course.id}` : ''}` },
    h('a', { class: 'back', href: found ? `#/lesson/${found.lesson.id}` : '#/tools' }, found ? `← ${found.lesson.title}` : t('tools.back')),
    h('h1', {}, `🧑‍🏫 ${t('ai.title')}`),
    h('p', { class: 'muted' }, found ? t('ai.introLesson', { title: found.lesson.title }) : t('ai.intro')),
    body);
}

// "Ask the AI teacher" link for lesson pages; appears only where the teacher is on.
export function askTeacherLink(lessonId, label = t('ai.askLesson')) {
  const slot = h('span', {});
  aiAvailable().then((ok) => {
    if (ok) slot.replaceChildren(h('a', { class: 'btn btn-sm', href: `#/teacher/${lessonId}` }, `🧑‍🏫 ${label}`));
  });
  return slot;
}
