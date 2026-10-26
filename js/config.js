// Settings for the online features (accounts, sync and the AI teacher).
// Everything here is safe to publish: the Supabase publishable key only allows
// what the database's row-level security rules permit, and the Gemini key is
// never in the app — it stays inside the Cloudflare Worker. Leave a value
// empty to switch that feature off; the rest of the app works without it.
export const CONFIG = {
  // Supabase project (Project Settings → API): e.g. https://abcd1234.supabase.co
  supabaseUrl: '',
  // The project's publishable key (sb_publishable_…) or legacy anon key.
  supabaseKey: '',
  // Where the Cloudflare Worker answers /api/… requests. Empty means "this
  // website" (right when the app is served by the Worker itself). The iOS app
  // and GitHub Pages copy get the full address at build time.
  apiBase: '',
};

export const accountsEnabled = () => Boolean(CONFIG.supabaseUrl && CONFIG.supabaseKey);
export const apiUrl = (path) => `${CONFIG.apiBase.replace(/\/$/, '')}${path}`;
