import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { readAsk, geminiRequest, geminiText, corsHeaders, teacherInstructions, LIMITS, DEFAULT_MODEL } from '../worker/index.js';
import { CONFIG } from '../js/config.js';

// Most tests run as if accounts were off; the last one switches them on.
Object.assign(CONFIG, { supabaseUrl: '', supabaseKey: '' });

const env = (extra = {}) => ({
  GEMINI_API_KEY: 'test-key',
  GEMINI_MODEL: 'gemini-test',
  ALLOWED_ORIGINS: 'capacitor://localhost',
  ASSETS: { fetch: () => new Response('asset') },
  ...extra,
});
const post = (body, headers = {}) => new Request('https://surtaal.example/api/ai', {
  method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body),
});

// Replaces fetch for one test; `reply(url, init)` answers each outgoing call.
async function withFetch(reply, fn) {
  const real = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => { calls.push({ url: String(url), init }); return reply(String(url), init); };
  try { await fn(calls); } finally { globalThis.fetch = real; }
}

test('questions are checked, trimmed and made to take turns', () => {
  assert.equal(readAsk(null).error, 'bad_request');
  assert.equal(readAsk({ messages: [] }).error, 'bad_request');
  assert.equal(readAsk({ messages: [{ role: 'user', text: 'x'.repeat(LIMITS.text + 1) }] }).error, 'too_long');
  assert.equal(readAsk({ messages: [{ role: 'user', text: 'hi' }, { role: 'model', text: 'hello' }] }).error, 'bad_request', 'must end with the learner');
  const ask = readAsk({
    lang: 'xx', context: 'c'.repeat(LIMITS.context + 50),
    messages: [{ role: 'model', text: 'welcome' }, { role: 'user', text: ' one ' }, { role: 'user', text: 'two' }, { role: 'model', text: 'ok' }, { role: 'user', text: 'three' }],
  });
  assert.equal(ask.lang, 'en');
  assert.equal(ask.context.length, LIMITS.context);
  assert.deepEqual(ask.messages, [{ role: 'user', text: 'one\n\ntwo' }, { role: 'model', text: 'ok' }, { role: 'user', text: 'three' }]);
});

test('the teacher answers in the learner\'s language and knows the lesson', () => {
  assert.match(teacherInstructions('bn', ''), /Bengali/);
  assert.match(teacherInstructions('hi', 'Lesson open now: "Sa"'), /Hindi[\s\S]*Lesson open now: "Sa"/);
  const req = geminiRequest({ lang: 'en', context: '', messages: [{ role: 'user', text: 'hi' }] });
  assert.deepEqual(req.contents, [{ role: 'user', parts: [{ text: 'hi' }] }]);
  assert.match(req.systemInstruction.parts[0].text, /SurTaal Guru/);
});

test('answer text skips thinking parts', () => {
  assert.equal(geminiText({ candidates: [{ content: { parts: [{ text: 'plan', thought: true }, { text: 'Sing ' }, { text: 'Sa.' }] } }] }), 'Sing Sa.');
  assert.equal(geminiText({ promptFeedback: { blockReason: 'SAFETY' } }), '');
});

test('only the app\'s own places may call the API from a browser', () => {
  assert.equal(corsHeaders('https://evil.example', 'https://surtaal.example', 'capacitor://localhost')['access-control-allow-origin'], undefined);
  assert.equal(corsHeaders('capacitor://localhost', 'https://surtaal.example', 'capacitor://localhost')['access-control-allow-origin'], 'capacitor://localhost');
  assert.equal(corsHeaders('https://surtaal.example', 'https://surtaal.example', '')['access-control-allow-origin'], 'https://surtaal.example');
});

test('health says what is switched on; other paths go to the app files', async () => {
  const health = await worker.fetch(new Request('https://surtaal.example/api/health'), env());
  assert.deepEqual(await health.json(), { ok: true, ai: true, signInRequired: false });
  const off = await worker.fetch(new Request('https://surtaal.example/api/health'), env({ GEMINI_API_KEY: '' }));
  assert.equal((await off.json()).ai, false);
  assert.equal(await (await worker.fetch(new Request('https://surtaal.example/index.html'), env())).text(), 'asset');
  assert.equal((await worker.fetch(new Request('https://surtaal.example/api/nothing'), env())).status, 404);
  const pre = await worker.fetch(new Request('https://surtaal.example/api/ai', { method: 'OPTIONS', headers: { origin: 'capacitor://localhost' } }), env());
  assert.equal(pre.status, 204);
  assert.equal(pre.headers.get('access-control-allow-origin'), 'capacitor://localhost');
});

test('a question is answered by Gemini with the key kept on the server', async () => {
  await withFetch(() => Response.json({ candidates: [{ content: { parts: [{ text: 'Breathe low and slow.' }] } }] }), async (calls) => {
    const res = await worker.fetch(post({ lang: 'en', messages: [{ role: 'user', text: 'How do I breathe?' }] }), env());
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { text: 'Breathe low and slow.' });
    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /models\/gemini-test:generateContent$/);
    assert.equal(calls[0].init.headers['x-goog-api-key'], 'test-key');
    assert.ok(!calls[0].url.includes('test-key'), 'the key is not in the address');
    assert.deepEqual(JSON.parse(calls[0].init.body).generationConfig.thinkingConfig, { thinkingLevel: 'low' });
    assert.ok(calls[0].init.signal, 'the call can be cut off');
  });
});

test('the model and thinking level come from the settings, with fixed defaults', async () => {
  assert.equal(geminiRequest({ lang: 'en', context: '', messages: [{ role: 'user', text: 'hi' }] }).generationConfig.thinkingConfig, undefined);
  await withFetch(() => Response.json({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] }), async (calls) => {
    await worker.fetch(post({ messages: [{ role: 'user', text: 'hi' }] }), env({ GEMINI_MODEL: '', GEMINI_THINKING: '' }));
    assert.match(calls[0].url, new RegExp(`models/${DEFAULT_MODEL}:generateContent$`));
    assert.equal(JSON.parse(calls[0].init.body).generationConfig.thinkingConfig, undefined);
  });
});

test('an overloaded model is asked again, then reported as busy', async () => {
  let n = 0;
  const overloadedOnce = () => (n++ === 0
    ? Response.json({ error: { code: 503, status: 'UNAVAILABLE' } }, { status: 503 })
    : Response.json({ candidates: [{ content: { parts: [{ text: 'Sa is the home note.' }] } }] }));
  await withFetch(overloadedOnce, async (calls) => {
    const res = await worker.fetch(post({ messages: [{ role: 'user', text: 'hi' }] }), env({ GEMINI_RETRY_MS: '1,1' }));
    assert.equal(res.status, 200);
    assert.equal(calls.length, 2);
  });
  await withFetch(() => new Response('{}', { status: 503 }), async (calls) => {
    const res = await worker.fetch(post({ messages: [{ role: 'user', text: 'hi' }] }), env({ GEMINI_RETRY_MS: '1,1' }));
    assert.equal(res.status, 429);
    assert.deepEqual(await res.json(), { error: 'busy' });
    assert.equal(calls.length, 3);
  });
});

test('a Gemini call that hangs is cut off with a clear error', async () => {
  // Never answers; only gives up when the Worker's time limit fires.
  const hang = (_url, init) => new Promise((_, reject) => {
    init.signal.addEventListener('abort', () => reject(init.signal.reason));
  });
  await withFetch(hang, async () => {
    const started = Date.now();
    const res = await worker.fetch(post({ messages: [{ role: 'user', text: 'hi' }] }), env({ GEMINI_TIMEOUT_MS: '50' }));
    assert.equal(res.status, 504);
    assert.deepEqual(await res.json(), { error: 'timeout' });
    assert.ok(Date.now() - started < 2000);
  });
});

test('problems come back as clear error codes', async () => {
  assert.equal((await worker.fetch(post({ messages: [{ role: 'user', text: 'hi' }] }), env({ GEMINI_API_KEY: '' }))).status, 503);
  assert.equal((await worker.fetch(post({ messages: 'nope' }), env())).status, 400);
  const limited = env({ AI_LIMIT: { limit: async () => ({ success: false }) } });
  assert.equal((await worker.fetch(post({ messages: [{ role: 'user', text: 'hi' }] }), limited)).status, 429);
  await withFetch(() => new Response('quota', { status: 429 }), async () => {
    assert.equal((await worker.fetch(post({ messages: [{ role: 'user', text: 'hi' }] }), env())).status, 429);
  });
  await withFetch(() => Response.json({ candidates: [] }), async () => {
    assert.deepEqual(await (await worker.fetch(post({ messages: [{ role: 'user', text: 'hi' }] }), env())).json(), { error: 'no_answer' });
  });
  assert.equal((await worker.fetch(new Request('https://surtaal.example/api/ai'), env())).status, 405);
});

test('with accounts switched on, only signed-in learners may ask', async () => {
  const saved = { ...CONFIG };
  Object.assign(CONFIG, { supabaseUrl: 'https://proj.supabase.co', supabaseKey: 'sb_publishable_x' });
  try {
    await withFetch((url, init) => {
      if (url.endsWith('/auth/v1/user')) {
        return init.headers.authorization === 'Bearer good' ? Response.json({ id: 'user-1' }) : new Response('{}', { status: 401 });
      }
      return Response.json({ candidates: [{ content: { parts: [{ text: 'Yes!' }] } }] });
    }, async (calls) => {
      const body = { messages: [{ role: 'user', text: 'hi' }] };
      assert.equal((await worker.fetch(post(body), env())).status, 401);
      assert.equal((await worker.fetch(post(body, { authorization: 'Bearer bad' }), env())).status, 401);
      let limitedKey = null;
      const res = await worker.fetch(post(body, { authorization: 'Bearer good' }), env({ AI_LIMIT: { limit: async ({ key }) => { limitedKey = key; return { success: true }; } } }));
      assert.equal(res.status, 200);
      assert.equal(limitedKey, 'user-1', 'the limit counts per learner');
      assert.equal(calls.find((c) => c.url.endsWith('/auth/v1/user')).init.headers.apikey, 'sb_publishable_x');
    });
  } finally {
    Object.assign(CONFIG, saved);
  }
});
