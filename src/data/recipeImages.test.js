import { describe, expect, it } from 'vitest';
import { GAIN_RECIPES } from './gainSeed.js';
import { RECIPES } from './seed.js';
import {
  RECIPE_IMAGES,
  imageForRecipe,
  uniqueImageForGenerated,
  withRecipeMedia,
} from './recipeImages.js';
import { generateRecipeFromUse } from '@/lib/recipeGenerator.js';

describe('recipe photos', () => {
  it('gives every seeded recipe its own unique image_url', () => {
    const urls = RECIPES.map((r) => withRecipeMedia(r).image_url);
    expect(urls.every(Boolean)).toBe(true);
    const unique = new Set(urls);
    expect(unique.size).toBe(urls.length);
  });

  it('does not reuse another recipe photo for gain recipes', () => {
    expect(RECIPE_IMAGES.r_skyr_jam).toMatch(/r_skyr_jam\.jpg$/);
    expect(RECIPE_IMAGES.r_choc_pudding).toMatch(/r_choc_pudding\.jpg$/);
    expect(RECIPE_IMAGES.r_nuts_cheese).toMatch(/r_nuts_cheese\.jpg$/);
    expect(RECIPE_IMAGES.r_ham_cheese).toMatch(/r_ham_cheese\.jpg$/);
    expect(RECIPE_IMAGES.r_protein_bar_candy).toMatch(/r_protein_bar_candy\.jpg$/);
    GAIN_RECIPES.forEach((r) => {
      expect(imageForRecipe(r)).toMatch(/recipe-images\//);
    });
  });

  it('assigns a different photo when generating later copies', () => {
    const first = generateRecipeFromUse({ category: 'dessert' }, []);
    const second = generateRecipeFromUse({ category: 'dessert' }, [first]);
    const third = generateRecipeFromUse({ category: 'dessert' }, [first, second]);
    expect(first.image_url).toBeTruthy();
    expect(second.image_url).toBeTruthy();
    expect(new Set([first.image_url, second.image_url, third.image_url]).size).toBe(3);
  });

  it('uniqueImageForGenerated skips already used photos', () => {
    const used = uniqueImageForGenerated('gen_mini_pancakes', []);
    const next = uniqueImageForGenerated('gen_mini_pancakes', [{ image_url: used }]);
    expect(next).not.toBe(used);
  });
});
