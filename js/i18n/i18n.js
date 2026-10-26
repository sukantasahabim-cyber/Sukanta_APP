// Interface translations. English (en.js) is the source of every key;
// Bengali and Hindi fall back to English for anything missing.
import { store } from '../store.js';
import en from './en.js';
import bn from './bn.js';
import hi from './hi.js';

export const LANGUAGES = [
  { id: 'en', label: 'English', short: 'EN' },
  { id: 'bn', label: 'বাংলা', short: 'বাং' },
  { id: 'hi', label: 'हिन्दी', short: 'हिं' },
];

export const DICTIONARIES = { en, bn, hi };

// Language the browser asks for, used to preselect the first-run choice.
export function detectLanguage(nav = globalThis.navigator) {
  const wanted = (nav?.languages?.length ? nav.languages : [nav?.language || 'en']).map((l) => l.toLowerCase());
  for (const l of wanted) {
    if (l.startsWith('bn')) return 'bn';
    if (l.startsWith('hi')) return 'hi';
    if (l.startsWith('en')) return 'en';
  }
  return 'en';
}

export const lang = () => (DICTIONARIES[store.setting('lang')] ? store.setting('lang') : 'en');
export const languageChosen = () => Boolean(DICTIONARIES[store.setting('lang')]);

// Placeholders any string may use without passing a value, e.g. {sa} for the
// home note's name (registered by notation.js).
const textDefaults = {};
export function setTextDefault(name, fn) { textDefaults[name] = fn; }

// t('key', { name: 'value' }) — `{name}` placeholders are filled from vars.
export function t(key, vars) {
  const text = DICTIONARIES[lang()][key] ?? en[key] ?? key;
  if (!text.includes('{')) return text;
  return text.replace(/\{(\w+)\}/g, (m, k) => (vars?.[k] ?? textDefaults[k]?.() ?? (vars ? '' : m)));
}
