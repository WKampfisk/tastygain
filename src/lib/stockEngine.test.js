import { describe, expect, it } from 'vitest';
import { evaluateStock } from './stockEngine.js';

const essentials = [
  { essential_key: 'whole_milk', is_essential_seed: true },
  { essential_key: 'oats', is_essential_seed: true },
  { essential_key: 'pasta', is_essential_seed: true },
  { essential_key: 'rice', is_essential_seed: true },
  { essential_key: 'peanut_butter', is_essential_seed: true },
];

describe('evaluateStock', () => {
  it('flags low freezer', () => {
    const { alerts, metrics } = evaluateStock({
      prepared: [],
      inventory: [],
      household: { min_freezer_meals: 6, onboarding_complete: true },
      storeProducts: essentials,
    });
    expect(metrics.freezer).toBe(0);
    expect(alerts.some((a) => a.id === 'low_freezer')).toBe(true);
  });

  it('flags milk as fridge ingredient when low', () => {
    const { alerts } = evaluateStock({
      prepared: [
        { storage_type: 'freezer', portions_remaining: 8 },
        { storage_type: 'fridge', portions_remaining: 3 },
      ],
      inventory: [
        {
          store_product_key: 'whole_milk',
          location_zone: 'fridge',
          quantity: 0,
          minimum_stock: 2,
          restock_enabled: true,
          is_essential: true,
        },
      ],
      household: { min_freezer_meals: 6, onboarding_complete: true },
      storeProducts: essentials,
    });
    expect(alerts.some((a) => a.id === 'milk' || a.id === 'low_fridge_ingredients')).toBe(true);
  });

  it('skips cupboard coach before onboarding', () => {
    const { alerts } = evaluateStock({
      prepared: [{ storage_type: 'freezer', portions_remaining: 10 }],
      inventory: [],
      household: { min_freezer_meals: 6, onboarding_complete: false },
      storeProducts: essentials,
    });
    expect(alerts.some((a) => a.id === 'cupboard_coach')).toBe(false);
  });
});
