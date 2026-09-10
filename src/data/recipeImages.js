/**
 * Recipe photography for Idellicious.
 * Prefer unique local AI meal photos under /recipe-images/; fall back by category.
 */

const local = (id) => `/recipe-images/${id}.jpg`;

/** Per-recipe unique meal photos (AI-generated food photography) */
export const RECIPE_IMAGES = {
  r_bp_shake: local('r_bp_shake'),
  r_berry_smoothie: local('r_berry_smoothie'),
  r_choc_shake: local('r_choc_shake'),
  r_mild_breakfast: local('r_mild_breakfast'),
  r_coffee_shake: local('r_coffee_shake'),
  r_cheese_toast: local('r_cheese_toast'),
  r_egg_sandwich: local('r_egg_sandwich'),
  r_pb_banana: local('r_pb_banana'),
  r_yoghurt_bowl: local('r_yoghurt_bowl'),
  r_overnight_oats: local('r_overnight_oats'),
  r_scramble: local('r_scramble'),
  r_porridge: local('r_porridge'),
  r_soup_bread: local('r_soup_bread'),
  r_crackers_cheese: local('r_crackers_cheese'),
  r_creamy_chicken: local('r_creamy_chicken'),
  r_mac_cheese: local('r_mac_cheese'),
  r_chicken_rice: local('r_chicken_rice'),
  r_tomato_pasta: local('r_tomato_pasta'),
  r_meatballs: local('r_meatballs'),
  r_chicken_soup: local('r_chicken_soup'),
  r_potato_soup: local('r_potato_soup'),
  r_omelette: local('r_omelette'),
  r_rice_pudding: local('r_rice_pudding'),
  r_banana_custard: local('r_banana_custard'),
  r_tomato_soup: local('r_tomato_soup'),
  r_mug_cake: local('r_mug_cake'),
  r_protein_brownie: local('r_protein_brownie'),
  r_cheesecake_cup: local('r_cheesecake_cup'),
  r_snickers_bites: local('r_snickers_bites'),
  r_yoghurt_bark: local('r_yoghurt_bark'),
  r_protein_balls: local('r_protein_balls'),
  r_ice_cream_shake: local('r_ice_cream_shake'),
  r_chips_kesam: local('r_chips_kesam'),
  r_bacon_egg: local('r_bacon_egg'),
  r_skyr_jam: local('r_yoghurt_bowl'),
  r_choc_pudding: local('r_rice_pudding'),
  r_nuts_cheese: local('r_crackers_cheese'),
  r_ham_cheese: local('r_cheese_toast'),
  r_protein_bar_candy: local('r_choc_shake'),
};

/** Category fallbacks if a specific variant photo is missing */
export const CATEGORY_IMAGES = {
  smoothie_shake: local('cat_smoothie_shake'),
  dinner: local('cat_dinner'),
  snack_small: local('cat_snack_small'),
  food_prep: local('cat_food_prep'),
  soup: local('cat_soup'),
  dessert: local('cat_dessert'),
};

/** Unique AI meal photos for every auto-generated recipe variant */
export const VARIANT_IMAGES = {
  gen_havre_honning_shake: local('gen_havre_honning_shake'),
  gen_vanilje_banan_shake: local('gen_vanilje_banan_shake'),
  gen_kakao_havre_shake: local('gen_kakao_havre_shake'),
  gen_bringebaer_shake: local('gen_bringebaer_shake'),
  gen_kokos_banan_shake: local('gen_kokos_banan_shake'),
  gen_laks_potet: local('gen_laks_potet'),
  gen_kyllinggryte: local('gen_kyllinggryte'),
  gen_pasta_ostesaus: local('gen_pasta_ostesaus'),
  gen_torsk_potetmos: local('gen_torsk_potetmos'),
  gen_linse_suppe: local('gen_linse_suppe'),
  gen_ricotta_brod: local('gen_ricotta_brod'),
  gen_melkekakao: local('gen_melkekakao'),
  gen_banan_peanott: local('gen_banan_peanott'),
  gen_risholding: local('gen_risholding'),
  gen_ost_eple: local('gen_ost_eple'),
  gen_blomkaalsuppe: local('gen_blomkaalsuppe'),
  gen_gulrotsuppe: local('gen_gulrotsuppe'),
  gen_vaniljeyoghurt: local('gen_vaniljeyoghurt'),
  gen_banan_kakao: local('gen_banan_kakao'),
};

/** Match generated recipe names (with optional " (2)" suffix) to variant photos */
const VARIANT_NAME_TO_KEY = {
  'havre-honning-shake': 'gen_havre_honning_shake',
  'vanilje-banan-shake': 'gen_vanilje_banan_shake',
  'kakao-havre-shake': 'gen_kakao_havre_shake',
  'bringebær-yoghurt-shake': 'gen_bringebaer_shake',
  'kokos-banan-shake': 'gen_kokos_banan_shake',
  'kremet laks med potet': 'gen_laks_potet',
  'mild kyllinggryte med ris': 'gen_kyllinggryte',
  'pasta med mild ostesaus': 'gen_pasta_ostesaus',
  'ovnsbakt torsk med potetmos': 'gen_torsk_potetmos',
  'linse- og grønnsakssuppe': 'gen_linse_suppe',
  'ricotta på ristet brød': 'gen_ricotta_brod',
  'varm melkekakao': 'gen_melkekakao',
  'banan med peanøttsmør (skål)': 'gen_banan_peanott',
  'mild risholding': 'gen_risholding',
  'ostestenger med eple': 'gen_ost_eple',
  'mild blomkålsuppe': 'gen_blomkaalsuppe',
  'gulrotsuppe med fløte': 'gen_gulrotsuppe',
  'vaniljeyoghurt med honning': 'gen_vaniljeyoghurt',
  'banan med kakao': 'gen_banan_kakao',
};

export function imageForVariantName(name) {
  if (!name) return null;
  const base = String(name)
    .toLowerCase()
    .replace(/\s*\(\d+\)\s*$/, '')
    .trim();
  const key = VARIANT_NAME_TO_KEY[base];
  return key ? VARIANT_IMAGES[key] : null;
}

export const RECIPE_NAME_EN = {
  r_bp_shake: 'Banana peanut butter shake',
  r_berry_smoothie: 'Berry yoghurt smoothie',
  r_choc_shake: 'Chocolate banana shake',
  r_mild_breakfast: 'Mild breakfast smoothie',
  r_coffee_shake: 'Coffee breakfast shake',
  r_cheese_toast: 'Cheese toast',
  r_egg_sandwich: 'Eggs on bread',
  r_pb_banana: 'Peanut butter banana toast',
  r_yoghurt_bowl: 'Yoghurt bowl',
  r_overnight_oats: 'Overnight oats',
  r_scramble: 'Scrambled eggs',
  r_porridge: 'Creamy porridge',
  r_soup_bread: 'Soup with bread',
  r_crackers_cheese: 'Crackers with cheese',
  r_creamy_chicken: 'Creamy chicken pasta',
  r_mac_cheese: 'Mac and cheese',
  r_chicken_rice: 'Chicken and rice',
  r_tomato_pasta: 'Creamy tomato pasta',
  r_meatballs: 'Meatballs with mash',
  r_chicken_soup: 'Chicken soup',
  r_potato_soup: 'Creamy potato soup',
  r_omelette: 'Cheese omelette',
  r_rice_pudding: 'Rice pudding cup',
  r_banana_custard: 'Banana custard pot',
  r_tomato_soup: 'Mild tomato soup',
};

export function imageForRecipe(recipe) {
  if (!recipe) return CATEGORY_IMAGES.snack_small;
  // Prefer unique local AI photo over generic category fallback URLs
  if (recipe.image_key && VARIANT_IMAGES[recipe.image_key]) {
    return VARIANT_IMAGES[recipe.image_key];
  }
  const byName = imageForVariantName(recipe.name || recipe.name_nb);
  if (byName) return byName;
  if (recipe.id && RECIPE_IMAGES[recipe.id]) return RECIPE_IMAGES[recipe.id];
  // Keep explicit image_url if it is already a local recipe-images path
  if (recipe.image_url && String(recipe.image_url).startsWith('/recipe-images/')) {
    return recipe.image_url;
  }
  if (recipe.category && CATEGORY_IMAGES[recipe.category]) {
    return CATEGORY_IMAGES[recipe.category];
  }
  if (recipe.image_url) return recipe.image_url;
  return CATEGORY_IMAGES.snack_small;
}

export function withRecipeMedia(recipe) {
  if (!recipe) return recipe;
  const id = recipe.id;
  return {
    ...recipe,
    name_nb: recipe.name_nb || recipe.name,
    name_en: recipe.name_en || RECIPE_NAME_EN[id] || recipe.name,
    image_url: imageForRecipe(recipe),
    image_alt_nb: recipe.image_alt_nb || recipe.name_nb || recipe.name,
    image_alt_en: recipe.image_alt_en || RECIPE_NAME_EN[id] || recipe.name,
  };
}
