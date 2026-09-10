import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Card, SectionTitle, Pill, BigButton } from '@/components/ui/Card';
import { Image } from '@/components/ui/image';
import { recipeDisplayName } from '@/lib/i18n/recipeDisplay';
import { formatDateEU, todayISO } from '@/lib/utils';
import { Minus, Plus } from 'lucide-react';
import IdellaWatermark from '@/components/IdellaWatermark';

export default function Kitchen() {
  const nav = useNavigate();
  const { state, usePortion, update, metrics, t, locale } = useStore();
  const [tab, setTab] = useState('meals');
  const draft = state.planDraft;
  const discreet = state.household?.discreet_mode;

  const prepared = state.prepared || [];
  const inventory = state.inventory || [];

  const recipeById = (id) => (state.recipes || []).find((r) => r.id === id);

  const badges = (p) => {
    const list = [];
    if ((p.portions_remaining || 0) <= 0) list.push({ t: locale === 'en' ? 'Empty' : 'Tomt', tone: 'warn' });
    else if ((p.portions_remaining || 0) <= 1)
      list.push({ t: locale === 'en' ? 'Almost empty' : 'Nesten tomt', tone: 'peach' });
    if (p.expiry_date) {
      const days =
        (new Date(p.expiry_date + 'T12:00:00') - new Date(todayISO() + 'T12:00:00')) / 86400000;
      if (days <= 2 && days >= 0)
        list.push({ t: locale === 'en' ? 'Expires soon' : 'Utløper snart', tone: 'warn' });
    }
    if (p.storage_type === 'freezer') list.push({ t: t('home.freezer'), tone: 'blue' });
    if (p.storage_type === 'fridge') list.push({ t: t('home.fridge'), tone: 'green' });
    if (p.storage_type === 'ready_now')
      list.push({ t: locale === 'en' ? 'Ready now' : 'Klar nå', tone: 'green' });
    return list;
  };

  const adjust = (id, delta) => {
    update((prev) => ({
      ...prev,
      prepared: prev.prepared.map((p) =>
        p.id === id
          ? { ...p, portions_remaining: Math.max(0, (p.portions_remaining || 0) + delta) }
          : p
      ),
    }));
  };

  const meter = (label, value, max) => {
    const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
    return (
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium text-nc-ink-soft">{label}</span>
          <span className="text-nc-muted tabular-nums">{value}</span>
        </div>
        <div className="h-2 rounded-full bg-nc-border overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-nc-green to-lime-400 transition-all"
            style={{ width: `${pct}%` }}
            role="meter"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label={label}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-nc-ink tracking-tight">
          {discreet ? t('nav.home') : t('home.title')}
        </h2>
        <p className="text-sm text-nc-muted mt-0.5">{t('home.subtitle')}</p>
        {!discreet && (
          <div className="mt-1 -ml-1">
            <IdellaWatermark variant="corner" className="!static !opacity-[0.38] !max-w-none" />
          </div>
        )}
      </div>

      <Card className="bg-gradient-to-br from-nc-green/10 to-lime-50/80 border-nc-green/20 space-y-3">
        <div>
          <p className="text-sm font-medium text-nc-green-dark">
            {metrics.ready} {t('home.portions')}
          </p>
          <p className="text-xs text-nc-muted mt-0.5">
            ~{metrics.daysCoverage} {locale === 'en' ? 'days coverage' : 'dagers dekning'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {meter(t('home.freezer'), metrics.freezer, state.household?.min_freezer_meals || 6)}
          {meter(t('home.fridge'), metrics.fridge, state.household?.min_fridge_prepared || 2)}
          {meter(
            t('home.cupboard'),
            metrics.cupboardOk ?? 0,
            state.household?.min_cupboard_essentials || 5
          )}
        </div>
      </Card>

      {draft?.selections?.length > 0 && draft.status !== 'completed' && (
        <Card className="space-y-2">
          <p className="text-sm font-medium">{t('plan.readyToPrep')}</p>
          <p className="text-xs text-nc-muted">
            {draft.selections.length} · {draft.computed?.container_plan?.total_containers || 0}
          </p>
          <BigButton
            variant="primary"
            className="w-full text-sm"
            onClick={() => nav('/meals?tab=session&step=tilbered')}
          >
            {t('plan.continueSession')}
          </BigButton>
        </Card>
      )}

      <div className="flex gap-2">
        {[
          { id: 'meals', label: t('home.produced') },
          { id: 'pantry', label: `${t('home.cupboard')} / ${t('home.fridge')}` },
        ].map((tabDef) => (
          <button
            key={tabDef.id}
            type="button"
            onClick={() => setTab(tabDef.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              tab === tabDef.id
                ? 'bg-nc-green text-white'
                : 'bg-nc-card border border-nc-border text-nc-muted'
            }`}
          >
            {tabDef.label}
          </button>
        ))}
      </div>

      {tab === 'meals' && (
        <div className="space-y-3">
          {prepared.length === 0 && (
            <Card className="text-center py-8 space-y-3">
              <p className="text-sm text-nc-muted">{t('home.emptyProduced')}</p>
              <BigButton variant="primary" onClick={() => nav('/meals?tab=session')}>
                {t('home.startSession')}
              </BigButton>
            </Card>
          )}
          {prepared.map((p) => {
            const recipe = recipeById(p.recipe_id);
            const title =
              recipeDisplayName(recipe, locale) ||
              p.name ||
              (locale === 'en' ? 'Prepared meal' : 'Tilberedt måltid');
            return (
              <Card key={p.id} className="overflow-hidden p-0">
                <div className="flex gap-0">
                  <div className="relative w-24 shrink-0 bg-nc-beige">
                    {recipe?.image_url ? (
                      <Image
                        src={recipe.image_url}
                        alt={title}
                        fittingType="fill"
                        className="!block w-full h-full absolute inset-0 min-h-[6rem]"
                        originWidth={300}
                        originHeight={300}
                      />
                    ) : (
                      <div className="w-full h-full min-h-[6rem] flex items-center justify-center text-3xl">
                        {recipe?.icon || '🍽️'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-3 space-y-2 min-w-0">
                    <div className="flex flex-wrap gap-1">
                      {badges(p).map((b) => (
                        <Pill key={b.t} tone={b.tone}>
                          {b.t}
                        </Pill>
                      ))}
                    </div>
                    <p className="font-medium leading-snug">{title}</p>
                    <p className="text-xs text-nc-muted">
                      {p.portions_remaining}/{p.portions_prepared} ·{' '}
                      {p.expiry_date ? formatDateEU(p.expiry_date) : '—'}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="p-2 rounded-xl border border-nc-border"
                        aria-label="−"
                        onClick={() => adjust(p.id, -1)}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <BigButton
                        variant="soft"
                        className="flex-1 text-xs py-2"
                        disabled={(p.portions_remaining || 0) <= 0}
                        onClick={() => usePortion(p.id)}
                      >
                        {t('home.usePortion')}
                      </BigButton>
                      <button
                        type="button"
                        className="p-2 rounded-xl border border-nc-border"
                        aria-label="+"
                        onClick={() => adjust(p.id, 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab === 'pantry' && (
        <div className="space-y-2">
          <SectionTitle>{t('home.cupboard')} / {t('home.fridge')}</SectionTitle>
          {inventory.length === 0 && (
            <Card className="text-sm text-nc-muted py-6 text-center">
              {locale === 'en'
                ? 'No inventory yet — check off shopping items to fill stock.'
                : 'Ingen beholdning ennå — kryss av handlelisten for å fylle på.'}
            </Card>
          )}
          {inventory.map((i) => (
            <Card key={i.id} className="py-3 flex justify-between gap-2">
              <div>
                <p className="font-medium">{i.name}</p>
                <p className="text-xs text-nc-muted">
                  {i.location || i.location_zone} · {i.quantity} {i.unit}
                </p>
              </div>
              {Number(i.quantity) < Number(i.minimum_stock ?? 1) && (
                <Pill tone="peach">{locale === 'en' ? 'Low' : 'Lav'}</Pill>
              )}
            </Card>
          ))}
          <BigButton variant="secondary" className="w-full" onClick={() => nav('/shopping')}>
            {t('nav.shopping')}
          </BigButton>
        </div>
      )}
    </div>
  );
}
