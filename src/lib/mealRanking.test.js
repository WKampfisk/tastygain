import { describe, expect, it } from 'vitest';
import { categoryMatchesChip, sortRecipesForReadiness } from './mealRanking.js';

const cake = {
  id: 'cake',
  category: 'dessert',
  flavor_tags: ['cake', 'sweet'],
  protein_g: 18,
  low_effort: true,
};
const salty = {
  id: 'salty',
  category: 'snack_small',
  flavor_tags: ['salty'],
  protein_g: 12,
  low_effort: true,
};
const soup = {
  id: 'soup',
  category: 'soup',
  flavor_tags: ['salty'],
  protein_g: 8,
  low_effort: false,
};

describe('sortRecipesForReadiness', () => {
  it('ranks cake higher when cake is a flavor preference', () => {
    const ranked = sortRecipesForReadiness([soup, salty, cake], null, ['cake']);
    expect(ranked[0].id).toBe('cake');
  });

  it('ranks candy/cake higher when appetite is low', () => {
    const ranked = sortRecipesForReadiness([soup, cake], { appetite: 'low' }, []);
    expect(ranked[0].id).toBe('cake');
  });
});

describe('categoryMatchesChip', () => {
  it('matches flavor chips on recipe tags', () => {
    expect(categoryMatchesChip(cake, 'cake')).toBe(true);
    expect(categoryMatchesChip(cake, 'candy')).toBe(false);
    expect(categoryMatchesChip(salty, 'salty')).toBe(true);
    expect(categoryMatchesChip(cake, 'all')).toBe(true);
  });

  it('still matches category chips from a string', () => {
    expect(categoryMatchesChip('dinner', 'meals')).toBe(true);
    expect(categoryMatchesChip('smoothie_shake', 'shakes')).toBe(true);
  });
});
