import { nb } from './messages/nb.js';
import { en } from './messages/en.js';

export const DEFAULT_LOCALE = 'nb';
export const LOCALES = ['nb', 'en'];

export function normalizeLocale(locale) {
  return locale === 'en' ? 'en' : 'nb';
}

export function applyDocumentLang(locale) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = normalizeLocale(locale);
}

function getByPath(obj, path) {
  const parts = String(path).split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

export function createT(locale) {
  const dict = normalizeLocale(locale) === 'en' ? en : nb;
  return function t(key, vars) {
    const val = getByPath(dict, key);
    if (typeof val === 'function') {
      if (Array.isArray(vars)) return val(...vars);
      if (vars != null && typeof vars === 'object' && '0' in vars) {
        return val(...Object.keys(vars).sort().map((k) => vars[k]));
      }
      return val(vars);
    }
    if (val == null) return key;
    if (typeof val === 'string' && vars && typeof vars === 'object') {
      return val.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{${k}}`));
    }
    return val;
  };
}

export { nb, en };
