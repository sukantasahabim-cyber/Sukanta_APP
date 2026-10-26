import { h, toast } from '../ui/dom.js';
import { t, lang } from '../i18n/i18n.js';
import { account, syncNow } from '../online/account.js';

const LOCALES = { en: 'en-IN', bn: 'bn-IN', hi: 'hi-IN' };
let returnTo = null;
// Pages that need a signed-in learner send them here, then get them back.
export const signInThen = (hash) => { returnTo = hash; };

function syncLine() {
  const { status, at } = account.sync();
  const time = at ? at.toLocaleTimeString(LOCALES[lang()], { hour: 'numeric', minute: '2-digit' }) : '';
  const text = status === 'done' ? t('account.syncedAt', { time }) : t(`account.sync.${status}`);
  return h('p', { class: `small ${status === 'error' ? 'warn-text' : 'muted'}`, role: 'status' }, text);
}

// Card on the Progress page: who is signed in and whether progress is saved online.
export function accountCard(scope) {
  if (!account.enabled()) return null;
  const card = h('div', { class: 'step-card' });
  const render = () => {
    const user = account.user();
    card.replaceChildren(
      h('h2', {}, `☁️ ${t('account.title')}`),
      ...(user
        ? [h('p', {}, t('account.signedInAs', { email: user.email })), syncLine()]
        : [h('p', { class: 'muted small' }, t('account.why'))]),
      h('a', { class: `btn ${user ? '' : 'btn-primary'}`, href: '#/account' }, user ? t('account.manage') : t('account.signIn')));
  };
  render();
  scope.onCleanup(account.subscribe(render));
  return card;
}

export function accountView(scope) {
  const page = h('div', { class: 'container' });
  if (!account.enabled()) {
    return h('div', { class: 'container' },
      h('a', { class: 'back', href: '#/progress' }, t('account.back')),
      h('h1', {}, `☁️ ${t('account.title')}`),
      h('p', { class: 'muted' }, t('account.off')));
  }

  let stage = 'email';
  let email = '';
  const message = h('p', { class: 'small', role: 'status', 'aria-live': 'polite' });
  const fail = (err, fallback) => { message.className = 'small warn-text'; message.textContent = t(err?.code || fallback); };

  function emailForm() {
    const input = h('input', { class: 'input', type: 'email', autocomplete: 'email', required: true, value: email, 'aria-label': t('account.email'), placeholder: t('account.emailPlaceholder') });
    const btn = h('button', { class: 'btn btn-primary', type: 'submit' }, t('account.sendCode'));
    setTimeout(() => input.focus(), 0);
    return h('form', {
      class: 'step-card',
      onSubmit: async (e) => {
        e.preventDefault();
        btn.disabled = true;
        message.textContent = t('account.sending');
        message.className = 'small muted';
        try {
          email = input.value.trim();
          await account.sendCode(email);
          stage = 'code';
          message.textContent = '';
          render();
        } catch (err) {
          fail(err, 'account.sendFailed');
        } finally {
          btn.disabled = false;
        }
      },
    },
    h('h2', {}, t('account.signIn')),
    h('p', { class: 'muted small' }, t('account.why')),
    h('label', { class: 'field' }, h('span', {}, t('account.email')), input),
    h('div', { class: 'controls' }, btn),
    message);
  }

  function codeForm() {
    const input = h('input', {
      class: 'input', inputmode: 'numeric', autocomplete: 'one-time-code', required: true, pattern: '[0-9]{6,10}', maxlength: 10,
      'aria-label': t('account.code'), placeholder: '123456',
    });
    const btn = h('button', { class: 'btn btn-primary', type: 'submit' }, t('account.verify'));
    setTimeout(() => input.focus(), 0);
    return h('form', {
      class: 'step-card',
      onSubmit: async (e) => {
        e.preventDefault();
        btn.disabled = true;
        message.textContent = t('account.checking');
        message.className = 'small muted';
        try {
          await account.verifyCode(email, input.value.replace(/\D/g, ''));
          toast(t('account.welcome'));
          if (returnTo) { const to = returnTo; returnTo = null; location.hash = to; return; }
          stage = 'email';
          render();
        } catch (err) {
          fail(err, 'account.badCode');
        } finally {
          btn.disabled = false;
        }
      },
    },
    h('h2', {}, t('account.enterCode')),
    h('p', { class: 'muted small' }, t('account.codeSent', { email })),
    h('label', { class: 'field' }, h('span', {}, t('account.code')), input),
    h('div', { class: 'controls' },
      btn,
      h('button', { class: 'btn btn-ghost', type: 'button', onClick: () => { stage = 'email'; message.textContent = ''; render(); } }, t('account.otherEmail'))),
    message);
  }

  function signedIn(user) {
    return [
      h('div', { class: 'step-card' },
        h('p', {}, t('account.signedInAs', { email: user.email })),
        syncLine(),
        h('p', { class: 'muted small' }, t('account.syncHelp')),
        h('div', { class: 'controls' },
          h('button', { class: 'btn btn-primary', type: 'button', onClick: () => syncNow() }, t('account.syncNow')),
          h('button', {
            class: 'btn', type: 'button',
            onClick: async () => { await account.signOut(); toast(t('account.signedOut')); },
          }, t('account.signOut')))),
      h('div', { class: 'step-card' },
        h('h2', {}, t('account.deleteTitle')),
        h('p', { class: 'muted small' }, t('account.deleteText')),
        h('button', {
          class: 'btn btn-danger', type: 'button',
          onClick: async () => {
            if (!confirm(t('account.deleteConfirm'))) return;
            try {
              await account.deleteAccount();
              toast(t('account.deleted'));
            } catch (err) {
              fail(err, 'account.deleteFailed');
            }
          },
        }, t('account.delete')),
        message),
    ];
  }

  function render() {
    const user = account.user();
    page.replaceChildren(
      h('a', { class: 'back', href: '#/progress' }, t('account.back')),
      h('h1', {}, `☁️ ${t('account.title')}`),
      ...(user ? signedIn(user) : [stage === 'code' ? codeForm() : emailForm()]),
      h('p', { class: 'muted small' }, t('account.privacy'), ' ', h('a', { href: 'privacy.html' }, t('account.privacyLink'))));
  }
  render();
  scope.onCleanup(account.subscribe(() => {
    // Keep a half-typed code form; redraw for sign-in, sign-out and sync changes.
    if (account.user() || stage !== 'code') render();
  }));
  return page;
}
