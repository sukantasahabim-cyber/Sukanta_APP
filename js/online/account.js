// Optional online account (Supabase): sign in with a code sent by email, keep
// progress in step across devices, and show the AI teacher who is asking.
// Nothing loads unless config.js names a Supabase project, and the app works
// fully without signing in — progress always stays on the device too.
import { CONFIG, accountsEnabled } from '../config.js';
import { store, mergeProgress } from '../store.js';

const STORAGE_KEY = 'surtaal-auth';
const TABLE = 'progress';
const SYNC_DELAY = 4000;

let clientPromise = null;
let user = null;                       // { id, email } while signed in
let sync = { status: 'idle', at: null }; // idle | syncing | done | offline | error
let applying = false;                  // true while sync writes merged progress into the store
let timer = 0;
let running = null;
let again = false;
const listeners = new Set();

const notify = () => listeners.forEach((fn) => fn());
const setSync = (status) => { sync = { status, at: status === 'done' ? new Date() : sync.at }; notify(); };
const hasSavedSession = () => { try { return Boolean(localStorage.getItem(STORAGE_KEY)); } catch { return false; } };
const codeError = (code) => Object.assign(new Error(code), { code });

// JSON with sorted keys, so the same progress always compares equal (the
// database does not keep key order).
function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().filter((k) => value[k] !== undefined).map((k) => `${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

function client() {
  if (!accountsEnabled()) return Promise.resolve(null);
  clientPromise ||= import('../vendor/supabase.js').then(({ createClient }) => {
    const sb = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: STORAGE_KEY },
    });
    sb.auth.onAuthStateChange((_event, session) => {
      const next = session?.user ? { id: session.user.id, email: session.user.email } : null;
      const signedIn = next && next.id !== user?.id;
      user = next;
      notify();
      // Supabase asks that other calls wait until this callback has returned.
      if (signedIn) setTimeout(() => syncNow(), 0);
    });
    return sb;
  });
  return clientPromise;
}

// Pulls the saved progress, merges it with this device's, and saves the result
// on both sides. Calls made while one is running are folded into one more run.
async function syncOnce() {
  const sb = await client();
  if (!sb || !user) return;
  if (globalThis.navigator?.onLine === false) { setSync('offline'); return; }
  setSync('syncing');
  try {
    const { data: row, error } = await sb.from(TABLE).select('data').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    const merged = mergeProgress(store.get(), row?.data);
    if (stable(merged) !== stable(store.get())) {
      applying = true;
      try { store.replace(merged); } finally { applying = false; }
    }
    if (!row || stable(merged) !== stable(mergeProgress(row.data, {}))) {
      const { error: saveError } = await sb.from(TABLE).upsert({ user_id: user.id, data: merged, updated_at: new Date().toISOString() });
      if (saveError) throw saveError;
    }
    setSync('done');
  } catch (err) {
    console.warn('SurTaal sync failed', err);
    setSync(globalThis.navigator?.onLine === false ? 'offline' : 'error');
  }
}

export function syncNow() {
  clearTimeout(timer);
  if (running) { again = true; return running; }
  running = syncOnce().finally(() => {
    running = null;
    if (again) { again = false; syncNow(); }
  });
  return running;
}

const scheduleSync = () => {
  if (applying || !user) return;
  clearTimeout(timer);
  timer = setTimeout(syncNow, SYNC_DELAY);
};

export const account = {
  enabled: accountsEnabled,
  user: () => user,
  sync: () => sync,
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  // Called once when the app opens: resumes a saved sign-in and keeps syncing.
  async start() {
    if (!accountsEnabled()) return;
    store.subscribe(scheduleSync);
    addEventListener('online', () => user && syncNow());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && timer) syncNow();
    });
    if (hasSavedSession()) {
      const sb = await client();
      const { data } = await sb.auth.getSession();
      if (data.session?.user && !user) {
        user = { id: data.session.user.id, email: data.session.user.email };
        notify();
        syncNow();
      }
    }
  },

  // Sends a one-time sign-in code to the email address (new addresses get an
  // account automatically).
  async sendCode(email) {
    const sb = await client();
    const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) throw codeError(error.status === 429 ? 'account.tooMany' : 'account.sendFailed');
  },

  async verifyCode(email, code) {
    const sb = await client();
    const { data, error } = await sb.auth.verifyOtp({ email, token: code, type: 'email' });
    if (error || !data.session) throw codeError('account.badCode');
    user = { id: data.user.id, email: data.user.email };
    notify();
    await syncNow();
  },

  // Progress stays on this device after signing out.
  async signOut() {
    const sb = await client();
    clearTimeout(timer);
    await sb.auth.signOut({ scope: 'local' });
    user = null;
    sync = { status: 'idle', at: null };
    notify();
  },

  // Deletes the account and its saved progress (see supabase/setup.sql).
  // Progress on this device is kept.
  async deleteAccount() {
    const sb = await client();
    const { error } = await sb.rpc('delete_my_account');
    if (error) throw codeError('account.deleteFailed');
    await account.signOut();
  },

  // A fresh access token for the AI teacher, or null when signed out.
  async accessToken() {
    if (!accountsEnabled() || (!user && !hasSavedSession())) return null;
    const sb = await client();
    const { data } = await sb.auth.getSession();
    return data.session?.access_token ?? null;
  },
};
