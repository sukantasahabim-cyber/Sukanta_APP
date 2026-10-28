// Copies the app's files into one folder for publishing (Cloudflare, GitHub
// Pages and the iOS app all use it). There is nothing to compile.
//   node scripts/build.mjs [outDir]          default outDir: dist
// SURTAAL_API_BASE=https://… sets where the copy finds the /api/… server
// (needed when the copy is not served by the Cloudflare Worker itself).
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const out = join(root, process.argv[2] || 'dist');
const FILES = ['index.html', 'privacy.html', 'manifest.webmanifest', 'sw.js', 'css', 'icons', 'js', 'licenses', 'sounds', 'vision'];

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const f of FILES) cpSync(join(root, f), join(out, f), { recursive: true });

const apiBase = process.env.SURTAAL_API_BASE?.trim();
if (apiBase) {
  if (!/^https:\/\/[^\s'"]+$/.test(apiBase)) throw new Error(`SURTAAL_API_BASE must be an https address, got: ${apiBase}`);
  const file = join(out, 'js/config.js');
  const text = readFileSync(file, 'utf8');
  if (!/apiBase: '[^']*'/.test(text)) throw new Error('Could not find apiBase in js/config.js');
  writeFileSync(file, text.replace(/apiBase: '[^']*'/, `apiBase: '${apiBase.replace(/\/$/, '')}'`));
}
console.log(`Built ${out}${apiBase ? ` (API at ${apiBase})` : ''}`);
