// SurTaal on Cloudflare. The app's own files are served straight from the
// static assets (dist/); only /api/… requests reach this code:
//   GET  /api/health – which online features are switched on
//   POST /api/ai     – the AI teacher, answered by Google Gemini
// The Gemini key is a Worker secret (GEMINI_API_KEY) and never reaches the app.
// When accounts are configured (js/config.js), only signed-in learners may ask.
import { CONFIG, accountsEnabled } from '../js/config.js';

const GEMINI = 'https://generativelanguage.googleapis.com/v1beta/models';
const LANGUAGES = { en: 'English', bn: 'Bengali (বাংলা)', hi: 'Hindi (हिन्दी)' };
export const LIMITS = { messages: 16, text: 2000, context: 3000 };
// Used when wrangler.jsonc names no model. Gemini answers in a few seconds;
// anything slower than TIMEOUT_MS is cut off so the learner gets a clear
// "try again" instead of a spinner that never ends.
export const DEFAULT_MODEL = 'gemini-3.8-flash';
export const TIMEOUT_MS = 25000;
// When Google says the model is overloaded (503) the question is asked again
// after these pauses, within the same time limit.
export const RETRY_MS = [1000, 3000];

const json = (body, status, headers) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
});

// Browsers on other origins (the iOS app, the GitHub Pages copy) may call the
// API only when listed in ALLOWED_ORIGINS.
export function corsHeaders(origin, selfOrigin, allowedList = '') {
  const allowed = allowedList.split(',').map((s) => s.trim()).filter(Boolean);
  if (!origin || (origin !== selfOrigin && !allowed.includes(origin))) return { vary: 'Origin' };
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'authorization, content-type',
    'access-control-max-age': '86400',
    vary: 'Origin',
  };
}

// Checks and tidies a request from the app. Returns { messages, context, lang }
// or { error }. Gemini wants the talk to start with the learner and the two
// sides to take turns, so neighbouring messages from one side are joined.
export function readAsk(body) {
  if (!body || typeof body !== 'object' || !Array.isArray(body.messages)) return { error: 'bad_request' };
  const lang = LANGUAGES[body.lang] ? body.lang : 'en';
  const context = typeof body.context === 'string' ? body.context.slice(0, LIMITS.context) : '';
  const messages = [];
  for (const m of body.messages.slice(-LIMITS.messages)) {
    if (!m || typeof m.text !== 'string' || !m.text.trim()) return { error: 'bad_request' };
    if (m.text.length > LIMITS.text) return { error: 'too_long' };
    const role = m.role === 'model' ? 'model' : 'user';
    const last = messages[messages.length - 1];
    if (last?.role === role) last.text += `\n\n${m.text.trim()}`;
    else if (messages.length || role === 'user') messages.push({ role, text: m.text.trim() });
  }
  if (!messages.length || messages[messages.length - 1].role !== 'user') return { error: 'bad_request' };
  return { messages, context, lang };
}

export function teacherInstructions(lang, context) {
  return [
    'You are "SurTaal Guru", the friendly music teacher inside SurTaal, an app that teaches Indian classical and light singing, Western-style singing and tabla, from complete beginner to advanced.',
    `Always reply in ${LANGUAGES[lang]}, in simple words; the learner may be a child or an adult beginner.`,
    'Keep answers short: a few sentences or a short list, then one practical next step they can try right now (say what to do and for how long).',
    'For Indian music use sargam (Sa Re Ga Ma Pa Dha Ni) and tabla bols (Dha, Dhin, Na, Tin, Ta, Ge, Ke, Tirakita); use Do Re Mi or letter names when the learner does.',
    'Encourage and never shame. Voice safety comes first: practise gently, stop if it hurts, and suggest seeing a doctor if hoarseness or pain lasts more than two weeks.',
    'Only discuss music, singing, tabla, practice, the voice and using the SurTaal app; gently bring other topics back to music.',
    'Do not write out the lyrics of copyrighted songs; you may name songs and describe them. Short original practice phrases are fine.',
    'If you are not sure, say so. Do not invent facts about real artists.',
    'Write plain text. Use "- " for list items and **bold** sparingly. No tables, headings or links.',
    context && `What the app knows about the learner right now:\n${context}`,
  ].filter(Boolean).join('\n');
}

// thinking: Gemini's thinking level ('minimal', 'low', …); empty leaves it to
// the model. Short teacher answers need little thinking, and less is faster.
export function geminiRequest({ messages, context, lang }, thinking = '') {
  const generationConfig = { temperature: 0.7, maxOutputTokens: 2048 };
  if (thinking) generationConfig.thinkingConfig = { thinkingLevel: thinking };
  return {
    systemInstruction: { parts: [{ text: teacherInstructions(lang, context) }] },
    contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    generationConfig,
  };
}

// The answer's text, leaving out any "thinking" parts.
export function geminiText(reply) {
  const parts = reply?.candidates?.[0]?.content?.parts || [];
  return parts.filter((p) => !p.thought && typeof p.text === 'string').map((p) => p.text).join('').trim();
}

// Asks Supabase whether the access token belongs to a signed-in learner.
async function signedInUser(request) {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return null;
  const res = await fetch(`${CONFIG.supabaseUrl}/auth/v1/user`, {
    headers: { apikey: CONFIG.supabaseKey, authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const found = await res.json().catch(() => null);
  return found?.id ? found : null;
}

async function ask(request, env, cors) {
  if (!env.GEMINI_API_KEY) return json({ error: 'not_configured' }, 503, cors);
  let asker = request.headers.get('cf-connecting-ip') || 'anyone';
  if (accountsEnabled()) {
    const found = await signedInUser(request);
    if (!found) return json({ error: 'sign_in' }, 401, cors);
    asker = found.id;
  }
  if (env.AI_LIMIT) {
    const { success } = await env.AI_LIMIT.limit({ key: asker });
    if (!success) return json({ error: 'busy' }, 429, cors);
  }
  const question = readAsk(await request.json().catch(() => null));
  if (question.error) return json({ error: question.error }, 400, cors);

  const model = env.GEMINI_MODEL || DEFAULT_MODEL;
  const thinking = env.GEMINI_THINKING ?? 'low';
  const pauses = env.GEMINI_RETRY_MS !== undefined ? String(env.GEMINI_RETRY_MS).split(',').filter(Boolean).map(Number) : RETRY_MS;
  const stop = new AbortController();
  const timer = setTimeout(() => stop.abort(), Number(env.GEMINI_TIMEOUT_MS) || TIMEOUT_MS);
  let res;
  try {
    for (let attempt = 0; ; attempt++) {
      res = await fetch(`${GEMINI}/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
        body: JSON.stringify(geminiRequest(question, thinking)),
        signal: stop.signal,
      });
      if (res.status !== 503 || attempt >= pauses.length) break;
      console.warn(`Gemini (${model}) is overloaded; asking again`);
      await new Promise((resolve) => setTimeout(resolve, pauses[attempt]));
      if (stop.signal.aborted) throw stop.signal.reason;
    }
  } catch (err) {
    if (!stop.signal.aborted) throw err;
    console.error(`Gemini (${model}) did not answer in time`);
    return json({ error: 'timeout' }, 504, cors);
  } finally {
    clearTimeout(timer);
  }
  // Google's quota (429) or a model still overloaded (503): "busy, try later".
  if (res.status === 429 || res.status === 503) {
    console.error(`Gemini (${model}) busy`, res.status);
    return json({ error: 'busy' }, 429, cors);
  }
  if (!res.ok) {
    console.error(`Gemini (${model}) error`, res.status, (await res.text()).slice(0, 500));
    return json({ error: 'failed' }, 502, cors);
  }
  const text = geminiText(await res.json());
  if (!text) return json({ error: 'no_answer' }, 502, cors);
  return json({ text }, 200, cors);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request.headers.get('origin'), url.origin, env.ALLOWED_ORIGINS);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (url.pathname === '/api/health') {
      return json({ ok: true, ai: Boolean(env.GEMINI_API_KEY), signInRequired: accountsEnabled() }, 200, cors);
    }
    if (url.pathname === '/api/ai') {
      if (request.method !== 'POST') return json({ error: 'method' }, 405, cors);
      try {
        return await ask(request, env, cors);
      } catch (err) {
        console.error('AI teacher failed', err);
        return json({ error: 'failed' }, 500, cors);
      }
    }
    if (url.pathname.startsWith('/api/')) return json({ error: 'not_found' }, 404, cors);
    return env.ASSETS.fetch(request);
  },
};
