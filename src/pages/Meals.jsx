import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Card, SectionTitle, Pill, BigButton } from '@/components/ui/Card';
import MealCard from '@/components/MealCard';
import DayMealPicker from '@/components/plan/DayMealPicker';
import {
  COPY,
  DIFFICULTY_LABELS,
  ENERGY_LABELS,
  PERIOD_LABELS,
  PLAN_COPY,
  TEMP_LABELS,
} from '@/lib/copy';
import {
  calculateBatchContainers,
  formatBatchContainerSummary,
} from '@/lib/containers';
import { categoryMatchesChip, sortRecipesForReadiness } from '@/lib/mealRanking';
import { recipeDisplayName } from '@/lib/i18n/recipeDisplay';
import { formatDateEU, addDaysISO, todayISO, cn, formatNOK } from '@/lib/utils';

/** Normalize legacy URL aliases → IA tabs */
function normalizeTab(raw) {
  const map = {
    smoothies: 'discover',
    dinners: 'discover',
    snacks: 'discover',
    shakes: 'discover',
    soups: 'discover',
    desserts: 'discover',
    discover: 'discover',
    session: 'session',
    plan: 'plan',
    prep: 'prep',
    uke: 'plan',
  };
  return map[raw] || raw || 'plan';
}

export default function Meals() {
  const [params, setParams] = useSearchParams();
  const rawTab = params.get('tab') || 'plan';
  const tab = normalizeTab(rawTab);
  const chipParam = params.get('chip') || legacyChip(rawTab) || 'all';
  const setTab = (id, chip) => {
    const next = {};
    if (id !== 'plan') next.tab = id;
    if (chip && chip !== 'all') next.chip = chip;
    const step = params.get('step');
    if (step) next.step = step;
    setParams(next);
  };
  const {
    state,
    addToSession,
    confirmPrep,
    addPlanMeal,
    removePlanMeal,
    rateRecipe,
    t,
    locale,
  } = useStore();
  const [selected, setSelected] = useState(null);
  const discreet = state.household?.discreet_mode;
  const preferences = state.recipePreferences || {};

  const recipes = state.recipes || [];
  const ranked = useMemo(
    () =>
      sortRecipesForReadiness(
        recipes.filter((r) => preferences[r.id] !== 'disliked'),
        state.readiness,
        state.household?.flavor_prefs || []
      ),
    [recipes, state.readiness, preferences, state.household?.flavor_prefs]
  );
  const byCat = useMemo(
    () => ({
      smoothies: recipes.filter((r) => r.category === 'smoothie_shake'),
      dinners: recipes.filter((r) => r.category === 'dinner'),
      snacks: recipes.filter((r) => r.category === 'snack_small' || r.category === 'food_prep'),
      soups: recipes.filter((r) => r.category === 'soup'),
      desserts: recipes.filter((r) => r.category === 'dessert'),
    }),
    [recipes]
  );

  const discoverList = useMemo(
    () => ranked.filter((r) => categoryMatchesChip(r, chipParam)),
    [ranked, chipParam]
  );

  const TABS = [
    { id: 'session', label: t('meals.session') },
    { id: 'plan', label: t('meals.plan') },
    { id: 'discover', label: t('meals.discover') },
    { id: 'prep', label: t('meals.prep') },
  ];

  const CHIPS = [
    { id: 'all', label: t('meals.all') },
    { id: 'cake', label: t('meals.cake') },
    { id: 'candy', label: t('meals.candy') },
    { id: 'salty', label: t('meals.salty') },
    { id: 'sweet', label: t('meals.sweet') },
    { id: 'shakes', label: t('meals.shakes') },
    { id: 'meals', label: t('meals.meals') },
  ];

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDaysISO(todayISO(), i)), []);

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap',
              tab === t.id
                ? 'bg-nc-green text-white'
                : 'bg-nc-card border border-nc-border text-nc-muted'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'plan' && (
        <div className="space-y-5">
          <p className="text-sm text-nc-muted">
            {locale === 'en'
              ? 'Flexible week plan — use Add meal on each day. Like keeps the dish and adds a similar recipe; dislike removes it and adds a new one in the same category.'
              : 'Fleksibel ukeplan — bruk Legg til måltid på hver dag. Lik beholder retten og lager en lignende; mislik fjerner den og lager en ny i samme kategori.'}
          </p>
          {days.map((date) => {
            const entries = (state.plan || []).filter((p) => p.date === date);
            return (
              <DayMealPicker
                key={date}
                date={date}
                label={formatDateEU(date)}
                isToday={date === todayISO()}
                entries={entries}
                recipes={recipes}
                preferences={preferences}
                locale={locale}
                onAdd={(d, recipe, period) => addPlanMeal(d, recipe, period)}
                onRemove={removePlanMeal}
                onLike={(entry) => {
                  const recipe = recipes.find((r) => r.id === entry.recipe_id) || {
                    id: entry.recipe_id,
                    name: entry.recipe_name,
                    category: entry.category || 'dinner',
                  };
                  rateRecipe(recipe, 'liked', { planEntryId: entry.id });
                }}
                onDislike={(entry) => {
                  const recipe = recipes.find((r) => r.id === entry.recipe_id) || {
                    id: entry.recipe_id,
                    name: entry.recipe_name,
                    category: entry.category || 'dinner',
                  };
                  rateRecipe(recipe, 'disliked', { planEntryId: entry.id });
                }}
              />
            );
          })}
        </div>
      )}

      {tab === 'session' && <SessionWizard onOpenRecipe={setSelected} />}
      {tab === 'discover' && (
        <div className="space-y-3">
          <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
            {CHIPS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setTab('discover', c.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap',
                  chipParam === c.id
                    ? 'bg-lime-200 text-nc-green-dark'
                    : 'bg-nc-card border border-nc-border text-nc-muted'
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {discoverList.map((r) => (
              <MealCard
                key={r.id}
                recipe={r}
                locale={locale}
                discreet={discreet}
                preference={preferences[r.id]}
                t={t}
                showProtein={state.household?.show_protein !== false}
                onLike={(recipe) => rateRecipe(recipe, 'liked')}
                onDislike={(recipe) => rateRecipe(recipe, 'disliked')}
                onAddSession={(recipe) => {
                  addToSession(recipe, recipe.portions || 1, recipe.category === 'smoothie_shake' ? 'fridge' : 'fridge');
                }}
                onPrepOnly={(recipe) => {
                  confirmPrep({
                    recipe,
                    portions: Math.min(2, recipe.portions || 1),
                    storageType: recipe.category === 'smoothie_shake' ? 'fridge' : 'fridge',
                  });
                }}
              />
            ))}
          </div>
          {discoverList.length === 0 && (
            <Card className="text-sm text-nc-muted text-center py-6">—</Card>
          )}
          {/* Keep list open for detail modal via long-press alternative: tap title area */}
          <div className="grid grid-cols-1 gap-2">
            {discoverList.map((r) => (
              <button
                key={`detail-${r.id}`}
                type="button"
                className="text-left text-xs text-nc-green underline"
                onClick={() => setSelected(r)}
              >
                {recipeDisplayName(r, locale)} →
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Legacy tab fallbacks if URL not normalized */}
      {tab === 'smoothies' && <RecipeList items={byCat.smoothies} onSelect={setSelected} />}
      {tab === 'dinners' && <RecipeList items={byCat.dinners} onSelect={setSelected} />}
      {tab === 'snacks' && <RecipeList items={byCat.snacks} onSelect={setSelected} />}
      {tab === 'prep' && <MealPrepGuide onOpenRecipe={setSelected} />}

      {selected && <RecipeModal recipe={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function legacyChip(raw) {
  if (raw === 'smoothies' || raw === 'shakes') return 'shakes';
  if (raw === 'dinners') return 'meals';
  if (raw === 'snacks') return 'snacks';
  if (raw === 'soups') return 'soups';
  if (raw === 'desserts') return 'desserts';
  return null;
}

function SessionWizard({ onOpenRecipe }) {
  const {
    state,
    updateSessionSelection,
    removeSessionSelection,
    setDraftStep,
    setIncludeOptional,
    commitDraftToShopping,
    confirmDraftPrep,
  } = useStore();
  const draft = state.planDraft;
  const recipes = state.recipes || [];

  if (!draft?.selections?.length) {
    return (
      <Card className="space-y-3">
        <h3 className="font-semibold">{PLAN_COPY.sessionTitle}</h3>
        <p className="text-sm text-nc-muted">
          Velg måltider og shakes under Smoothies, Middager eller Småmåltider, og trykk «
          {PLAN_COPY.addToSession}». Da genereres handleliste, beholdere og tilberedningssteg
          automatisk.
        </p>
        <p className="text-xs text-nc-muted">
          Gå til fanene Smoothies / Middager / Småmåltider for å legge til retter.
        </p>
      </Card>
    );
  }

  const computed = draft.computed;

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {[
          { id: 'plan', label: PLAN_COPY.stepPlan },
          { id: 'handle', label: PLAN_COPY.stepHandle },
          { id: 'tilbered', label: PLAN_COPY.stepPrep },
        ].map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setDraftStep(s.id)}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-medium',
              (draft.step || 'plan') === s.id
                ? 'bg-nc-green text-white'
                : 'bg-nc-card border border-nc-border'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {(draft.step || 'plan') === 'plan' && (
        <>
          <label className="flex items-center gap-2 text-sm min-h-[44px]">
            <input
              type="checkbox"
              checked={!!draft.include_optional}
              onChange={(e) => setIncludeOptional(e.target.checked)}
              className="w-5 h-5 accent-nc-green"
            />
            Inkluder valgfrie ingredienser i handlelisten
          </label>
          {draft.selections.map((sel) => (
            <Card key={sel.id} className="space-y-2">
              <div className="flex justify-between gap-2">
                <button
                  type="button"
                  className="text-left font-semibold"
                  onClick={() => {
                    const r = recipes.find((x) => x.id === sel.recipe_id);
                    if (r) onOpenRecipe?.(r);
                  }}
                >
                  {sel.recipe_name}
                </button>
                <button
                  type="button"
                  className="text-xs text-nc-muted underline"
                  onClick={() => removeSessionSelection(sel.id)}
                >
                  Fjern
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-nc-muted">Porsjoner</span>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={sel.portions}
                  onChange={(e) =>
                    updateSessionSelection(sel.id, {
                      portions: Number(e.target.value) || 1,
                    })
                  }
                  className="w-20 min-h-[40px] px-2 rounded-xl border border-nc-border text-sm"
                />
              </div>
            </Card>
          ))}
          <BigButton
            variant="primary"
            className="w-full"
            onClick={() => {
              setDraftStep('handle');
            }}
          >
            Gå til handle
          </BigButton>
        </>
      )}

      {(draft.step || 'plan') === 'handle' && (
        <>
          <p className="text-sm text-nc-muted">
            Estimert ~{formatNOK(computed?.estimate_total_ore || 0)} ·{' '}
            {computed?.shopping_lines?.length || 0} varer å kjøpe
          </p>
          {(computed?.ingredient_needs || []).map((n) => (
            <Card key={n.key} className="py-3 text-sm">
              <p className="font-medium">{n.product_name_nb || n.name_nb}</p>
              <p className="text-xs text-nc-muted">
                Trenger {n.display_needed} · {PLAN_COPY.haveAtHome} {n.display_have} ·{' '}
                {PLAN_COPY.buy} {n.display_buy}
                {n.packs_to_buy > 0 ? ` (${n.packs_to_buy} pk)` : ''}
              </p>
              {n.needed_for?.length > 0 && (
                <p className="text-xs text-nc-blue-dark mt-1">
                  {PLAN_COPY.neededFor(n.needed_for.map((x) => x.recipe_name))}
                </p>
              )}
            </Card>
          ))}
          <BigButton variant="primary" className="w-full" onClick={commitDraftToShopping}>
            {PLAN_COPY.commitShopping}
          </BigButton>
          <BigButton
            variant="secondary"
            className="w-full"
            onClick={() => setDraftStep('tilbered')}
          >
            Videre til tilberedning
          </BigButton>
        </>
      )}

      {(draft.step || 'plan') === 'tilbered' && (
        <>
          {computed?.container_plan?.lines?.length > 0 && (
            <Card className="space-y-2">
              <h3 className="font-medium text-sm">Beholdere for hele økten</h3>
              <ul className="text-sm space-y-1">
                {computed.container_plan.lines.map((l) => (
                  <li key={l.type}>
                    <strong>{l.count}×</strong> {l.label}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <Card className="space-y-2">
            <h3 className="font-medium text-sm">Tilberedningsplan</h3>
            <ol className="text-sm space-y-2 list-decimal list-inside text-nc-ink-soft">
              {(computed?.prep_steps || []).map((s) => (
                <li key={s.n}>{s.text}</li>
              ))}
            </ol>
          </Card>
          <BigButton variant="primary" className="w-full" onClick={confirmDraftPrep}>
            {PLAN_COPY.confirmAll}
          </BigButton>
        </>
      )}
    </div>
  );
}

function RecipeList({ items, onSelect }) {
  return (
    <div className="space-y-2">
      {items.map((r) => (
        <Card
          key={r.id}
          className="flex gap-3 items-start cursor-pointer hover:border-nc-green/40"
          onClick={() => onSelect(r)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(r)}
        >
          <span className="text-3xl">{r.icon || '🍽️'}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold">{r.name}</h3>
              {r.is_generated && <Pill tone="blue">Ny</Pill>}
            </div>
            <p className="text-xs text-nc-muted mt-0.5">
              {r.prep_minutes || 5} min · {r.portion_size_label || 'liten'} ·{' '}
              {DIFFICULTY_LABELS[r.difficulty] || r.difficulty || 'enkel'}
            </p>
            {r.difficult_day_suitable && (
              <Pill tone="peach" className="mt-1">
                Egnet på vanskelige dager
              </Pill>
            )}
          </div>
        </Card>
      ))}
      {items.length === 0 && (
        <Card className="text-sm text-nc-muted">Ingen oppskrifter i denne kategorien ennå.</Card>
      )}
    </div>
  );
}

function ContainerBatchCard({ recipe, portions }) {
  const batch = useMemo(
    () => calculateBatchContainers(recipe, portions),
    [recipe, portions]
  );
  return (
    <div className="rounded-2xl border border-nc-border bg-nc-beige/40 p-3 space-y-2">
      <h3 className="font-medium text-sm">Beholdere til batch ({batch.portions} porsjoner)</h3>
      <p className="text-xs text-nc-muted">{formatBatchContainerSummary(batch)}</p>
      <ul className="text-sm space-y-2">
        {batch.lines.map((line) => (
          <li key={line.type} className="flex gap-2 items-start">
            <span className="font-semibold text-nc-green-dark shrink-0">{line.count}×</span>
            <div>
              <p className="font-medium">{line.label}</p>
              {line.notes && <p className="text-xs text-nc-muted">{line.notes}</p>}
              {line.freezable && (
                <p className="text-xs text-nc-blue-dark">Frysesikker — egnet til fryser</p>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2 pt-1">
        {batch.shake_needed > 0 && (
          <Pill tone="blue">{batch.shake_needed} shakebeholder(e)</Pill>
        )}
        {batch.food_needed > 0 && (
          <Pill tone="green">{batch.food_needed} matbeholder(e)</Pill>
        )}
      </div>
    </div>
  );
}

function RecipeModal({ recipe, onClose }) {
  const { confirmPrep, addToSession } = useStore();
  const [portions, setPortions] = useState(recipe.portions || 1);
  const [storageType, setStorageType] = useState(
    recipe.category === 'smoothie_shake' ? 'fridge' : 'freezer'
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end justify-center p-4" role="dialog">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-4xl">{recipe.icon}</span>
          <div>
            <h2 className="text-xl font-semibold">{recipe.name}</h2>
            <p className="text-sm text-nc-muted">{recipe.description}</p>
            {recipe.is_generated && recipe.generated_from_name && (
              <p className="text-xs text-nc-blue-dark mt-1">
                Auto-generert etter tilberedning av «{recipe.generated_from_name}»
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill tone="green">{recipe.prep_minutes || 5} min forberedelse</Pill>
          <Pill>{TEMP_LABELS[recipe.temperature] || recipe.temperature || 'varm eller kald'}</Pill>
          <Pill tone="blue">
            {ENERGY_LABELS[recipe.energy_density] || recipe.energy_density || 'høy energi'}
          </Pill>
        </div>

        {recipe.suitable_food_notes && (
          <div className="rounded-2xl bg-nc-green/10 border border-nc-green/20 p-3">
            <h3 className="font-medium text-sm mb-1">Egnet mat</h3>
            <p className="text-sm text-nc-ink-soft">{recipe.suitable_food_notes}</p>
          </div>
        )}

        <div>
          <h3 className="font-medium mb-1">Ingredienser</h3>
          <ul className="text-sm space-y-1 text-nc-ink-soft">
            {(recipe.ingredients || []).map((ing, i) => (
              <li key={i}>
                {ing.quantity} {ing.unit} {ing.name}
                {ing.optional ? ' (valgfritt)' : ''}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-medium mb-1">Fremgangsmåte</h3>
          <ol className="text-sm space-y-2 list-decimal list-inside text-nc-ink-soft">
            {(recipe.steps || []).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Planlagte porsjoner i batch</label>
          <input
            type="number"
            min={1}
            max={24}
            value={portions}
            onChange={(e) => setPortions(Number(e.target.value) || 1)}
            className="w-full min-h-[48px] px-3 rounded-xl border border-nc-border text-sm"
          />
        </div>

        <ContainerBatchCard recipe={recipe} portions={portions} />

        <div>
          <p className="text-sm font-medium mb-1">Lagring etter tilberedning</p>
          <div className="flex gap-2">
            {[
              { id: 'fridge', label: 'Kjøleskap' },
              { id: 'freezer', label: 'Fryser' },
              { id: 'ready_now', label: 'Klar nå' },
            ].map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setStorageType(o.id)}
                className={`flex-1 min-h-[44px] rounded-xl text-xs font-medium border ${
                  storageType === o.id
                    ? 'bg-nc-green text-white border-nc-green'
                    : 'border-nc-border bg-nc-card'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {(recipe.make_easier || recipe.make_smaller || recipe.make_richer) && (
          <div className="space-y-1 text-sm">
            {recipe.make_easier && (
              <p>
                <span className="font-medium">Gjør det enklere:</span> {recipe.make_easier}
              </p>
            )}
            {recipe.make_smaller && (
              <p>
                <span className="font-medium">Gjør det mindre:</span> {recipe.make_smaller}
              </p>
            )}
            {recipe.make_richer && (
              <p>
                <span className="font-medium">Gjør det rikere:</span> {recipe.make_richer}
              </p>
            )}
          </div>
        )}
        {recipe.storage_notes && <p className="text-xs text-nc-muted">{recipe.storage_notes}</p>}
        {recipe.reheat_notes && (
          <p className="text-xs text-nc-muted">Oppvarming: {recipe.reheat_notes}</p>
        )}

        <BigButton
          variant="primary"
          className="w-full"
          onClick={() => {
            addToSession(recipe, portions, storageType);
            onClose();
          }}
        >
          {PLAN_COPY.addToSession}
        </BigButton>
        <BigButton
          variant="soft"
          className="w-full"
          onClick={() => {
            confirmPrep({
              recipe,
              portions,
              storageType,
              storageLocation:
                storageType === 'freezer'
                  ? 'Fryser'
                  : storageType === 'ready_now'
                    ? 'Klar nå'
                    : 'Kjøleskap',
            });
            onClose();
          }}
        >
          {PLAN_COPY.prepOnlyThis}
        </BigButton>
        <p className="text-[11px] text-nc-muted text-center">
          Økt: handleliste + beholdere + felles plan. Alene: lagre porsjoner nå og generer én ny
          oppskrift.
        </p>
        <BigButton variant="secondary" className="w-full" onClick={onClose}>
          {COPY.close}
        </BigButton>
      </Card>
    </div>
  );
}

function MealPrepGuide({ onOpenRecipe }) {
  const { state, confirmPrep } = useStore();
  const recipes = state.recipes || [];
  const [recipeId, setRecipeId] = useState(recipes[0]?.id || '');
  const recipe = recipes.find((r) => r.id === recipeId) || recipes[0];
  const [portions, setPortions] = useState(recipe?.portions || 4);
  const [storageType, setStorageType] = useState('freezer');

  const batch = useMemo(
    () => (recipe ? calculateBatchContainers(recipe, portions) : null),
    [recipe, portions]
  );

  const steps = [
    'Velg oppskrift og antall porsjoner.',
    'Sjekk beholderlisten under — finn frem riktig antall og type.',
    'Tilbered maten / blend shakes.',
    'Fyll beholderne, merk med dato, sett i kjøleskap eller fryser.',
    'Trykk «Bekreft tilberedning» — da genereres én ny oppskrift automatisk.',
  ];

  return (
    <div className="space-y-3">
      <Card>
        <h3 className="font-semibold mb-2">Batch-tilberedning med beholdere</h3>
        <p className="text-sm text-nc-muted mb-3">
          Se nøyaktig hvor mange mat- og shakebeholdere du trenger før du starter. Etter hver
          tilberedning legges én ny oppskrift til i biblioteket.
        </p>
        <ol className="space-y-2 mb-4">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="w-7 h-7 rounded-full bg-nc-green/15 text-nc-green-dark text-sm font-semibold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="text-sm pt-1">{s}</span>
            </li>
          ))}
        </ol>

        <label className="text-sm font-medium block mb-1">Oppskrift</label>
        <select
          className="w-full min-h-[48px] px-3 rounded-xl border border-nc-border text-sm mb-3 bg-nc-card"
          value={recipe?.id || ''}
          onChange={(e) => {
            setRecipeId(e.target.value);
            const r = recipes.find((x) => x.id === e.target.value);
            if (r) setPortions(r.portions || 1);
          }}
        >
          {recipes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
              {r.is_generated ? ' (ny)' : ''}
            </option>
          ))}
        </select>

        <label className="text-sm font-medium block mb-1">Antall porsjoner</label>
        <input
          type="number"
          min={1}
          max={24}
          value={portions}
          onChange={(e) => setPortions(Number(e.target.value) || 1)}
          className="w-full min-h-[48px] px-3 rounded-xl border border-nc-border text-sm mb-3"
        />

        {recipe && <ContainerBatchCard recipe={recipe} portions={portions} />}

        <div className="mt-3">
          <p className="text-sm font-medium mb-1">Lagring</p>
          <div className="flex gap-2">
            {[
              { id: 'fridge', label: 'Kjøleskap' },
              { id: 'freezer', label: 'Fryser' },
            ].map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setStorageType(o.id)}
                className={`flex-1 min-h-[44px] rounded-xl text-xs font-medium border ${
                  storageType === o.id
                    ? 'bg-nc-green text-white border-nc-green'
                    : 'border-nc-border'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <BigButton
            variant="primary"
            className="w-full"
            disabled={!recipe}
            onClick={() => {
              if (!recipe) return;
              confirmPrep({
                recipe,
                portions,
                storageType,
                storageLocation: storageType === 'freezer' ? 'Fryser' : 'Kjøleskap',
              });
            }}
          >
            Bekreft tilberedning · +1 ny oppskrift
          </BigButton>
          {recipe && (
            <BigButton variant="secondary" className="w-full" onClick={() => onOpenRecipe?.(recipe)}>
              Åpne oppskriftsdetaljer
            </BigButton>
          )}
        </div>
      </Card>

      {batch && (
        <Card className="bg-nc-blue/15 border-nc-blue/30">
          <p className="text-sm font-medium">Sjekkliste før du starter</p>
          <ul className="text-sm mt-2 space-y-1 text-nc-ink-soft">
            {batch.lines.map((l) => (
              <li key={l.type}>
                ☐ Finn frem {l.count} {l.label.toLowerCase()}
              </li>
            ))}
            <li>☐ Merkepenner / etiketter med dato</li>
            <li>☐ Plass i {storageType === 'freezer' ? 'fryser' : 'kjøleskap'}</li>
          </ul>
        </Card>
      )}
    </div>
  );
}
