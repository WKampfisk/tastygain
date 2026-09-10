/**
 * Substrings that must never appear in default UI message trees (trauma-informed).
 * Used by Vitest banned-phrase tests. Extend carefully; document allowlist exceptions in tests.
 */
export const BANNED_PHRASES_NB = [
  'du må spise mer',
  'du er for tynn',
  'slank',
  'kaloriunderskudd',
  'skyld',
  'sviktet',
  'dårlig pasient',
  'tving',
  'juksemåltid',
  'dirty bulk',
];

export const BANNED_PHRASES_EN = [
  'you must eat more',
  'you are too thin',
  'you failed',
  'force yourself',
  'bad patient',
  'calorie deficit',
  'you should feel guilty',
  'cheat meal',
  'dirty bulk',
];

/** Flatten nested message objects into string values for scanning */
export function flattenMessageStrings(obj, out = []) {
  if (obj == null) return out;
  if (typeof obj === 'string') {
    out.push(obj);
    return out;
  }
  if (typeof obj === 'function') return out;
  if (Array.isArray(obj)) {
    for (const item of obj) flattenMessageStrings(item, out);
    return out;
  }
  if (typeof obj === 'object') {
    for (const v of Object.values(obj)) flattenMessageStrings(v, out);
  }
  return out;
}

export function findBannedInText(text, bannedList) {
  const lower = String(text).toLowerCase();
  return bannedList.filter((p) => lower.includes(p.toLowerCase()));
}
