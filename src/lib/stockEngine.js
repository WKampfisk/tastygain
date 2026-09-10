/**
 * Pure stock evaluation — ephemeral alerts only (KD-13).
 * Reminder entity rows are created only when the user pins.
 */

export function evaluateStock({
  prepared = [],
  inventory = [],
  household = {},
  storeProducts = [],
}) {
  const minFreezer = household.min_freezer_meals ?? 6;
  const minFridgePrepared = household.min_fridge_prepared ?? 2;
  const minCupboardEssentials = household.min_cupboard_essentials ?? 5;

  const freezerPortions = prepared
    .filter((p) => p.storage_type === 'freezer')
    .reduce((s, p) => s + (p.portions_remaining || 0), 0);
  const fridgePortions = prepared
    .filter((p) => p.storage_type === 'fridge' || p.storage_type === 'ready_now')
    .reduce((s, p) => s + (p.portions_remaining || 0), 0);
  const ready = prepared.reduce((s, p) => s + (p.portions_remaining || 0), 0);

  const essentialKeys = new Set(
    (storeProducts || []).filter((p) => p.is_essential_seed).map((p) => p.essential_key)
  );

  const inv = inventory || [];
  const cupboardEssentials = inv.filter(
    (i) =>
      i.location_zone === 'cupboard' &&
      i.restock_enabled !== false &&
      (i.is_essential || (i.store_product_key && essentialKeys.has(i.store_product_key)))
  );
  const cupboardOk = cupboardEssentials.filter(
    (i) => Number(i.quantity) >= Number(i.minimum_stock ?? 1)
  ).length;
  const cupboardLowLines = cupboardEssentials.filter(
    (i) => Number(i.quantity) < Number(i.minimum_stock ?? 1)
  );

  const fridgeEssentials = inv.filter(
    (i) =>
      i.location_zone === 'fridge' &&
      i.restock_enabled !== false &&
      (i.is_essential || (i.store_product_key && essentialKeys.has(i.store_product_key)))
  );
  const fridgeLowLines = fridgeEssentials.filter(
    (i) => Number(i.quantity) < Number(i.minimum_stock ?? 1)
  );

  const metrics = {
    freezer: freezerPortions,
    fridge: fridgePortions,
    ready,
    cupboardOk,
    cupboardEssentialCount: cupboardEssentials.length,
    fridgeIngredientLow: fridgeLowLines.length,
  };

  const alerts = [];

  if (freezerPortions < minFreezer) {
    alerts.push({
      id: 'low_freezer',
      zone: 'freezer',
      severity: freezerPortions === 0 ? 'high' : 'medium',
      action: 'prep',
      n: freezerPortions,
    });
  }

  if (fridgePortions < minFridgePrepared) {
    alerts.push({
      id: 'low_fridge_prepared',
      zone: 'fridge',
      severity: 'medium',
      action: 'kitchen',
      n: fridgePortions,
    });
  }

  if (fridgeLowLines.length > 0) {
    const hasMilk = fridgeLowLines.some((i) => i.store_product_key === 'whole_milk');
    alerts.push({
      id: hasMilk && fridgeLowLines.length === 1 ? 'milk' : 'low_fridge_ingredients',
      zone: 'fridge',
      severity: 'medium',
      action: 'shopping',
      keys: fridgeLowLines.map((i) => i.store_product_key || i.name),
    });
  }

  const onboardingDone = !!household.onboarding_complete;
  if (cupboardLowLines.length > 0) {
    alerts.push({
      id: 'low_cupboard',
      zone: 'cupboard',
      severity: 'medium',
      action: 'shopping',
      n: cupboardLowLines.length,
    });
  } else if (onboardingDone && cupboardOk < minCupboardEssentials) {
    alerts.push({
      id: 'cupboard_coach',
      zone: 'cupboard',
      severity: 'low',
      action: 'shopping',
      n: cupboardOk,
    });
  }

  if (ready >= 3 && alerts.filter((a) => a.severity !== 'low').length === 0) {
    alerts.push({
      id: 'ok',
      zone: null,
      severity: 'ok',
      action: null,
      n: ready,
    });
  }

  // ≤1 card per alert id
  const byId = new Map();
  for (const a of alerts) {
    if (!byId.has(a.id)) byId.set(a.id, a);
  }

  return {
    metrics,
    alerts: Array.from(byId.values()),
  };
}

export function alertToText(alert, t) {
  if (!alert) return '';
  switch (alert.id) {
    case 'low_freezer':
      return t('stock.lowFreezer', [alert.n]);
    case 'low_fridge_prepared':
      return t('stock.lowFridgePrepared');
    case 'low_fridge_ingredients':
      return t('stock.lowFridgeIngredients');
    case 'milk':
      return t('stock.milkSoon');
    case 'low_cupboard':
      return t('stock.lowCupboard');
    case 'cupboard_coach':
      return t('stock.cupboardCoach');
    case 'ok':
      return t('stock.okReady', [alert.n]);
    default:
      return alert.id;
  }
}
