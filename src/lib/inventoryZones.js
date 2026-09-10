/** Map shopping/inventory categories → location_zone + display location labels */

export const ZONE_CATEGORY_MAP = {
  dairy: 'fridge',
  drinks: 'fridge',
  nutritional_drinks: 'fridge',
  fruit_veg: 'fridge',
  meat_fish: 'fridge',
  frozen: 'freezer',
  pantry: 'cupboard',
  bread_bakery: 'cupboard',
  snacks: 'cupboard',
  household: 'cupboard',
};

export const ZONE_LOCATION_LABELS = {
  nb: {
    fridge: 'Kjøleskap',
    freezer: 'Fryser',
    cupboard: 'Tørrvare',
  },
  en: {
    fridge: 'Fridge',
    freezer: 'Freezer',
    cupboard: 'Cupboard',
  },
};

export function zoneForCategory(category) {
  return ZONE_CATEGORY_MAP[category] || 'cupboard';
}

export function locationLabelForZone(zone, locale = 'nb') {
  const pack = ZONE_LOCATION_LABELS[locale === 'en' ? 'en' : 'nb'];
  return pack[zone] || pack.cupboard;
}

/** Soft-migrate inventory rows missing location_zone */
export function migrateInventoryZones(inventory) {
  return (inventory || []).map((row) => {
    if (row.location_zone) return row;
    const zone = zoneForCategory(row.category);
    return {
      ...row,
      location_zone: zone,
      location: row.location || locationLabelForZone(zone, 'nb'),
    };
  });
}
