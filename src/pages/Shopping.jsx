import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, SectionTitle, Pill, BigButton } from '@/components/ui/Card';
import { CHAINS, SHOP_CATEGORIES } from '@/lib/copy';
import { productDisplayName } from '@/lib/i18n/recipeDisplay';
import { priceFor, productsForHousehold, resolveChainOrder } from '@/lib/storeCatalogue';
import { formatNOK } from '@/lib/utils';
import { Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Shopping() {
  const nav = useNavigate();
  const {
    state,
    toggleShop,
    restockEssentials,
    addShoppingFromCatalogue,
    shoppingTotalOre,
    commitDraftToShopping,
    t,
    locale,
  } = useStore();
  const [q, setQ] = useState('');
  const [history, setHistory] = useState(false);
  const [sessionOnly, setSessionOnly] = useState(false);
  const draft = state.planDraft;
  const hh = state.household || {};
  const storeSelectorOn = hh.flags?.storeSelector !== false;
  const primary = resolveChainOrder(hh)[0];
  const chainLabel = (id) => CHAINS.find((c) => c.id === id)?.short || id;

  const items = useMemo(() => {
    let list = state.shopping || [];
    list = history ? list.filter((s) => s.checked) : list.filter((s) => !s.checked);
    if (sessionOnly) list = list.filter((s) => s.source === 'prep_session');
    return list;
  }, [state.shopping, history, sessionOnly]);

  const catalogue = useMemo(
    () =>
      productsForHousehold(state.storeProducts, hh, {
        applyAvailability: storeSelectorOn,
      }),
    [state.storeProducts, hh, storeSelectorOn]
  );

  const searchHits = useMemo(() => {
    if (q.trim().length < 2) return [];
    const needle = q.toLowerCase();
    return catalogue
      .filter(
        (p) =>
          p.name_nb?.toLowerCase().includes(needle) ||
          p.name_en?.toLowerCase().includes(needle) ||
          p.essential_key?.includes(needle)
      )
      .slice(0, 10);
  }, [q, catalogue]);

  const primaryLabel = [
    chainLabel(primary),
    hh.primary_store_label ? `· ${hh.primary_store_label}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">{t('shopping.title')}</h2>

      {draft?.selections?.length > 0 && draft.status !== 'completed' && (
        <Card className="bg-nc-green/10 border-nc-green/20 space-y-2">
          <p className="text-sm font-medium">{t('plan.fromSession')}</p>
          <p className="text-xs text-nc-muted">
            {draft.computed?.stats?.shop_count || 0} · ~
            {formatNOK(draft.computed?.estimate_total_ore || 0)}
          </p>
          <div className="flex gap-2">
            <BigButton
              variant="primary"
              className="text-xs px-3 flex-1"
              onClick={commitDraftToShopping}
            >
              {t('plan.commitShopping')}
            </BigButton>
            <BigButton
              variant="secondary"
              className="text-xs px-3"
              onClick={() => nav('/meals?tab=session&step=handle')}
            >
              {t('plan.stepHandle')}
            </BigButton>
          </div>
        </Card>
      )}

      <Card className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-nc-muted">
            {t('estimated')} · {t('shopping.open')}
          </p>
          <p className="text-xl font-semibold">{formatNOK(shoppingTotalOre)}</p>
        </div>
        <BigButton variant="soft" className="text-xs px-3" onClick={restockEssentials}>
          <Sparkles className="w-4 h-4 inline mr-1" />
          {t('shopping.restock')}
        </BigButton>
      </Card>

      {storeSelectorOn && (
        <button
          type="button"
          onClick={() => nav('/settings')}
          className="w-full text-left rounded-2xl border border-emerald-200 bg-lime-50/60 px-4 py-3"
        >
          <p className="text-sm font-medium text-nc-green-dark">{primaryLabel}</p>
          <p className="text-xs text-nc-muted mt-0.5">{t('store.chipHint')}</p>
        </button>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nc-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('shopping.search')}
          className="w-full min-h-[48px] pl-10 pr-4 rounded-2xl border border-nc-border bg-nc-card text-sm"
          aria-label={t('shopping.search')}
        />
      </div>

      {searchHits.length > 0 && (
        <div className="space-y-2">
          <SectionTitle>{t('store.title')}</SectionTitle>
          {searchHits.map((p) => {
            const price = priceFor(p, hh);
            return (
              <Card key={p.essential_key} className="flex justify-between items-center gap-2">
                <div className="min-w-0">
                  <p className="font-medium truncate">{productDisplayName(p, locale)}</p>
                  <p className="text-xs text-nc-muted">
                    {p.pack_label} · {price ? formatNOK(price.price_ore) : '—'} · {t('estimated')}
                    {price?.chain ? ` · ${chainLabel(price.chain)}` : ''}
                  </p>
                </div>
                <BigButton
                  variant="secondary"
                  className="text-xs px-3 shrink-0"
                  onClick={() => addShoppingFromCatalogue(p, primary)}
                >
                  +
                </BigButton>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setHistory(false)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium ${
            !history ? 'bg-nc-green text-white' : 'border border-nc-border'
          }`}
        >
          {t('shopping.open')}
        </button>
        <button
          type="button"
          onClick={() => setHistory(true)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium ${
            history ? 'bg-nc-green text-white' : 'border border-nc-border'
          }`}
        >
          {t('shopping.checked')}
        </button>
        <button
          type="button"
          onClick={() => setSessionOnly((v) => !v)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium ${
            sessionOnly ? 'bg-nc-green text-white' : 'border border-nc-border'
          }`}
        >
          {t('plan.fromSession')}
        </button>
      </div>

      {items.length === 0 && (
        <Card className="text-center py-8 text-sm text-nc-muted">{t('shopping.empty')}</Card>
      )}

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <Card className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={!!item.checked}
                onChange={() => toggleShop(item.id)}
                className="mt-1 w-5 h-5 accent-nc-green"
                aria-label={item.name_nb || item.name}
              />
              <div className="min-w-0 flex-1">
                <p className={`font-medium ${item.checked ? 'line-through text-nc-muted' : ''}`}>
                  {item.name_nb || item.name}
                </p>
                <p className="text-xs text-nc-muted">
                  {item.quantity} {item.unit}
                  {item.estimated_price_ore
                    ? ` · ${formatNOK(item.estimated_price_ore)}`
                    : ''}
                  {item.preferred_chain ? ` · ${chainLabel(item.preferred_chain)}` : ''}
                  {item.category
                    ? ` · ${SHOP_CATEGORIES.find((c) => c.id === item.category)?.label || item.category}`
                    : ''}
                </p>
                {item.source === 'prep_session' && (
                  <Pill tone="green">{t('plan.fromSession')}</Pill>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
