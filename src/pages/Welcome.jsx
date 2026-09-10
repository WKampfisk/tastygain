import { useNavigate } from 'react-router-dom';
import { BigButton } from '@/components/ui/Card';
import { useStore } from '@/lib/store';
import AppLogo from '@/components/AppLogo';
import InstallBanner from '@/components/InstallBanner';

export default function Welcome() {
  const nav = useNavigate();
  const { state, t, setLocale, locale } = useStore();

  return (
    <div className="min-h-dvh bg-gradient-to-b from-nc-beige via-nc-bg to-nc-peach/40 max-w-lg mx-auto px-6 py-12 pb-[max(2rem,env(safe-area-inset-bottom))] flex flex-col">
      <div className="flex-1 flex flex-col justify-center space-y-6">
        <AppLogo size={88} className="w-22 h-22 w-[5.5rem] h-[5.5rem] rounded-3xl shadow-md" alt={t('appName')} />
        <div>
          <h1 className="text-4xl font-semibold text-nc-ink tracking-tight">{t('appName')}</h1>
          <p className="mt-3 text-lg text-nc-ink-soft leading-relaxed">{t('tagline')}</p>
        </div>

        <div
          className="inline-flex rounded-full border border-nc-border bg-nc-card p-1 self-start"
          role="group"
          aria-label={t('language')}
        >
          {[
            { id: 'nb', label: t('norwegian') },
            { id: 'en', label: t('english') },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setLocale(opt.id)}
              className={`min-h-[40px] px-4 rounded-full text-sm font-medium ${
                locale === opt.id ? 'bg-nc-green text-white' : 'text-nc-muted'
              }`}
              aria-pressed={locale === opt.id}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <InstallBanner />
        <ul className="space-y-2 text-sm text-nc-ink-soft">
          <li>· {t('mealAvailable')}</li>
          <li>· {t('somethingSmall')}</li>
          <li>· {t('welcome.clinical')}</li>
          <li>· {t('welcome.storesLine')}</li>
          <li>· {t('welcome.noShame')}</li>
        </ul>
        <p className="text-xs text-nc-muted leading-relaxed">{t('disclaimer')}</p>
      </div>
      <div className="space-y-3 pb-8">
        <BigButton
          variant="primary"
          className="w-full"
          onClick={() => nav(state.household?.onboarding_complete ? '/today' : '/onboarding')}
        >
          {state.household?.onboarding_complete ? t('welcome.openToday') : t('welcome.getStarted')}
        </BigButton>
        <BigButton variant="secondary" className="w-full" onClick={() => nav('/today')}>
          {t('welcome.enterApp')}
        </BigButton>
      </div>
    </div>
  );
}
