import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { PLAN_COPY } from '@/lib/copy';
import { formatNOK } from '@/lib/utils';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 'plan', label: PLAN_COPY.stepPlan },
  { id: 'handle', label: PLAN_COPY.stepHandle },
  { id: 'tilbered', label: PLAN_COPY.stepPrep },
];

export default function PlanSessionBar() {
  const nav = useNavigate();
  const { state, setDraftStep, commitDraftToShopping, confirmDraftPrep, abandonDraft, clearCompletedDraft } =
    useStore();
  const draft = state.planDraft;
  const discreet = state.household?.discreet_mode;

  if (!draft?.selections?.length) return null;
  if (draft.status === 'abandoned') return null;

  const stats = draft.computed?.stats || {
    recipe_count: draft.selections.length,
    shop_count: draft.computed?.shopping_lines?.length || 0,
    container_count: draft.computed?.container_plan?.total_containers || 0,
    estimate_total_ore: draft.computed?.estimate_total_ore || 0,
  };
  const step = draft.step || 'plan';

  const primary = () => {
    if (draft.status === 'completed') {
      clearCompletedDraft();
      return;
    }
    if (step === 'plan') {
      setDraftStep('handle');
      nav('/meals?tab=session&step=handle');
    } else if (step === 'handle') {
      commitDraftToShopping();
      setDraftStep('tilbered');
      nav('/meals?tab=session&step=tilbered');
    } else {
      confirmDraftPrep();
    }
  };

  const primaryLabel =
    draft.status === 'completed'
      ? 'Lukk økt'
      : step === 'plan'
        ? 'Gå til handle'
        : step === 'handle'
          ? PLAN_COPY.commitShopping
          : PLAN_COPY.confirmAll;

  return (
    <div className="sticky top-[57px] z-20 border-b border-nc-border bg-nc-card/95 backdrop-blur px-3 py-2 shadow-sm">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="text-xs font-semibold text-nc-green-dark">
            {discreet ? PLAN_COPY.sessionTitleDiscreet : PLAN_COPY.sessionTitle}
          </p>
          <button
            type="button"
            className="text-[11px] text-nc-muted underline"
            onClick={abandonDraft}
          >
            {PLAN_COPY.abandon}
          </button>
        </div>
        <div className="flex gap-1 mb-2">
          {STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setDraftStep(s.id);
                nav(`/meals?tab=session&step=${s.id}`);
              }}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-[11px] font-medium',
                step === s.id
                  ? 'bg-nc-green text-white'
                  : 'bg-nc-beige text-nc-ink-soft'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-nc-muted mb-2">
          {stats.recipe_count} retter · {stats.shop_count} varer · ~
          {formatNOK(stats.estimate_total_ore)} · {stats.container_count} beholdere
        </p>
        <button
          type="button"
          onClick={primary}
          className="w-full min-h-[40px] rounded-xl bg-nc-green text-white text-sm font-semibold"
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}
