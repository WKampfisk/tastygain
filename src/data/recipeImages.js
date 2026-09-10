/**
 * Unique local meal photos under /recipe-images/.
 * Paths respect Vite BASE_URL (GitHub Pages /tastygain/).
 */

function asset(id) {
  const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}recipe-images/${id}.jpg`;
}

const local = (id) => asset(id);

/** Per-recipe unique meal photos */
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
  r_skyr_jam: local('r_skyr_jam'),
  r_choc_pudding: local('r_choc_pudding'),
  r_nuts_cheese: local('r_nuts_cheese'),
  r_ham_cheese: local('r_ham_cheese'),
  r_protein_bar_candy: local('r_protein_bar_candy'),
};

export const CATEGORY_IMAGES = {
  smoothie_shake: local('cat_smoothie_shake'),
  dinner: local('cat_dinner'),
  snack_small: local('cat_snack_small'),
  food_prep: local('cat_food_prep'),
  soup: local('cat_soup'),
  dessert: local('cat_dessert'),
};

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
  gen_mini_pancakes: local('gen_mini_pancakes'),
  gen_cinnamon_toast: local('gen_cinnamon_toast'),
  gen_cottage_berries: local('gen_cottage_berries'),
  gen_hot_chocolate: local('gen_hot_chocolate'),
  gen_tuna_mayo: local('gen_tuna_mayo'),
  gen_egg_toast: local('gen_egg_toast'),
  gen_caramel_yoghurt: local('gen_caramel_yoghurt'),
  gen_waffle_bite: local('gen_waffle_bite'),
  gen_apple_peanut: local('gen_apple_peanut'),
};

/** Extra unique photos assigned when a generated recipe would otherwise reuse an image */
export const EXTRA_IMAGE_KEYS = [
  'gen_mini_pancakes',
  'gen_cinnamon_toast',
  'gen_cottage_berries',
  'gen_hot_chocolate',
  'gen_tuna_mayo',
  'gen_egg_toast',
  'gen_caramel_yoghurt',
  'gen_waffle_bite',
  'gen_apple_peanut',
  'gen_ost_eple',
  'gen_ricotta_brod',
  'gen_banan_kakao',
];

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
  'mini-pannekaker med honning': 'gen_mini_pancakes',
  'kaneltoast': 'gen_cinnamon_toast',
  'kesam med bær': 'gen_cottage_berries',
  'kakao med krem': 'gen_hot_chocolate',
  'tunfisk på kjeks': 'gen_tuna_mayo',
  'egg og toast': 'gen_egg_toast',
  'karamellyoghurt': 'gen_caramel_yoghurt',
  'vaffelbit med sjokolade': 'gen_waffle_bite',
  'eple med peanøttsmør': 'gen_apple_peanut',
};

function hashString(s) {
  let h = 0;
  const str = String(s || '');
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function imageForVariantName(name) {
  if (!name) return null;
  const base = String(name)
    .toLowerCase()
    .replace(/\s*\(\d+\)\s*$/, '')
    .trim();
  const key = VARIANT_NAME_TO_KEY[base];
  return key ? VARIANT_IMAGES[key] : null;
}

export function isCategoryFallback(url) {
  return Object.values(CATEGORY_IMAGES).includes(url);
}

/**
 * Pick a unique photo not already used by existing recipes.
 * Preferred key first, then unused extras, then a hashed extra (still a food photo).
 */
export function uniqueImageForGenerated(preferredKey, existingRecipes = [], salt = '') {
  const used = new Set(
    (existingRecipes || [])
      .map((r) => r.image_url)
      .filter(Boolean)
  );
  const preferred = preferredKey && VARIANT_IMAGES[preferredKey];
  if (preferred && !used.has(preferred)) return preferred;
  for (const key of EXTRA_IMAGE_KEYS) {
    const url = VARIANT_IMAGES[key];
    if (url && !used.has(url)) return url;
  }
  const idx = hashString(preferredKey || salt) % EXTRA_IMAGE_KEYS.length;
  return VARIANT_IMAGES[EXTRA_IMAGE_KEYS[idx]] || CATEGORY_IMAGES.snack_small;
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
  r_mug_cake: 'Protein mug cake',
  r_protein_brownie: 'Mini protein brownie',
  r_cheesecake_cup: 'Cheesecake cup',
  r_snickers_bites: 'Date snickers bites',
  r_yoghurt_bark: 'Yoghurt bark with chocolate',
  r_protein_balls: 'Protein balls',
  r_ice_cream_shake: 'Ice cream protein shake',
  r_chips_kesam: 'Chips and cottage cheese dip',
  r_bacon_egg: 'Bacon and egg mini',
  r_skyr_jam: 'Skyr with jam and granola',
  r_choc_pudding: 'Chocolate pudding with cream',
  r_nuts_cheese: 'Salted nuts and cheese',
  r_ham_cheese: 'Ham, cheese and mayo rolls',
  r_protein_bar_candy: 'Chocolate protein bar',
};

export function imageForRecipe(recipe) {
  if (!recipe) return CATEGORY_IMAGES.snack_small;
  if (recipe.image_key && VARIANT_IMAGES[recipe.image_key]) {
    return VARIANT_IMAGES[recipe.image_key];
  }
  const byName = imageForVariantName(recipe.name || recipe.name_nb);
  if (byName) return byName;
  if (recipe.id && RECIPE_IMAGES[recipe.id]) return RECIPE_IMAGES[recipe.id];
  if (recipe.image_url && String(recipe.image_url).includes('recipe-images/')) {
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
