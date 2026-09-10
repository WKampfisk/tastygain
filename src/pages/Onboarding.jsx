import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Card, BigButton } from '@/components/ui/Card';
import { CHAINS, FLAVOR_OPTIONS } from '@/lib/copy';

const steps = ['language', 'welcome', 'flavors', 'stores', 'privacy'];

export default function Onboarding() {
  const nav = useNavigate();
  const { completeOnboarding, t, locale, setLocale } = useStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    flavor_prefs: ['sweet', 'salty', 'cake', 'candy'],
    preferred_portion: 'small',
    preferred_chains: ['kiwi', 'rema_1000', 'coop'],
    primary_chain: 'kiwi',
    hide_calories: true,
    show_protein: true,
  });

  const id = steps[step];

  const finish = () => {
    completeOnboarding({
      household: {
        preferred_chains: form.preferred_chains,
        primary_chain: form.primary_chain || form.preferred_chains[0] || 'kiwi',
        discreet_mode: false,
        hide_calories: form.hide_calories,
        show_protein: form.show_protein,
        flavor_prefs: form.flavor_prefs,
        goal: 'muscle_gain',
        target_eating_events: 6,
        min_snacks: 10,
        locale,
      },
      profile: {
        prefer_liquid: false,
        preferred_portion: form.preferred_portion,
        preferred_temperature: 'either',
        safe_foods: form.flavor_prefs,
        favourite_foods: form.flavor_prefs,
        role: 'self',
      },
    });
    nav('/today');
  };

  const next = () => {
    if (step >= steps.length - 1) finish();
    else setStep((s) => s + 1);
  };

  return (
    <div className="min-h-screen bg-nc-bg max-w-lg mx-auto px-4 py-8">
      <p className="text-xs text-nc-muted mb-2">{t('onboarding.stepOf', [step + 1, steps.length])}</p>

      {id === 'language' && (
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-nc-ink">{t('language')}</h1>
          <div className="space-y-2">
            {[
              { id: 'nb', label: t('norwegian') },
              { id: 'en', label: t('english') },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLocale(opt.id)}
                className={`w-full min-h-[52px] px-4 rounded-2xl border text-left font-medium ${
                  locale === opt.id ? 'border-nc-green bg-nc-green/10' : 'border-nc-border bg-nc-card'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {id === 'welcome' && (
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-nc-ink">{t('appName')}</h1>
          <p className="text-nc-ink-soft leading-relaxed">{t('tagline')}</p>
          <Card className="bg-nc-green/10 border-nc-green/20">
            <p className="text-sm leading-relaxed">{t('onboarding.clinical')}</p>
            <p className="text-sm leading-relaxed mt-2">{t('somethingSmall')}</p>
          </Card>
          <p className="text-xs text-nc-muted">{t('disclaimer')}</p>
        </div>
      )}

      {id === 'flavors' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('onboarding.flavorsTitle')}</h2>
          <p className="text-sm text-nc-muted">{t('onboarding.foodsHint')}</p>
          {FLAVOR_OPTIONS.map((opt) => {
            const on = form.flavor_prefs.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    flavor_prefs: on
                      ? f.flavor_prefs.filter((x) => x !== opt.id)
                      : [...f.flavor_prefs, opt.id],
                  }))
                }
                className={`w-full min-h-[52px] px-4 rounded-2xl border text-left font-medium ${
                  on ? 'border-nc-green bg-nc-green/10' : 'border-nc-border bg-nc-card'
                }`}
              >
                {locale === 'en' ? opt.labelEn : opt.labelNb}
              </button>
            );
          })}
        </div>
      )}

      {id === 'stores' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('onboarding.storesTitle')}</h2>
          <p className="text-sm text-nc-muted">{t('store.primary')}</p>
          {CHAINS.map((c) => (
            <button
              key={`p-${c.id}`}
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  primary_chain: c.id,
                  preferred_chains: Array.from(new Set([c.id, ...f.preferred_chains])),
                }))
              }
              className={`w-full min-h-[48px] px-4 rounded-2xl border text-left font-medium ${
                form.primary_chain === c.id
                  ? 'border-nc-green bg-nc-green/10'
                  : 'border-nc-border bg-nc-card'
              }`}
            >
              {c.label}
            </button>
          ))}
          <p className="text-sm text-nc-muted pt-2">{t('store.alsoShop')}</p>
          {CHAINS.map((c) => {
            const on = form.preferred_chains.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    preferred_chains: on
                      ? f.preferred_chains.filter((x) => x !== c.id)
                      : [...f.preferred_chains, c.id],
                  }))
                }
                className={`w-full min-h-[48px] px-4 rounded-2xl border text-left font-medium ${
                  on ? 'border-nc-green bg-nc-green/10' : 'border-nc-border bg-nc-card'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      )}

      {id === 'privacy' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('onboarding.privacyTitle')}</h2>
          <label className="flex items-center gap-3 min-h-[48px]">
            <input
              type="checkbox"
              checked={form.show_protein}
              onChange={(e) => setForm((f) => ({ ...f, show_protein: e.target.checked }))}
              className="w-5 h-5 accent-nc-green"
            />
            {t('settings.showProtein')}
          </label>
          <label className="flex items-center gap-3 min-h-[48px]">
            <input
              type="checkbox"
              checked={form.hide_calories}
              onChange={(e) => setForm((f) => ({ ...f, hide_calories: e.target.checked }))}
              className="w-5 h-5 accent-nc-green"
            />
            {t('settings.hideCalories')}
          </label>
        </div>
      )}

      <div className="flex gap-2 mt-8">
        <BigButton
          variant="secondary"
          className="flex-1"
          onClick={() => (step === 0 ? nav('/today') : setStep((s) => s - 1))}
        >
          {step === 0 ? (locale === 'en' ? 'Skip' : 'Hopp over') : t('back')}
        </BigButton>
        <BigButton variant="primary" className="flex-1" onClick={next}>
          {step === steps.length - 1 ? t('onboarding.finish') : t('onboarding.next')}
        </BigButton>
      </div>
    </div>
  );
}
