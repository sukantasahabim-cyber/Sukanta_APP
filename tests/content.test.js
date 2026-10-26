// Lesson translations must match the English lessons exactly in shape,
// translate every string, and keep the same HTML tags.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractTexts } from '../js/i18n/content.js';
import bn from '../js/i18n/content-bn.js';
import hi from '../js/i18n/content-hi.js';

const EN = extractTexts();
const tags = (s) => [...s.matchAll(/<\/?([a-z0-9]+)[^>]*>/g)].map((m) => m[0].startsWith('</') ? `/${m[1]}` : m[1]).join(' ');

// Walks English and translation together; reports missing, extra and mismatched entries.
function compare(en, tr, path, problems) {
  if (typeof en === 'string') {
    if (typeof tr !== 'string' || !tr.trim()) problems.push(`missing ${path}`);
    else if (tags(en) !== tags(tr)) problems.push(`html differs at ${path}: "${tags(en)}" vs "${tags(tr)}"`);
    return;
  }
  if (Array.isArray(en)) {
    if (!Array.isArray(tr)) { problems.push(`missing ${path}`); return; }
    if (tr.length !== en.length) problems.push(`length ${tr.length} ≠ ${en.length} at ${path}`);
    en.forEach((v, i) => compare(v, tr[i], `${path}[${i}]`, problems));
    return;
  }
  if (!tr || typeof tr !== 'object') { problems.push(`missing ${path}`); return; }
  for (const k of Object.keys(en)) compare(en[k], tr[k], `${path}.${k}`, problems);
  for (const k of Object.keys(tr)) if (!(k in en)) problems.push(`extra ${path}.${k}`);
}

for (const [name, tr, done] of [['Bengali', bn, true], ['Hindi', hi, Object.keys(hi).length > 0]]) {
  test(`${name} lessons are complete and match the English structure`, { skip: !done && 'not written yet' }, () => {
    const problems = [];
    compare(EN, tr, name, problems);
    assert.deepEqual(problems.slice(0, 25), []);
  });
}
