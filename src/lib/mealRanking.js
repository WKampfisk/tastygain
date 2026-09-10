/** Sort recipes for appetite, flavor prefs, and protein */

export function sortRecipesForReadiness(recipes, readiness = null, flavorPrefs = []) {
  const list = [...(recipes || [])];
  const appetite = readiness?.appetite || 'moderate';
  const preferLiquid = readiness?.prefer_liquid_solid === 'liquid';
  const preferCold = readiness?.prefer_hot_cold === 'cold';
  const prefs = new Set(flavorPrefs || []);

  const score = (r) => {
    let s = 0;
    if (r.low_effort) s += 3;
    if (r.difficult_day_suitable) s += 2;
    const tags = r.flavor_tags || [];
    if (prefs.size) {
      s += tags.filter((t) => prefs.has(t)).length * 4;
    }
    const protein = Number(r.protein_g) || 0;
    if (protein >= 15) s += 3;
    else if (protein >= 8) s += 1;
    if (appetite === 'very_low' || appetite === 'low') {
      if (r.category === 'smoothie_shake' || r.category === 'dessert') s += 4;
      if (tags.includes('candy') || tags.includes('cake') || tags.includes('sweet')) s += 3;
      if (r.portion_size_label?.includes('liten') || r.portion_size_label?.includes('lite')) s += 1;
      if (r.energy_density === 'high') s += 1;
    }
    if (preferLiquid && (r.category === 'smoothie_shake' || r.category === 'soup')) s += 3;
    if (preferCold && r.temperature === 'cold') s += 2;
    if (r.category === 'dessert') s += 1;
    return s;
  };

  return list.sort((a, b) => score(b) - score(a));
}

export function categoryMatchesChip(recipeOrCategory, chip) {
  if (!chip || chip === 'all') return true;
  const isObj = recipeOrCategory && typeof recipeOrCategory === 'object';
  const recipeCategory = isObj ? recipeOrCategory.category : recipeOrCategory;
  const tags = isObj ? recipeOrCategory.flavor_tags || [] : [];
  if (chip === 'cake') return tags.includes('cake');
  if (chip === 'candy') return tags.includes('candy');
  if (chip === 'salty') return tags.includes('salty');
  if (chip === 'sweet') return tags.includes('sweet') || recipeCategory === 'dessert';
  if (chip === 'meals' || chip === 'dinner') return recipeCategory === 'dinner';
  if (chip === 'shakes' || chip === 'smoothie_shake') return recipeCategory === 'smoothie_shake';
  if (chip === 'snacks' || chip === 'snack_small') return recipeCategory === 'snack_small';
  if (chip === 'soups' || chip === 'soup') return recipeCategory === 'soup';
  if (chip === 'desserts' || chip === 'dessert') return recipeCategory === 'dessert';
  if (chip === 'batch' || chip === 'food_prep') return recipeCategory === 'food_prep';
  return recipeCategory === chip;
}
