import { useEffect, useState } from 'react';
import { BigButton } from '@/components/ui/Card';
import { useStore } from '@/lib/store';

export default function InstallBanner() {
  const { t, locale } = useStore();
  const [deferred, setDeferred] = useState(null);
  const [dismissed, setDismissed] = useState(
    () => typeof sessionStorage !== 'undefined' && sessionStorage.getItem('tg_install_dismissed') === '1'
  );

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (dismissed || !deferred) return null;

  return (
    <div className="rounded-2xl border border-nc-border bg-nc-card p-3 flex items-center gap-3">
      <p className="text-sm text-nc-ink-soft flex-1 leading-snug">
        {locale === 'en' ? 'Add TastyGain to your home screen.' : 'Legg TastyGain på startskjermen.'}
      </p>
      <BigButton
        className="shrink-0 px-3 min-h-[44px]"
        onClick={async () => {
          deferred.prompt();
          await deferred.userChoice;
          setDeferred(null);
        }}
      >
        {locale === 'en' ? 'Install' : 'Installer'}
      </BigButton>
      <button
        type="button"
        className="text-xs text-nc-muted min-h-[44px] px-2"
        onClick={() => {
          sessionStorage.setItem('tg_install_dismissed', '1');
          setDismissed(true);
        }}
      >
        {t('close')}
      </button>
    </div>
  );
}
