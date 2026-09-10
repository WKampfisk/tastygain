export function recipeDisplayName(recipe, locale) {
  if (!recipe) return '';
  if (locale === 'en') return recipe.name_en || recipe.name_nb || recipe.name || '';
  return recipe.name_nb || recipe.name || recipe.name_en || '';
}

export function recipeImageAlt(recipe, locale) {
  if (!recipe) return '';
  if (locale === 'en') {
    return recipe.image_alt_en || recipe.image_alt_nb || recipeDisplayName(recipe, 'en');
  }
  return recipe.image_alt_nb || recipe.image_alt_en || recipeDisplayName(recipe, 'nb');
}

export function productDisplayName(product, locale) {
  if (!product) return '';
  if (locale === 'en') return product.name_en || product.name_nb || product.name || '';
  return product.name_nb || product.name || product.name_en || '';
}
