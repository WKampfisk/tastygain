import { useMemo, useRef, useState, useEffect } from 'react';
import { ChevronDown, Plus, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { Card, Pill } from '@/components/ui/Card';
import { PERIODS, PERIOD_LABELS } from '@/lib/copy';
import { recipeDisplayName } from '@/lib/i18n/recipeDisplay';
import { cn } from '@/lib/utils';

/**
 * Per-day meal plan row with "Add meal" dropdown of selectable recipes.
 */
export default function DayMealPicker({
  date,
  label,
  isToday,
  entries = [],
  recipes = [],
  preferences = {},
  locale = 'nb',
  onAdd,
  onRemove,
  onLike,
  onDislike,
}) {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState('dinner');
  const [q, setQ] = useState('');
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const options = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (recipes || [])
      .filter((r) => preferences[r.id] !== 'disliked')
      .filter((r) => {
        if (!needle) return true;
        const name = recipeDisplayName(r, locale).toLowerCase();
        return name.includes(needle) || (r.category || '').includes(needle);
      })
      .slice(0, 40);
  }, [recipes, preferences, q, locale]);

  const addLabel = locale === 'en' ? 'Add meal' : 'Legg til måltid';
  const emptyLabel =
    locale === 'en' ? 'No meals planned yet' : 'Ingen måltider planlagt ennå';

  return (
    <div ref={rootRef} className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-nc-ink tracking-wide">
          {label}
          {isToday ? (locale === 'en' ? ' · Today' : ' · I dag') : ''}
        </h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-full text-xs font-medium',
            open
              ? 'bg-nc-green text-white'
              : 'bg-nc-card border border-nc-border text-nc-green-dark hover:bg-nc-green/10'
          )}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden />
          {addLabel}
          <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
        </button>
      </div>

      {open && (
        <Card className="p-3 space-y-2 border-nc-green/30 shadow-md z-20 relative">
          <div className="flex flex-wrap gap-2">
            <label className="text-xs text-nc-muted flex items-center gap-1.5">
              {locale === 'en' ? 'Time of day' : 'Tid på dagen'}
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="min-h-[36px] rounded-xl border border-nc-border bg-white px-2 text-sm"
              >
                {PERIODS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {PERIOD_LABELS[p.id] || p.label}
                  </option>
                ))}
              </select>
            </label>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={locale === 'en' ? 'Search meals…' : 'Søk i måltider…'}
              className="flex-1 min-w-[8rem] min-h-[36px] rounded-xl border border-nc-border px-3 text-sm"
              aria-label={locale === 'en' ? 'Search meals' : 'Søk i måltider'}
            />
          </div>
          <ul
            className="max-h-56 overflow-y-auto divide-y divide-nc-border rounded-xl border border-nc-border bg-white"
            role="listbox"
            aria-label={addLabel}
          >
            {options.length === 0 && (
              <li className="px-3 py-4 text-sm text-nc-muted text-center">
                {locale === 'en' ? 'No matching meals' : 'Ingen treff'}
              </li>
            )}
            {options.map((r) => {
              const name = recipeDisplayName(r, locale);
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    role="option"
                    className="w-full text-left px-3 py-2.5 hover:bg-nc-green/10 flex items-center gap-2 min-h-[44px]"
                    onClick={() => {
                      onAdd?.(date, r, period);
                      setOpen(false);
                      setQ('');
                    }}
                  >
                    <span className="text-lg w-8 text-center shrink-0">{r.icon || '🍽️'}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-sm truncate">{name}</span>
                      <span className="block text-[11px] text-nc-muted capitalize">
                        {(r.category || '').replace(/_/g, ' ')}
                        {r.portion_size_label ? ` · ${r.portion_size_label}` : ''}
                      </span>
                    </span>
                    <Plus className="w-4 h-4 text-nc-green shrink-0" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <div className="space-y-2">
        {entries.length === 0 && !open && (
          <Card className="py-3 text-sm text-nc-muted">{emptyLabel}</Card>
        )}
        {entries.map((e) => (
          <Card key={e.id} className="py-3 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-nc-muted">{PERIOD_LABELS[e.period] || e.period}</p>
              <p className="font-medium truncate">{e.recipe_name}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {e.is_prepared && <Pill tone="green">{locale === 'en' ? 'Ready' : 'Klar'}</Pill>}
                {e.is_optional && <Pill>{locale === 'en' ? 'Optional' : 'Valgfri'}</Pill>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="flex gap-1">
                <button
                  type="button"
                  className="p-2 rounded-xl border border-nc-border hover:bg-emerald-50"
                  aria-label={locale === 'en' ? 'Like' : 'Lik'}
                  title={
                    locale === 'en'
                      ? 'Like — keep and add similar recipe'
                      : 'Lik — behold og lag ny i samme kategori'
                  }
                  onClick={() => onLike?.(e)}
                >
                  <ThumbsUp className="w-4 h-4 text-nc-green" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-xl border border-nc-border hover:bg-stone-100"
                  aria-label={locale === 'en' ? 'Dislike' : 'Mislik'}
                  title={
                    locale === 'en'
                      ? 'Dislike — remove and add new in same category'
                      : 'Mislik — fjern og lag ny i samme kategori'
                  }
                  onClick={() => onDislike?.(e)}
                >
                  <ThumbsDown className="w-4 h-4 text-stone-600" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-xl border border-nc-border hover:bg-rose-50"
                  aria-label={locale === 'en' ? 'Remove' : 'Fjern'}
                  onClick={() => onRemove?.(e.id)}
                >
                  <X className="w-4 h-4 text-rose-700/80" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
