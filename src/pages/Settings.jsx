import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Card, SectionTitle, BigButton } from '@/components/ui/Card';
import { CHAINS, CONSENT_LABELS } from '@/lib/copy';
import { base44 } from '@/api/base44Client';
import { ArrowLeft } from 'lucide-react';

export default function Settings() {
  const nav = useNavigate();
  const { state, update, resetDemo, showToast, user, t, locale, setLocale } = useStore();
  const hh = state.household || {};

  const toggleChain = (id) => {
    update((prev) => {
      const set = new Set(prev.household.preferred_chains || []);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      const preferred_chains = Array.from(set);
      if (preferred_chains.length === 0) preferred_chains.push('kiwi');
      let primary_chain = prev.household.primary_chain;
      if (!preferred_chains.includes(primary_chain)) primary_chain = preferred_chains[0];
      return { ...prev, household: { ...prev.household, preferred_chains, primary_chain } };
    });
  };

  return (
    <div className="max-w-lg mx-auto min-h-dvh bg-nc-bg px-4 py-4 pb-[max(4rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        onClick={() => nav(-1)}
        className="flex items-center gap-2 text-sm text-nc-muted mb-4 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" /> {t('back')}
      </button>

      <h1 className="text-2xl font-semibold mb-1">{t('settings')}</h1>
      <p className="text-sm text-nc-ink-soft mb-4">{t('tagline')}</p>

      <SectionTitle>{t('language')}</SectionTitle>
      <Card className="mb-4 space-y-2">
        <p className="text-xs text-nc-muted">{t('settings.languageHint')}</p>
        <div className="inline-flex rounded-full border border-nc-border p-1" role="group">
          {[
            { id: 'nb', label: t('norwegian') },
            { id: 'en', label: t('english') },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setLocale(opt.id)}
              className={`min-h-[44px] px-5 rounded-full text-sm font-medium ${
                locale === opt.id ? 'bg-nc-green text-white' : 'text-nc-muted'
              }`}
              aria-pressed={locale === opt.id}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      <SectionTitle>{t('store.title')}</SectionTitle>
      <Card className="space-y-3 mb-4">
        <p className="text-xs text-nc-muted">{t('store.chipHint')}</p>
        <p className="text-sm font-medium">{t('store.primary')}</p>
        {CHAINS.map((c) => (
          <label key={c.id} className="flex items-center gap-3 min-h-[48px] cursor-pointer">
            <input
              type="radio"
              name="primary_chain"
              checked={(hh.primary_chain || hh.preferred_chains?.[0]) === c.id}
              onChange={() =>
                update((p) => {
                  const preferred = new Set(p.household.preferred_chains || []);
                  preferred.add(c.id);
                  return {
                    ...p,
                    household: {
                      ...p.household,
                      primary_chain: c.id,
                      preferred_chains: Array.from(preferred),
                    },
                  };
                })
              }
              className="w-5 h-5 accent-nc-green"
            />
            <span className="font-medium">{c.label}</span>
          </label>
        ))}
        <label className="block">
          <span className="text-xs text-nc-muted">{t('store.localLabel')}</span>
          <input
            className="mt-1 w-full min-h-[44px] px-3 rounded-xl border border-nc-border text-sm"
            placeholder={t('store.localPlaceholder')}
            value={hh.primary_store_label || ''}
            onChange={(e) =>
              update((p) => ({
                ...p,
                household: { ...p.household, primary_store_label: e.target.value },
              }))
            }
          />
        </label>
        <p className="text-sm font-medium pt-2">{t('store.alsoShop')}</p>
        {CHAINS.map((c) => {
          const on = (hh.preferred_chains || []).includes(c.id);
          return (
            <label key={`also-${c.id}`} className="flex items-center gap-3 min-h-[48px] cursor-pointer">
              <input
                type="checkbox"
                checked={on}
                onChange={() => toggleChain(c.id)}
                className="w-5 h-5 accent-nc-green"
              />
              <span className="font-medium">{c.label}</span>
            </label>
          );
        })}
      </Card>

      <SectionTitle>{t('settings.privacy')}</SectionTitle>
      <Card className="space-y-3 mb-4">
        <Toggle
          label={t('settings.discreet')}
          hint={t('settings.discreetHint')}
          checked={!!hh.discreet_mode}
          onChange={(v) =>
            update((p) => ({ ...p, household: { ...p.household, discreet_mode: v } }))
          }
        />
        <Toggle
          label={t('settings.showProtein')}
          checked={hh.show_protein !== false}
          onChange={(v) =>
            update((p) => ({ ...p, household: { ...p.household, show_protein: v } }))
          }
        />
        <Toggle
          label={t('settings.hideCalories')}
          checked={hh.hide_calories !== false}
          onChange={(v) =>
            update((p) => ({ ...p, household: { ...p.household, hide_calories: v } }))
          }
        />
        <div>
          <p className="text-sm font-medium">{t('settings.quickExitUrl')}</p>
          <input
            className="mt-1 w-full min-h-[44px] px-3 rounded-xl border border-nc-border text-sm"
            value={hh.quick_exit_url || ''}
            onChange={(e) =>
              update((p) => ({
                ...p,
                household: { ...p.household, quick_exit_url: e.target.value },
              }))
            }
          />
        </div>
        <p className="text-xs text-nc-muted">
          {CONSENT_LABELS[hh.consent_mode] || hh.consent_mode}
        </p>
      </Card>

      <SectionTitle>{t('settings.minStock')}</SectionTitle>
      <Card className="grid grid-cols-2 gap-3 mb-4 text-sm">
        {[
          ['min_freezer_meals', t('settings.minFreezer')],
          ['min_fridge_prepared', t('home.fridge')],
          ['min_cupboard_essentials', t('settings.minCupboard')],
          ['min_smoothie_servings', t('settings.minSmoothie')],
          ['min_easy_breakfasts', t('settings.minBreakfast')],
          ['min_snacks', t('settings.minSnacks')],
          ['min_nutritional_drinks', t('settings.minDrinks')],
        ].map(([key, label]) => (
          <label key={key} className="block">
            <span className="text-xs text-nc-muted">{label}</span>
            <input
              type="number"
              min={0}
              className="mt-1 w-full min-h-[44px] px-3 rounded-xl border border-nc-border"
              value={hh[key] ?? 0}
              onChange={(e) =>
                update((p) => ({
                  ...p,
                  household: { ...p.household, [key]: Number(e.target.value) },
                }))
              }
            />
          </label>
        ))}
      </Card>

      <SectionTitle>{t('settings.account')}</SectionTitle>
      <Card className="space-y-2 mb-4 text-sm">
        <p>
          {user
            ? `${locale === 'en' ? 'Signed in as' : 'Innlogget som'} ${user.email || user.full_name || '…'}`
            : locale === 'en'
              ? 'Data is stored locally on this device.'
              : 'Data lagres lokalt på denne enheten.'}
        </p>
        {!user && import.meta.env.VITE_OFFLINE_STACK !== 'true' && (
          <BigButton
            variant="secondary"
            className="w-full"
            onClick={() => {
              try {
                base44.auth.redirectToLogin?.(window.location.href);
              } catch {
                showToast(
                  locale === 'en'
                    ? 'Open the app from Base44 dashboard to sign in'
                    : 'Åpne appen fra Base44-dashboard for å logge inn'
                );
              }
            }}
          >
            Base44
          </BigButton>
        )}
      </Card>

      <BigButton variant="secondary" className="w-full mb-2" onClick={resetDemo}>
        {t('settings.clearData')}
      </BigButton>
      <BigButton variant="soft" className="w-full" onClick={() => nav('/onboarding')}>
        {t('settings.rerunOnboarding')}
      </BigButton>
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="flex items-start justify-between gap-3 min-h-[48px] cursor-pointer">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-nc-muted">{hint}</p>}
      </div>
      <input
        type="checkbox"
        className="w-5 h-5 accent-nc-green mt-1"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
