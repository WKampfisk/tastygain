/** Egnete beholdere for mat og shakes — norsk bokmål */

export const CONTAINER_TYPES = {
  shake_bottle_250: {
    id: 'shake_bottle_250',
    label: 'Shakeflaske 250 ml',
    short: 'Shake 250 ml',
    kind: 'shake',
    volume_ml: 250,
    freezable: false,
    description: 'Liten drikkebeholder for smoothies og shakes. God til én liten porsjon.',
  },
  shake_bottle_500: {
    id: 'shake_bottle_500',
    label: 'Shakeflaske 500 ml',
    short: 'Shake 500 ml',
    kind: 'shake',
    volume_ml: 500,
    freezable: false,
    description: 'Større shakebeholder. Kan deles i to små porsjoner om ønskelig.',
  },
  meal_box_small: {
    id: 'meal_box_small',
    label: 'Matboks liten (ca. 400 ml)',
    short: 'Matboks liten',
    kind: 'food',
    volume_ml: 400,
    freezable: true,
    description: 'Liten frysesikker boks til middags- eller småmåltids-porsjoner.',
  },
  meal_box_medium: {
    id: 'meal_box_medium',
    label: 'Matboks middels (ca. 700 ml)',
    short: 'Matboks middels',
    kind: 'food',
    volume_ml: 700,
    freezable: true,
    description: 'Middels boks til mer fyllende porsjoner eller to små.',
  },
  soup_jar: {
    id: 'soup_jar',
    label: 'Suppeglass / krukke 400–500 ml',
    short: 'Suppeglass',
    kind: 'food',
    volume_ml: 450,
    freezable: true,
    description: 'Glass eller krukke til suppe, grøt og flytende retter.',
  },
  snack_pot: {
    id: 'snack_pot',
    label: 'Liten pot 150–200 ml',
    short: 'Snack-pot',
    kind: 'food',
    volume_ml: 175,
    freezable: false,
    description: 'Liten beholder til yoghurt, overnight oats og snacks.',
  },
  freezer_bag: {
    id: 'freezer_bag',
    label: 'Frysesikker pose',
    short: 'Frysepose',
    kind: 'food',
    volume_ml: null,
    freezable: true,
    description: 'Pose til flatfrysing av porsjoner for å spare plass.',
  },
};

/**
 * Standard beholderoppsett per oppskriftskategori.
 */
export function defaultContainersForCategory(category) {
  switch (category) {
    case 'smoothie_shake':
      return [
        {
          type: 'shake_bottle_250',
          count_per_portion: 1,
          notes: 'Én flaske per shake-porsjon. Bruk 500 ml hvis du dobler.',
        },
      ];
    case 'dinner':
      return [
        {
          type: 'meal_box_small',
          count_per_portion: 1,
          notes: 'Én liten matboks per porsjon. Frysesikker anbefales til batch.',
        },
      ];
    case 'soup':
      return [
        {
          type: 'soup_jar',
          count_per_portion: 1,
          notes: 'Suppeglass eller krukke per porsjon. Frysesikker anbefales.',
        },
      ];
    case 'dessert':
    case 'snack_small':
    case 'food_prep':
      return [
        {
          type: 'snack_pot',
          count_per_portion: 1,
          notes: 'Liten pot til små porsjoner. Bytt til matboks for varm mat.',
        },
      ];
    default:
      return [
        {
          type: 'meal_box_small',
          count_per_portion: 1,
          notes: 'Standard matboks per porsjon.',
        },
      ];
  }
}

export function resolveRecipeContainers(recipe) {
  if (recipe?.containers?.length) return recipe.containers;
  return defaultContainersForCategory(recipe?.category);
}

/**
 * Beregn beholderbehov for en planlagt batch.
 * @returns {{ lines: Array, total_containers: number, freezable_needed: number }}
 */
export function calculateBatchContainers(recipe, plannedPortions) {
  const portions = Math.max(1, Number(plannedPortions) || recipe?.portions || 1);
  const specs = resolveRecipeContainers(recipe);
  const lines = specs.map((spec) => {
    const meta = CONTAINER_TYPES[spec.type] || {
      id: spec.type,
      label: spec.type,
      short: spec.type,
      freezable: false,
    };
    const count = Math.ceil(portions * (spec.count_per_portion || 1));
    return {
      type: spec.type,
      label: meta.label,
      short: meta.short,
      count,
      notes: spec.notes || meta.description || '',
      freezable: !!meta.freezable,
      volume_ml: meta.volume_ml,
      kind: meta.kind || 'food',
    };
  });
  return {
    portions,
    lines,
    total_containers: lines.reduce((s, l) => s + l.count, 0),
    freezable_needed: lines.filter((l) => l.freezable).reduce((s, l) => s + l.count, 0),
    shake_needed: lines.filter((l) => l.kind === 'shake').reduce((s, l) => s + l.count, 0),
    food_needed: lines.filter((l) => l.kind === 'food').reduce((s, l) => s + l.count, 0),
  };
}

export function formatBatchContainerSummary(batch) {
  if (!batch?.lines?.length) return 'Ingen beholderinfo.';
  return batch.lines.map((l) => `${l.count}× ${l.label}`).join(' · ');
}
