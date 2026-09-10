import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Lightbulb,
  Home,
  Settings,
  ShoppingCart,
  UtensilsCrossed,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import PlanSessionBar from '@/components/plan/PlanSessionBar';
import AppLogo from '@/components/AppLogo';

export default function AppShell() {
  const { state, toast, undoStack, undoLast, t } = useStore();
  const navigate = useNavigate();

  const nav = [
    { to: '/today', label: t('nav.today'), icon: Home },
    { to: '/meals', label: t('nav.meals'), icon: CalendarDays },
    { to: '/kitchen', label: t('nav.home'), icon: UtensilsCrossed },
    { to: '/shopping', label: t('nav.shopping'), icon: ShoppingCart },
    { to: '/tips', label: t('nav.support'), icon: Lightbulb },
  ];

  return (
    <div className="min-h-screen bg-nc-bg text-nc-ink flex flex-col max-w-lg mx-auto relative">
      <header className="sticky top-0 z-30 bg-nc-bg/95 backdrop-blur border-b border-nc-border safe-top">
        <div className="px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <AppLogo size={40} className="w-10 h-10" alt={t('appName')} />
            <div className="min-w-0">
              <p className="text-xs text-nc-muted tracking-wide uppercase truncate">{t('appName')}</p>
              <h1 className="text-lg font-semibold text-nc-ink leading-tight truncate">
                {state.household?.name || t('nav.home')}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="p-2.5 rounded-xl bg-nc-card border border-nc-border"
              aria-label={t('settings')}
            >
              <Settings className="w-5 h-5 text-nc-muted" />
            </button>
          </div>
        </div>
      </header>

      <PlanSessionBar />

      <main className="flex-1 px-4 py-4 pb-28 overflow-x-hidden relative flex flex-col min-h-0">
        <div className="flex-1">
          <Outlet />
        </div>
      </main>

      {(toast || undoStack) && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 max-w-[90%] flex items-center gap-3 px-4 py-3 rounded-2xl bg-nc-ink text-white shadow-lg text-sm">
          <span>{toast || t('toast.updated')}</span>
          {undoStack && (
            <button type="button" className="underline font-medium" onClick={undoLast}>
              {t('undo')}
            </button>
          )}
        </div>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-nc-border bg-nc-card/95 backdrop-blur safe-bottom"
        aria-label={t('mainNav')}
      >
        <div className="max-w-lg mx-auto flex justify-around px-1 py-2">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 min-w-[4.25rem] py-1.5 px-2 rounded-xl text-[11px] font-medium transition-colors',
                  isActive ? 'text-nc-green bg-nc-green/10' : 'text-nc-muted hover:text-nc-ink'
                )
              }
            >
              <Icon className="w-6 h-6" strokeWidth={1.75} aria-hidden />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
