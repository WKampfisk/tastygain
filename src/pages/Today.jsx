import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Card, SectionTitle, Pill, BigButton } from '@/components/ui/Card';
import { COPY, LOG_STATUSES, PERIODS, READINESS_OPTS, statusLabel } from '@/lib/copy';
import { formatDateEU, todayISO } from '@/lib/utils';
import { ClipboardList, Coffee, Package, Plus, RefreshCw, ShoppingBag } from 'lucide-react';

export default function Today() {
  const nav = useNavigate();
  const { state, metrics, gentleAlerts, updatePlanStatus, logFood, t } = useStore();
  const targetBites = state.household?.target_eating_events || 6;
  const eatenStatuses = ['ate_all', 'ate_some', 'drank_all', 'drank_some'];
  const bitesToday = (state.logs || []).filter((l) => {
    const day = String(l.logged_at || l.date || '').slice(0, 10);
    return day === todayISO() && eatenStatuses.includes(l.status);
  }).length;
  const [logOpen, setLogOpen] = useState(null);
  const [readinessOpen, setReadinessOpen] = useState(false);

  const todayPlan = useMemo(
    () =>
      (state.plan || [])
        .filter((p) => p.date === todayISO())
        .sort(
          (a, b) =>
            PERIODS.findIndex((x) => x.id === a.period) - PERIODS.findIndex((x) => x.id === b.period)
        ),
    [state.plan]
  );

  const openLog = (meal) => setLogOpen(meal);

  const submitLog = (status) => {
    if (!logOpen) return;
    logFood({
      meal_name: logOpen.recipe_name || logOpen.name,
      period: logOpen.period,
      status,
      reason: 'none',
    });
    if (logOpen.id) updatePlanStatus(logOpen.id, status);
    setLogOpen(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-nc-muted">{formatDateEU(todayISO())}</p>
        <p className="text-nc-ink-soft mt-1">{t('readyWhenYouAre')}</p>
      </div>

      <Card className="py-3 px-4 bg-nc-green/10 border-nc-green/20">
        <p className="text-xs text-nc-muted">{t('today.bites')}</p>
        <p className="text-2xl font-semibold text-nc-green-dark">
          {bitesToday} / {targetBites}
        </p>
        <p className="text-xs text-nc-ink-soft mt-0.5">{t('today.bitesHint', [bitesToday, targetBites])}</p>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: t('home.portions'), value: metrics.ready },
          { label: t('home.freezer'), value: metrics.freezer },
          { label: t('home.fridge'), value: metrics.fridge },
          { label: t('nav.shopping'), value: metrics.shoppingOpen },
        ].map((m) => (
          <Card key={m.label} className="py-3 px-3">
            <p className="text-2xl font-semibold text-nc-green-dark">{m.value}</p>
            <p className="text-xs text-nc-muted mt-0.5">{m.label}</p>
          </Card>
        ))}
      </div>

      {gentleAlerts.length > 0 && (
        <div className="space-y-2" aria-live="polite">
          {gentleAlerts.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                if (a.action === 'shopping') nav('/shopping');
                else if (a.action === 'kitchen') nav('/kitchen');
                else if (a.action === 'prep') nav('/meals?tab=session');
              }}
              className="w-full text-left rounded-2xl px-4 py-3 bg-nc-blue/15 border border-nc-blue/30 text-sm text-nc-ink-soft hover:bg-nc-blue/25"
            >
              {a.text}
            </button>
          ))}
        </div>
      )}

      <SectionTitle>{t('today.quick')}</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <BigButton
          variant="primary"
          className="flex items-center justify-center gap-2"
          onClick={() => nav('/meals?tab=discover')}
        >
          <Plus className="w-4 h-4" /> {t('today.addMeal')}
        </BigButton>
        <BigButton
          variant="secondary"
          className="flex items-center justify-center gap-2"
          onClick={() => setLogOpen({ recipe_name: t('today.logFood'), period: 'lunch' })}
        >
          <ClipboardList className="w-4 h-4" /> {t('today.logFood')}
        </BigButton>
        <BigButton
          variant="soft"
          className="flex items-center justify-center gap-2"
          onClick={() => nav('/meals?tab=discover&chip=shakes')}
        >
          <Coffee className="w-4 h-4" /> {t('today.makeShake')}
        </BigButton>
        <BigButton
          variant="peach"
          className="flex items-center justify-center gap-2"
          onClick={() => nav('/kitchen')}
        >
          <Package className="w-4 h-4" /> {t('today.checkPortions')}
        </BigButton>
        <BigButton
          variant="secondary"
          className="flex items-center justify-center gap-2 col-span-2"
          onClick={() => nav('/shopping')}
        >
          <ShoppingBag className="w-4 h-4" /> {t('today.toShopping')}
        </BigButton>
        <BigButton
          variant="primary"
          className="flex items-center justify-center gap-2 col-span-2"
          onClick={() => nav('/meals?tab=session')}
        >
          {t('today.prepSession')}
        </BigButton>
      </div>

      <SectionTitle
        action={
          <button
            type="button"
            className="text-sm text-nc-green font-medium"
            onClick={() => setReadinessOpen((v) => !v)}
          >
            {t('today.readiness')}
          </button>
        }
      >
        {t('today.dayPlan')}
      </SectionTitle>

      {readinessOpen && <ReadinessCard />}

      <div className="space-y-3">
        {todayPlan.map((meal) => {
          const period = PERIODS.find((p) => p.id === meal.period)?.label || meal.period;
          const recipe = (state.recipes || []).find((r) => r.id === meal.recipe_id);
          return (
            <Card key={meal.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-3xl w-12 h-12 flex items-center justify-center rounded-2xl bg-nc-beige">
                  {recipe?.icon || '🍽️'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Pill tone="blue">{period}</Pill>
                    {meal.is_optional && <Pill>Valgfri</Pill>}
                    {meal.is_prepared && <Pill tone="green">Tilberedt</Pill>}
                  </div>
                  <h3 className="font-semibold text-nc-ink mt-1">{meal.recipe_name}</h3>
                  <p className="text-xs text-nc-muted mt-0.5">
                    {meal.portion_label || 'liten'} · ~{meal.prep_minutes || recipe?.prep_minutes || 5}{' '}
                    min
                    {meal.backup_name ? ` · Reserve: ${meal.backup_name}` : ''}
                  </p>
                </div>
              </div>
              <p className="text-sm text-nc-ink-soft">{t('wouldFeelManageable')}</p>
              <div className="flex flex-wrap gap-2">
                <BigButton
                  variant="primary"
                  className="text-xs px-3 min-h-[44px]"
                  onClick={() => openLog(meal)}
                >
                  Loggfør
                </BigButton>
                <BigButton
                  variant="secondary"
                  className="text-xs px-3 min-h-[44px]"
                  onClick={() => updatePlanStatus(meal.id, 'skipped_without_pressure')}
                >
                  {COPY.skippedWithoutPressure}
                </BigButton>
                <BigButton
                  variant="soft"
                  className="text-xs px-3 min-h-[44px]"
                  onClick={() => {
                    updatePlanStatus(meal.id, 'swapped');
                    openLog({
                      ...meal,
                      recipe_name: meal.backup_name || 'Banan-peanøttsmør-shake',
                    });
                  }}
                >
                  <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
                  Bytt
                </BigButton>
                <BigButton
                  variant="peach"
                  className="text-xs px-3 min-h-[44px]"
                  onClick={() => updatePlanStatus(meal.id, 'did_not_feel_manageable')}
                >
                  {COPY.tooMuchToday}
                </BigButton>
              </div>
              {meal.status && meal.status !== 'planned' && (
                <p className="text-xs text-nc-green-dark font-medium">
                  {COPY.logged}: {statusLabel(meal.status)}
                </p>
              )}
            </Card>
          );
        })}
        {todayPlan.length === 0 && (
          <Card>
            <p className="text-nc-muted text-sm">
              Ingen plan ennå. Legg til måltider under Måltider.
            </p>
          </Card>
        )}
      </div>

      {logOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center p-4"
          role="dialog"
        >
          <Card className="w-full max-w-md space-y-3 max-h-[80vh] overflow-y-auto">
            <h3 className="font-semibold text-lg">Loggfør · {logOpen.recipe_name}</h3>
            <p className="text-sm text-nc-muted">{COPY.somethingSmall}</p>
            <div className="grid grid-cols-1 gap-2">
              {LOG_STATUSES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="min-h-[48px] text-left px-4 rounded-xl border border-nc-border hover:bg-nc-beige font-medium text-sm"
                  onClick={() => submitLog(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <BigButton variant="secondary" className="w-full" onClick={() => setLogOpen(null)}>
              {COPY.close}
            </BigButton>
          </Card>
        </div>
      )}
    </div>
  );
}

function ReadinessCard() {
  const { update, showToast, state } = useStore();
  const [form, setForm] = useState({
    appetite: 'low',
    nausea: 'none',
    energy: 'low',
    prefer_hot_cold: 'cold',
    prefer_liquid_solid: 'liquid',
  });

  return (
    <Card className="space-y-3 mb-2">
      <p className="text-sm text-nc-muted">
        Valgfritt — brukes bare for å forbedre forslag. Ikke en poengsum.
      </p>
      {Object.entries(READINESS_OPTS).map(([key, conf]) => (
        <div key={key}>
          <p className="text-xs font-medium text-nc-muted mb-1">{conf.label}</p>
          <div className="flex flex-wrap gap-1.5">
            {conf.options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, [key]: o.id }))}
                className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                  form[key] === o.id
                    ? 'bg-nc-green text-white border-nc-green'
                    : 'bg-nc-card border-nc-border'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      ))}
      <BigButton
        variant="primary"
        onClick={() => {
          update((prev) => ({
            ...prev,
            readiness: {
              ...form,
              date: todayISO(),
              household_id: prev.household.id,
            },
          }));
          showToast('Dagsform lagret for forslag');
        }}
      >
        Lagre dagsform
      </BigButton>
    </Card>
  );
}
