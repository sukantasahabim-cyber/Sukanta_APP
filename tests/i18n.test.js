import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import en from '../js/i18n/en.js';
import bn from '../js/i18n/bn.js';
import hi from '../js/i18n/hi.js';
import { NAME_TABLES } from '../js/i18n/names.js';
import { detectLanguage } from '../js/i18n/i18n.js';
import { TAALS } from '../js/data/taals.js';
import { FAMILY_OF } from '../js/analysis/strokes.js';

const root = new URL('..', import.meta.url).pathname;
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const code = walk(join(root, 'js')).filter((f) => !f.includes('/i18n/')).map((f) => readFileSync(f, 'utf8')).join('\n');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const placeholders = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

test('every key used in the code exists in English', () => {
  const used = new Set([...code.matchAll(/\bt\('([\w.]+)'/g)].map((m) => m[1]));
  // String literals that look like keys (used via variables, e.g. labels in tables).
  const prefixes = new Set(Object.keys(en).map((k) => k.split('.')[0]));
  for (const [, lit] of code.matchAll(/'([a-z][a-zA-Z]*\.[\w.]+)'/g)) {
    if (prefixes.has(lit.split('.')[0]) && !/\.(js|css|svg|png|json|html|webmanifest)$/.test(lit)) used.add(lit);
  }
  for (const [, k] of html.matchAll(/data-i18n="([\w.]+)"/g)) used.add(k);
  // Keys built at runtime.
  for (let i = 1; i <= 7; i++) used.add(`home.tip${i}`);
  ['early', 'late', 'missed'].forEach((s) => used.add(`rhythm.${s}`));
  new Set(Object.values(FAMILY_OF)).forEach((f) => used.add(`family.${f}`));
  ['taal', 'tanpura', 'tuner', 'pitch', 'mic', 'metronome', 'swaras', 'ear', 'chords', 'timer'].forEach((id) => { used.add(`tool.${id}.name`); used.add(`tool.${id}.desc`); });
  ['plan.warmSinging', 'plan.warmTabla', 'plan.warmGuitar', 'plan.ear'].forEach((k) => used.add(`${k}Detail`));
  const missing = [...used].filter((k) => !(k in en));
  assert.deepEqual(missing, []);
});

for (const [name, dict] of [['Bengali', bn], ['Hindi', hi]]) {
  test(`${name} interface has every English key, with the same placeholders`, () => {
    assert.deepEqual(Object.keys(en).filter((k) => !(k in dict)), [], 'missing keys');
    assert.deepEqual(Object.keys(dict).filter((k) => !(k in en)), [], 'unknown keys');
    for (const k of Object.keys(en)) {
      assert.ok(dict[k].trim(), `${k} is empty`);
      assert.equal(placeholders(dict[k]), placeholders(en[k]), `placeholders differ in ${k}`);
    }
  });
}

test('every bol, swara and taal has a name in each script', () => {
  const bolTokens = [...new Set([...Object.keys(FAMILY_OF), ...Object.values(TAALS).flatMap((t) => t.bols.flat().map((b) => b.toLowerCase()))])];
  for (const lang of ['bn', 'hi']) {
    for (const b of bolTokens) assert.ok(NAME_TABLES.BOLS[lang][b], `${lang} missing bol ${b}`);
    for (const s of ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni']) assert.ok(NAME_TABLES.SWARAS[lang][s], `${lang} missing swara ${s}`);
    for (const id of Object.keys(TAALS)) assert.ok(NAME_TABLES.TAALS[lang][id], `${lang} missing taal ${id}`);
  }
});

test('the browser language picks the first-run suggestion', () => {
  assert.equal(detectLanguage({ languages: ['bn-IN', 'en'] }), 'bn');
  assert.equal(detectLanguage({ languages: ['hi'] }), 'hi');
  assert.equal(detectLanguage({ languages: ['fr-FR', 'en-GB'] }), 'en');
  assert.equal(detectLanguage({ language: 'de' }), 'en');
});
