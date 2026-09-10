/**
 * Pure engines: recipe selections → shopping + containers + prep steps
 * (Symbiotic Plan → Handle → Tilbered)
 */
import { INGREDIENT_ALIASES, PACK_SIZES } from '@/data/ingredientMap';
import { calculateBatchContainers } from '@/lib/containers';

export function parseNbNumber(q) {
  if (typeof q === 'number') return q;
  return parseFloat(String(q).replace(',', '.').replace(/\s/g, '')) || 0;
}

export function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const UNIT_FACTORS = {
  g: { base: 'g', f: 1 },
  kg: { base: 'g', f: 1000 },
  ml: { base: 'ml', f: 1 },
  dl: { base: 'ml', f: 100 },
  l: { base: 'ml', f: 1000 },
  ts: { base: 'ml', f: 5 },
  ss: { base: 'ml', f: 15 },
  stk: { base: 'stk', f: 1 },
  skive: { base: 'stk', f: 1 },
  skiver: { base: 'stk', f: 1 },
  pk: { base: 'stk', f: 1 },
};

export function toBase(qty, unit) {
  const u = String(unit || 'stk').toLowerCase().replace('.', '');
  const row = UNIT_FACTORS[u] || { base: 'stk', f: 1, uncertain: true };
  return {
    base: row.base,
    value: parseNbNumber(qty) * row.f,
    uncertain: !!row.uncertain || !UNIT_FACTORS[u],
  };
}

export function formatBase(value, base) {
  if (base === 'ml') {
    if (value >= 1000) return `${(value / 1000).toLocaleString('nb-NO', { maximumFractionDigits: 2 })} L`;
    if (value >= 100) return `${(value / 100).toLocaleString('nb-NO', { maximumFractionDigits: 1 })} dl`;
    return `${Math.round(value)} ml`;
  }
  if (base === 'g') {
    if (value >= 1000) return `${(value / 1000).toLocaleString('nb-NO', { maximumFractionDigits: 2 })} kg`;
    return `${Math.round(value)} g`;
  }
  return `${Math.ceil(value * 100) / 100} stk`;
}

function resolveAlias(name) {
  const n = normalizeName(name);
  if (INGREDIENT_ALIASES[n]) return INGREDIENT_ALIASES[n];
  // partial: first word
  const first = n.split(' ')[0];
  if (INGREDIENT_ALIASES[first]) return INGREDIENT_ALIASES[first];
  return { store_product_key: null, base_unit: 'stk', category: 'pantry' };
}

/**
 * @param {object} draft - planDraft with selections
 * @param {{ recipes, inventory, storeProducts, household }} ctx
 */
export function recomputePlan(draft, ctx) {
  const { recipes = [], inventory = [], storeProducts = [], household = {} } = ctx;
  const includeOptional = !!draft?.include_optional;
  const selections = draft?.selections || [];
  // Prefer primary_chain via shared catalogue order (inline to avoid circular deps)
  const preferred =
    household.primary_chain || household.preferred_chains?.[0] || 'kiwi';

  const needsMap = new Map();

  for (const sel of selections) {
    const recipe = recipes.find((r) => r.id === sel.recipe_id);
    if (!recipe) continue;
    const recipePortions = Math.max(1, recipe.portions || 1);
    const scale = Math.max(1, sel.portions || 1) / recipePortions;

    for (const ing of recipe.ingredients || []) {
      if (ing.optional && !includeOptional) continue;
      const alias = resolveAlias(ing.name);
      const converted = toBase(ing.quantity, ing.unit);
      const needed_base = converted.value * scale;
      const key = alias.store_product_key || `ft:${normalizeName(ing.name)}`;
      const prev = needsMap.get(key) || {
        key,
        name_nb: ing.name,
        category: alias.category || 'pantry',
        needed_base: 0,
        base_unit: converted.base,
        store_product_key: alias.store_product_key,
        needed_for: [],
        optional_only: true,
        unit_uncertain: false,
      };
      prev.needed_base += needed_base;
      if (!ing.optional) prev.optional_only = false;
      if (converted.uncertain) prev.unit_uncertain = true;
      prev.needed_for.push({
        recipe_id: recipe.id,
        recipe_name: recipe.name,
        amount_label: `${sel.portions}× (${ing.quantity} ${ing.unit})`,
        optional: !!ing.optional,
      });
      needsMap.set(key, prev);
    }
  }

  const ingredient_needs = [];
  for (const need of needsMap.values()) {
    let have_base = 0;
    for (const inv of inventory) {
      const matchKey =
        need.store_product_key && inv.store_product_key === need.store_product_key;
      const matchName = normalizeName(inv.name) === normalizeName(need.name_nb);
      if (!matchKey && !matchName) continue;
      const invBase = toBase(inv.quantity, inv.unit || 'stk');
      if (invBase.base !== need.base_unit) continue; // conservative
      have_base += invBase.value;
    }
    const buy_base = Math.max(0, need.needed_base - have_base);
    const product = need.store_product_key
      ? storeProducts.find((p) => p.essential_key === need.store_product_key)
      : null;
    const pack = need.store_product_key ? PACK_SIZES[need.store_product_key] : null;
    // Pack ceil only when mapped to catalogue pack size in matching base unit.
    // Free-text g/ml must NOT become "400 packs" (critical review fix).
    let packs_to_buy = 0;
    let shop_quantity = '0';
    let shop_unit = need.base_unit;
    let estimated_price_ore = null;
    if (buy_base > 0) {
      if (pack && pack.unit === need.base_unit) {
        packs_to_buy = Math.max(1, Math.ceil(buy_base / pack.size));
        shop_quantity = String(packs_to_buy);
        shop_unit = 'pk';
        if (product?.prices?.length) {
          const price =
            product.prices.find((p) => p.chain === preferred) || product.prices[0];
          estimated_price_ore = (price?.price_ore || 0) * packs_to_buy;
        }
      } else if (need.base_unit === 'stk' && !need.unit_uncertain) {
        packs_to_buy = Math.max(1, Math.ceil(buy_base));
        shop_quantity = String(packs_to_buy);
        shop_unit = 'stk';
      } else {
        // Free-text weight/volume: one shopping line with human quantity
        packs_to_buy = 1;
        shop_quantity = formatBase(buy_base, need.base_unit);
        shop_unit = need.base_unit === 'ml' || need.base_unit === 'g' ? 'ca.' : 'stk';
      }
    }

    ingredient_needs.push({
      ...need,
      have_base,
      buy_base,
      display_needed: formatBase(need.needed_base, need.base_unit),
      display_have: formatBase(have_base, need.base_unit),
      display_buy: buy_base > 0 ? formatBase(buy_base, need.base_unit) : '0',
      estimated_price_ore,
      packs_to_buy,
      shop_quantity,
      shop_unit,
      preferred_chain: preferred,
      pack_label: pack?.label || null,
      product_name_nb: product?.name_nb || need.name_nb,
    });
  }

  ingredient_needs.sort((a, b) => a.name_nb.localeCompare(b.name_nb, 'nb'));

  const shopping_lines = ingredient_needs
    .filter((n) => n.buy_base > 0)
    .map((n) => ({
      name: n.product_name_nb || n.name_nb,
      name_nb: n.product_name_nb || n.name_nb,
      name_normalized: normalizeName(n.product_name_nb || n.name_nb),
      quantity: n.shop_quantity || String(n.packs_to_buy || 1),
      unit: n.shop_unit || 'stk',
      category: n.category,
      estimated_price_ore: n.estimated_price_ore
        ? Math.round(n.estimated_price_ore / Math.max(1, n.packs_to_buy || 1))
        : null,
      line_total_ore: n.estimated_price_ore,
      preferred_chain: n.preferred_chain,
      store_product_key: n.store_product_key,
      needed_for: n.needed_for,
      recipe_ids: n.needed_for.map((x) => x.recipe_id),
      source: 'prep_session',
      automatic_reason: 'Fra forberedelsesøkt',
      is_essential: false,
    }));

  const estimate_total_ore = shopping_lines.reduce(
    (s, l) => s + (l.line_total_ore || 0),
    0
  );

  const container_plan = aggregateContainers(selections, recipes);
  const prep_steps = buildPrepSteps(selections, recipes, container_plan);

  return {
    ingredient_needs,
    shopping_lines,
    container_plan,
    prep_steps,
    estimate_total_ore,
    last_computed_at: new Date().toISOString(),
    stats: {
      recipe_count: selections.length,
      shop_count: shopping_lines.length,
      container_count: container_plan.total_containers,
      estimate_total_ore,
    },
  };
}

export function aggregateContainers(selections, recipes) {
  const linesMap = new Map();
  let total = 0;
  let freezable = 0;
  let shake = 0;
  let food = 0;

  for (const sel of selections) {
    const recipe = recipes.find((r) => r.id === sel.recipe_id);
    if (!recipe) continue;
    const batch = calculateBatchContainers(recipe, sel.portions || 1);
    total += batch.total_containers;
    freezable += batch.freezable_needed;
    shake += batch.shake_needed;
    food += batch.food_needed;
    for (const line of batch.lines) {
      const prev = linesMap.get(line.type) || { ...line, count: 0, recipes: [] };
      prev.count += line.count;
      prev.recipes.push(recipe.name);
      linesMap.set(line.type, prev);
    }
  }

  return {
    lines: Array.from(linesMap.values()),
    total_containers: total,
    freezable_needed: freezable,
    shake_needed: shake,
    food_needed: food,
  };
}

export function buildPrepSteps(selections, recipes, container_plan) {
  const steps = [];
  let i = 1;
  steps.push({
    n: i++,
    phase: 'setup',
    text: `Finn frem beholdere: ${
      container_plan.lines.map((l) => `${l.count}× ${l.label}`).join(', ') || 'ingen'
    }.`,
  });
  steps.push({
    n: i++,
    phase: 'setup',
    text: 'Rydd plass på benken. Ha etiketter/penn klar for dato.',
  });

  const shakes = selections.filter((s) => {
    const r = recipes.find((x) => x.id === s.recipe_id);
    return r?.category === 'smoothie_shake';
  });
  const dinners = selections.filter((s) => {
    const r = recipes.find((x) => x.id === s.recipe_id);
    return r?.category === 'dinner';
  });
  const snacks = selections.filter((s) => {
    const r = recipes.find((x) => x.id === s.recipe_id);
    return r && r.category !== 'smoothie_shake' && r.category !== 'dinner';
  });

  for (const sel of dinners) {
    const r = recipes.find((x) => x.id === sel.recipe_id);
    steps.push({
      n: i++,
      phase: 'cook',
      text: `Tilbered ${r?.name || sel.recipe_name} (${sel.portions} porsjoner) — start først (lengst tid).`,
    });
  }
  for (const sel of snacks) {
    const r = recipes.find((x) => x.id === sel.recipe_id);
    steps.push({
      n: i++,
      phase: 'cook',
      text: `Lag ${r?.name || sel.recipe_name} (${sel.portions} porsjoner).`,
    });
  }
  for (const sel of shakes) {
    const r = recipes.find((x) => x.id === sel.recipe_id);
    steps.push({
      n: i++,
      phase: 'cook',
      text: `Blend ${r?.name || sel.recipe_name} (${sel.portions} porsjoner) i shakeflasker.`,
    });
  }

  steps.push({
    n: i++,
    phase: 'label',
    text: 'Fyll beholdere, merk med dato og innhold, sett i kjøleskap eller fryser.',
  });
  steps.push({
    n: i++,
    phase: 'done',
    text: 'Bekreft tilberedning i appen — da lagres porsjoner og én ny oppskrift genereres per rett.',
  });

  return steps;
}

export function mergeShoppingCommit(existingShopping, draftLines, sessionId, householdId) {
  // Remove previous un-checked session lines for this session
  let shopping = (existingShopping || []).filter(
    (s) => !(s.session_id === sessionId && s.source === 'prep_session' && !s.checked)
  );
  const ids = [];
  for (const line of draftLines || []) {
    const row = {
      id: `shop_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      household_id: householdId,
      ...line,
      checked: false,
      session_id: sessionId,
      source: 'prep_session',
    };
    // merge with existing open line same product key
    const existing = shopping.find(
      (s) =>
        !s.checked &&
        ((line.store_product_key && s.store_product_key === line.store_product_key) ||
          s.name_normalized === line.name_normalized)
    );
    if (existing && existing.session_id === sessionId) {
      shopping = shopping.map((s) =>
        s.id === existing.id
          ? {
              ...s,
              quantity: String(
                Number(s.quantity || 0) + Number(line.quantity || 0)
              ),
              needed_for: [...(s.needed_for || []), ...(line.needed_for || [])],
            }
          : s
      );
      ids.push(existing.id);
    } else if (existing && existing.source !== 'prep_session') {
      // leave manual; still add session line with note
      shopping.unshift(row);
      ids.push(row.id);
    } else {
      shopping.unshift(row);
      ids.push(row.id);
    }
  }
  return { shopping, committed_ids: ids };
}

export function createEmptyDraft(householdId) {
  const now = new Date().toISOString();
  return {
    id: `draft_${Date.now().toString(36)}`,
    household_id: householdId,
    status: 'planning',
    step: 'plan',
    created_at: now,
    updated_at: now,
    include_optional: false,
    selections: [],
    computed: null,
    committed_shopping_ids: [],
    completed_prep_ids: [],
  };
}
