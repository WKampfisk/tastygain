import { describe, expect, it } from 'vitest';
import {
  BANNED_PHRASES_EN,
  BANNED_PHRASES_NB,
  findBannedInText,
  flattenMessageStrings,
} from './banned.js';
import { nb } from './messages/nb.js';
import { en } from './messages/en.js';

describe('banned phrases helpers', () => {
  it('exports non-empty banned lists', () => {
    expect(BANNED_PHRASES_NB.length).toBeGreaterThan(0);
    expect(BANNED_PHRASES_EN.length).toBeGreaterThan(0);
  });

  it('default message trees contain no banned phrases', () => {
    for (const text of flattenMessageStrings(nb)) {
      expect(findBannedInText(text, BANNED_PHRASES_NB)).toEqual([]);
    }
    for (const text of flattenMessageStrings(en)) {
      expect(findBannedInText(text, BANNED_PHRASES_EN)).toEqual([]);
    }
  });
});
