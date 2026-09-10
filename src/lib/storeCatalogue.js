/** Shared store chain / price / assortment helpers */

export function resolveChainOrder(household) {
  const preferred = household?.preferred_chains || [];
  const primary = household?.primary_chain || preferred[0] || 'kiwi';
  const rest = preferred.filter((c) => c !== primary);
  return [primary, ...rest];
}

export function productsForHousehold(products, household, { applyAvailability = true } = {}) {
  const list = products || [];
  if (!applyAvailability) return list;
  const chain = resolveChainOrder(household)[0];
  return list.filter((p) => !p.available_chains?.length || p.available_chains.includes(chain));
}

export function priceFor(product, household) {
  if (!product?.prices?.length) return null;
  for (const c of resolveChainOrder(household)) {
    const row = product.prices.find((p) => p.chain === c);
    if (row) return { ...row, chain: c };
  }
  return { ...product.prices[0] };
}

export function chainLabel(chainId, chains) {
  return chains?.find((c) => c.id === chainId)?.label || chainId;
}
