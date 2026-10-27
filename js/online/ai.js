// The AI teacher: questions go to SurTaal's Cloudflare Worker, which asks
// Google Gemini (see worker/index.js). Errors carry an i18n key as `code`.
import { accountsEnabled, apiUrl } from '../config.js';
import { account } from './account.js';

const codeError = (code) => Object.assign(new Error(code), { code });
const ERRORS = { 400: 'ai.failed', 401: 'ai.signIn', 429: 'ai.busy', 503: 'ai.notReady', 504: 'ai.timeout' };

let ready = null;
// Whether the AI teacher is switched on where this copy of the app runs.
export function aiAvailable() {
  ready ||= fetch(apiUrl('/api/health'), { cache: 'no-store' })
    .then((res) => (res.ok ? res.json() : null))
    .then((health) => Boolean(health?.ai))
    .catch(() => { ready = null; return false; });
  return ready;
}

// messages: [{ role: 'user' | 'model', text }], oldest first.
export async function askTeacher({ messages, context, lang }) {
  if (globalThis.navigator?.onLine === false) throw codeError('ai.offline');
  const headers = { 'content-type': 'application/json' };
  if (accountsEnabled()) {
    const token = await account.accessToken();
    if (!token) throw codeError('ai.signIn');
    headers.authorization = `Bearer ${token}`;
  }
  let res;
  try {
    res = await fetch(apiUrl('/api/ai'), { method: 'POST', headers, body: JSON.stringify({ messages, context, lang }) });
  } catch {
    throw codeError('ai.offline');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.text) throw codeError(ERRORS[res.status] || 'ai.failed');
  return body.text;
}

// A question handed over by another page (for example a practical result),
// asked as soon as the teacher page opens.
let pending = null;
export const setPendingQuestion = (lessonId, text) => { pending = { lessonId, text }; };
export function takePendingQuestion(lessonId) {
  if (!pending || pending.lessonId !== lessonId) return null;
  const { text } = pending;
  pending = null;
  return text;
}
