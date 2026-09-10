import { uid } from '@/lib/utils';
import { defaultContainersForCategory } from '@/lib/containers';
import { uniqueImageForGenerated } from '@/data/recipeImages';

/**
 * Variasjoner for automatisk oppskriftsgenerering (norsk).
 * Hver variant har imageKey → unik matfoto under /recipe-images/gen_*.jpg
 */
const SHAKE_VARIANTS = [
  {
    imageKey: 'gen_havre_honning_shake',
    name: 'Havre-honning-shake',
    description: 'Mild og litt søtere morgenvariant.',
    ingredients: [
      { name: 'Helmelk', quantity: '2', unit: 'dl' },
      { name: 'Havregryn', quantity: '2', unit: 'ss' },
      { name: 'Honning', quantity: '1', unit: 'ts' },
      { name: 'Fullfett yoghurt', quantity: '1', unit: 'dl' },
    ],
    icon: '🍯',
  },
  {
    imageKey: 'gen_vanilje_banan_shake',
    name: 'Vanilje-banan-shake',
    description: 'Nøytral vaniljesmak, god på vanskelige dager.',
    ingredients: [
      { name: 'Helmelk', quantity: '2', unit: 'dl' },
      { name: 'Banan', quantity: '1', unit: 'stk' },
      { name: 'Vaniljeyoghurt', quantity: '1,5', unit: 'dl' },
    ],
    icon: '🍦',
  },
  {
    imageKey: 'gen_kakao_havre_shake',
    name: 'Kakao-havre-shake',
    description: 'Lett kakao uten sterke smaker.',
    ingredients: [
      { name: 'Helmelk', quantity: '2', unit: 'dl' },
      { name: 'Kakao', quantity: '1', unit: 'ts' },
      { name: 'Havregryn', quantity: '1', unit: 'ss' },
      { name: 'Banan', quantity: '0,5', unit: 'stk' },
    ],
    icon: '🍫',
  },
  {
    imageKey: 'gen_bringebaer_shake',
    name: 'Bringebær-yoghurt-shake',
    description: 'Frisk, mild bærvariant.',
    ingredients: [
      { name: 'Frosne bær', quantity: '1', unit: 'dl' },
      { name: 'Fullfett yoghurt', quantity: '1,5', unit: 'dl' },
      { name: 'Helmelk', quantity: '1', unit: 'dl' },
      { name: 'Honning', quantity: '1', unit: 'ts', optional: true },
    ],
    icon: '🍓',
  },
  {
    imageKey: 'gen_kokos_banan_shake',
    name: 'Kokos-banan-shake',
    description: 'Myk kokosnote (kan lages uten nøtter).',
    ingredients: [
      { name: 'Helmelk eller kokosdrikk', quantity: '2', unit: 'dl' },
      { name: 'Banan', quantity: '1', unit: 'stk' },
      { name: 'Yoghurt', quantity: '1', unit: 'dl' },
    ],
    icon: '🥥',
  },
];

const DINNER_VARIANTS = [
  {
    imageKey: 'gen_laks_potet',
    name: 'Kremet laks med potet',
    description: 'Mild fiskerett egnet til batch og fryser.',
    ingredients: [
      { name: 'Laks', quantity: '400', unit: 'g' },
      { name: 'Poteter', quantity: '800', unit: 'g' },
      { name: 'Fløte', quantity: '2', unit: 'dl' },
      { name: 'Smør', quantity: '2', unit: 'ss' },
    ],
    icon: '🐟',
  },
  {
    imageKey: 'gen_kyllinggryte',
    name: 'Mild kyllinggryte med ris',
    description: 'Rolig smak, god til frysing.',
    ingredients: [
      { name: 'Kylling', quantity: '500', unit: 'g' },
      { name: 'Ris', quantity: '3', unit: 'dl' },
      { name: 'Fløte', quantity: '2', unit: 'dl' },
      { name: 'Gulrot', quantity: '2', unit: 'stk' },
    ],
    icon: '🍲',
  },
  {
    imageKey: 'gen_pasta_ostesaus',
    name: 'Pasta med mild ostesaus',
    description: 'Lav innsats, kjente smaker.',
    ingredients: [
      { name: 'Pasta', quantity: '350', unit: 'g' },
      { name: 'Ost', quantity: '150', unit: 'g' },
      { name: 'Melk', quantity: '3', unit: 'dl' },
      { name: 'Smør', quantity: '2', unit: 'ss' },
    ],
    icon: '🍝',
  },
  {
    imageKey: 'gen_torsk_potetmos',
    name: 'Ovnsbakt torsk med potetmos',
    description: 'Mild fisk, myk konsistens.',
    ingredients: [
      { name: 'Torsk', quantity: '400', unit: 'g' },
      { name: 'Poteter', quantity: '800', unit: 'g' },
      { name: 'Smør', quantity: '40', unit: 'g' },
      { name: 'Melk', quantity: '1', unit: 'dl' },
    ],
    icon: '🥔',
  },
  {
    imageKey: 'gen_linse_suppe',
    name: 'Linse- og grønnsakssuppe',
    description: 'Myk, varm og enkel å porsjonere.',
    ingredients: [
      { name: 'Røde linser', quantity: '2', unit: 'dl' },
      { name: 'Gulrot', quantity: '2', unit: 'stk' },
      { name: 'Buljong', quantity: '1', unit: 'L' },
      { name: 'Fløte', quantity: '1', unit: 'dl', optional: true },
    ],
    icon: '🥕',
  },
];

const SNACK_VARIANTS = [
  {
    imageKey: 'gen_ricotta_brod',
    name: 'Ricotta på ristet brød',
    description: 'Myk pålegg, liten porsjon.',
    ingredients: [
      { name: 'Brød', quantity: '1', unit: 'skive' },
      { name: 'Ricotta eller cottage cheese', quantity: '2', unit: 'ss' },
      { name: 'Honning', quantity: '1', unit: 'ts', optional: true },
    ],
    icon: '🍞',
  },
  {
    imageKey: 'gen_melkekakao',
    name: 'Varm melkekakao',
    description: 'Varm drikke når kaldt er vanskelig.',
    ingredients: [
      { name: 'Helmelk', quantity: '2', unit: 'dl' },
      { name: 'Kakao', quantity: '1', unit: 'ts' },
      { name: 'Honning', quantity: '1', unit: 'ts', optional: true },
    ],
    icon: '☕',
  },
  {
    imageKey: 'gen_banan_peanott',
    name: 'Banan med peanøttsmør (skål)',
    description: 'Raskt, uten toast om det er enklere.',
    ingredients: [
      { name: 'Banan', quantity: '1', unit: 'stk' },
      { name: 'Peanøttsmør', quantity: '1', unit: 'ss' },
    ],
    icon: '🍌',
  },
  {
    imageKey: 'gen_risholding',
    name: 'Mild risholding',
    description: 'Varm, nøytral konsistens.',
    ingredients: [
      { name: 'Ris', quantity: '0,5', unit: 'dl' },
      { name: 'Helmelk', quantity: '2', unit: 'dl' },
      { name: 'Smør', quantity: '1', unit: 'ts', optional: true },
    ],
    icon: '🍚',
  },
  {
    imageKey: 'gen_ost_eple',
    name: 'Ostestenger med eple',
    description: 'Liten tallerken, kjent smak.',
    ingredients: [
      { name: 'Ost', quantity: '2', unit: 'skiver' },
      { name: 'Eple', quantity: '0,5', unit: 'stk', optional: true },
    ],
    icon: '🧀',
  },
  {
    imageKey: 'gen_cinnamon_toast',
    name: 'Kaneltoast',
    description: 'Liten skive med kanel og sukker.',
    ingredients: [
      { name: 'Brød', quantity: '1', unit: 'skive' },
      { name: 'Smør', quantity: '1', unit: 'ts' },
      { name: 'Honning', quantity: '1', unit: 'ts' },
    ],
    icon: '🍞',
  },
  {
    imageKey: 'gen_cottage_berries',
    name: 'Kesam med bær',
    description: 'Søtt, proteinrikt og lite.',
    ingredients: [
      { name: 'Kesam', quantity: '1,5', unit: 'dl' },
      { name: 'Frosne bær', quantity: '0,5', unit: 'dl' },
    ],
    icon: '🍓',
  },
  {
    imageKey: 'gen_hot_chocolate',
    name: 'Kakao med krem',
    description: 'Varm, søt og liten kopp.',
    ingredients: [
      { name: 'Helmelk', quantity: '2', unit: 'dl' },
      { name: 'Kakao', quantity: '1', unit: 'ts' },
      { name: 'Kremfløte', quantity: '1', unit: 'ss', optional: true },
    ],
    icon: '☕',
  },
  {
    imageKey: 'gen_tuna_mayo',
    name: 'Tunfisk på kjeks',
    description: 'Salt, raskt, to kjeks.',
    ingredients: [
      { name: 'Knekkebrød', quantity: '2', unit: 'stk' },
      { name: 'Majones', quantity: '1', unit: 'ts' },
    ],
    icon: '🐟',
  },
  {
    imageKey: 'gen_egg_toast',
    name: 'Egg og toast',
    description: 'Halvt egg og smørtoast.',
    ingredients: [
      { name: 'Egg', quantity: '1', unit: 'stk' },
      { name: 'Brød', quantity: '1', unit: 'skive' },
      { name: 'Smør', quantity: '1', unit: 'ts' },
    ],
    icon: '🥚',
  },
  {
    imageKey: 'gen_apple_peanut',
    name: 'Eple med peanøttsmør',
    description: 'Søtt og salt i små biter.',
    ingredients: [
      { name: 'Peanøttsmør', quantity: '1', unit: 'ss' },
    ],
    icon: '🍎',
  },
];

const SOUP_VARIANTS = [
  {
    imageKey: 'gen_blomkaalsuppe',
    name: 'Mild blomkålsuppe',
    description: 'Kremet, nøytral og lett å spise.',
    ingredients: [
      { name: 'Blomkål', quantity: '400', unit: 'g' },
      { name: 'Fløte', quantity: '1', unit: 'dl' },
      { name: 'Buljong', quantity: '6', unit: 'dl' },
      { name: 'Smør', quantity: '1', unit: 'ss' },
    ],
    icon: '🥣',
  },
  {
    imageKey: 'gen_gulrotsuppe',
    name: 'Gulrotsuppe med fløte',
    description: 'Søtlig og myk konsistens.',
    ingredients: [
      { name: 'Gulrot', quantity: '4', unit: 'stk' },
      { name: 'Fløte', quantity: '1', unit: 'dl' },
      { name: 'Buljong', quantity: '7', unit: 'dl' },
    ],
    icon: '🥕',
  },
];

const DESSERT_VARIANTS = [
  {
    imageKey: 'gen_vaniljeyoghurt',
    name: 'Vaniljeyoghurt med honning',
    description: 'Lite søtt mellommåltid.',
    ingredients: [
      { name: 'Vaniljeyoghurt', quantity: '1,5', unit: 'dl' },
      { name: 'Honning', quantity: '1', unit: 'ts', optional: true },
    ],
    icon: '🍯',
  },
  {
    imageKey: 'gen_banan_kakao',
    name: 'Banan med kakao',
    description: 'Raskt og kjent.',
    ingredients: [
      { name: 'Banan', quantity: '1', unit: 'stk' },
      { name: 'Kakao', quantity: '0,5', unit: 'ts', optional: true },
    ],
    icon: '🍌',
  },
  {
    imageKey: 'gen_mini_pancakes',
    name: 'Mini-pannekaker med honning',
    description: 'To små pannekaker — søtt og nok.',
    ingredients: [
      { name: 'Egg', quantity: '1', unit: 'stk' },
      { name: 'Havregryn', quantity: '2', unit: 'ss' },
      { name: 'Helmelk', quantity: '0,5', unit: 'dl' },
      { name: 'Honning', quantity: '1', unit: 'ts' },
    ],
    icon: '🥞',
  },
  {
    imageKey: 'gen_caramel_yoghurt',
    name: 'Karamellyoghurt',
    description: 'Liten glassdessert, søt og kremet.',
    ingredients: [
      { name: 'Vaniljeyoghurt', quantity: '1,5', unit: 'dl' },
      { name: 'Honning', quantity: '1', unit: 'ts' },
    ],
    icon: '🍮',
  },
  {
    imageKey: 'gen_waffle_bite',
    name: 'Vaffelbit med sjokolade',
    description: 'Én vaffel, sjokoladedryss.',
    ingredients: [
      { name: 'Egg', quantity: '1', unit: 'stk' },
      { name: 'Havregryn', quantity: '2', unit: 'ss' },
      { name: 'Kakao', quantity: '1', unit: 'ts', optional: true },
    ],
    icon: '🧇',
  },
];

function poolForCategory(category) {
  if (category === 'smoothie_shake') return SHAKE_VARIANTS;
  if (category === 'dinner') return DINNER_VARIANTS;
  if (category === 'soup') return SOUP_VARIANTS;
  if (category === 'dessert') return DESSERT_VARIANTS;
  return SNACK_VARIANTS;
}

function suitableFoodNotes(category) {
  if (category === 'smoothie_shake') {
    return 'Egnet som flytende måltid. God når appetitten er lav eller fast mat føles tungt. Server kaldt i liten porsjon.';
  }
  if (category === 'dinner') {
    return 'Egnet som varm hovedrett i liten skål. Myk tekstur prioriteres. Kan fryses i porsjonsbokser.';
  }
  if (category === 'soup') {
    return 'Egnet som varm, myk suppe i liten bolle. Lett å drikke eller spise med skje.';
  }
  if (category === 'dessert') {
    return 'Lite søtt mellommåltid med næring — noe lite er nok, og det teller.';
  }
  return 'Egnet som lite mellommåltid. Server på liten tallerken eller i pot — noe lite er nok.';
}

/**
 * Generer én ny oppskrift basert på den som nettopp ble tilberedt / likt / mislikt.
 * Unngår navn som allerede finnes; tildeler unik matfoto fra variant.
 */
export function generateRecipeFromUse(sourceRecipe, existingRecipes = [], householdId) {
  const category = sourceRecipe?.category || 'snack_small';
  const pool = poolForCategory(category);
  const existingNames = new Set((existingRecipes || []).map((r) => (r.name || '').toLowerCase()));

  let variant =
    pool.find((v) => !existingNames.has(v.name.toLowerCase())) ||
    pool[Math.floor(Math.random() * pool.length)];

  let name = variant.name;
  if (existingNames.has(name.toLowerCase())) {
    let n = 2;
    while (existingNames.has(`${variant.name} (${n})`.toLowerCase())) n += 1;
    name = `${variant.name} (${n})`;
  }

  const portions = sourceRecipe?.portions || (category === 'dinner' ? 4 : 1);
  const containers = defaultContainersForCategory(category).map((c) => ({ ...c }));
  const image_url = uniqueImageForGenerated(variant.imageKey, existingRecipes, name);

  return {
    id: uid('gen'),
    household_id: householdId || sourceRecipe?.household_id,
    name,
    name_nb: name,
    category,
    image_url,
    image_key: variant.imageKey,
    description: variant.description,
    prep_minutes: sourceRecipe?.prep_minutes || (category === 'dinner' ? 15 : 5),
    cook_minutes: category === 'dinner' ? 25 : 0,
    difficulty: category === 'dinner' ? 'batch' : 'easy',
    portions,
    portion_size_label:
      sourceRecipe?.portion_size_label ||
      (category === 'smoothie_shake' ? 'lite glass' : 'liten'),
    ingredients: variant.ingredients,
    flavor_tags: sourceRecipe?.flavor_tags || (category === 'dessert' ? ['sweet'] : ['salty']),
    protein_g: sourceRecipe?.protein_g || null,
    steps:
      category === 'smoothie_shake'
        ? ['Ha alt i blenderen.', 'Kjør til det er glatt.', 'Hell i shakebeholder. Klar når du er klar.']
        : category === 'dinner' || category === 'soup'
          ? [
              'Forbered ingrediensene.',
              'Kok eller stek etter vanlig fremgangsmåte.',
              'Del i porsjonsbokser, merk med dato.',
            ]
          : ['Sett sammen raskt.', 'Server i liten porsjon.'],
    storage_notes:
      category === 'dinner' || category === 'soup'
        ? 'Kjøleskap 2–3 dager. Fryser 1–2 måneder i frysesikre bokser.'
        : category === 'smoothie_shake'
          ? 'Best fersk. Kjøleskap opptil 12 timer i lukket flaske.'
          : 'Server fersk når mulig.',
    fridge_days: category === 'dinner' || category === 'soup' ? 3 : 1,
    freezer_days: category === 'dinner' || category === 'soup' ? 45 : 0,
    reheat_notes:
      category === 'dinner' || category === 'soup'
        ? 'Varm til rykende. Ha i litt væske ved behov.'
        : undefined,
    texture: category === 'smoothie_shake' ? 'jevn væske' : 'myk',
    temperature: category === 'smoothie_shake' || category === 'dessert' ? 'cold' : 'hot',
    energy_density: 'high',
    protein_source: sourceRecipe?.protein_source || '',
    make_smaller: 'Server halv porsjon — noe lite er nok.',
    make_easier: 'Bruk ferdigkomponenter der det er mulig.',
    make_richer: 'Tilsett fløte, ost eller peanøttsmør om det tåles.',
    low_effort: true,
    difficult_day_suitable: true,
    is_system: false,
    is_generated: true,
    generated_from_id: sourceRecipe?.id,
    generated_from_name: sourceRecipe?.name,
    suitable_food_notes: suitableFoodNotes(category),
    containers,
    icon: variant.icon || sourceRecipe?.icon || '🍽️',
  };
}
