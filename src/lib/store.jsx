import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { buildEmptyState, enrichRecipe, enrichRecipes, STORE_PRODUCTS } from '@/data/seed';
import { generateRecipeFromUse } from '@/lib/recipeGenerator';
import { calculateBatchContainers, formatBatchContainerSummary } from '@/lib/containers';
import {
  createEmptyDraft,
  recomputePlan,
  mergeShoppingCommit,
} from '@/lib/planEngine';
import { PLAN_COPY } from '@/lib/copy';
import { createT, applyDocumentLang, normalizeLocale } from '@/lib/i18n';
import { priceFor, resolveChainOrder } from '@/lib/storeCatalogue';
import { migrateInventoryZones, zoneForCategory, locationLabelForZone } from '@/lib/inventoryZones';
import { evaluateStock, alertToText } from '@/lib/stockEngine';
import { formatNOK, todayISO, uid } from '@/lib/utils';
import { base44 } from '@/api/base44Client';

// Bump key to drop any previously stored fictional demo data
const STORAGE_KEY = 'tastygain_state_v1';
const LEGACY_KEYS = [
  'nourishcare_state_v1',
  'nourishcare_state_v2_nb',
  'nourishcare_state_v3_empty',
];

const DEFAULT_FLAGS = {
  i18nEn: true,
  idelliciousUi: true,
  storeSelector: true,
  stockEngineV2: true,
  mealCategoriesV2: true,
  mealPhotos: true,
};

const StoreCtx = createContext(null);

function mergeRecipes(existing, system) {
  const byId = new Map();
  for (const r of system || []) byId.set(r.id, r);
  for (const r of existing || []) {
    if (!r?.id) continue;
    if (r.is_system === false || String(r.id).startsWith('gen_') || !byId.has(r.id)) {
      byId.set(r.id, enrichRecipe(r));
    }
  }
  return enrichRecipes(Array.from(byId.values()));
}

function softMigrate(parsed) {
  if (!parsed || typeof parsed !== 'object') return buildEmptyState();
  const empty = buildEmptyState();
  const locale = normalizeLocale(parsed.locale || parsed.household?.locale || 'nb');
  const household = {
    ...empty.household,
    ...(parsed.household || {}),
    primary_chain:
      parsed.household?.primary_chain ||
      parsed.household?.preferred_chains?.[0] ||
      'kiwi',
    flavor_prefs: parsed.household?.flavor_prefs || empty.household.flavor_prefs,
    show_protein: parsed.household?.show_protein !== false,
    goal: parsed.household?.goal || 'muscle_gain',
    target_eating_events: parsed.household?.target_eating_events || 6,
    flags: { ...DEFAULT_FLAGS, ...(parsed.household?.flags || {}) },
    locale,
  };
  return {
    ...empty,
    ...parsed,
    locale,
    household,
    // Always refresh system catalogue + recipe media; keep user-generated recipes by id merge
    recipes: mergeRecipes(parsed.recipes, empty.recipes),
    storeProducts: STORE_PRODUCTS,
    inventory: migrateInventoryZones(parsed.inventory || []),
    prepared: parsed.prepared || [],
    shopping: parsed.shopping || [],
    plan: parsed.plan || [],
    logs: parsed.logs || [],
    reminders: parsed.reminders || [],
    recipePreferences: parsed.recipePreferences || {},
  };
}

function loadState() {
  try {
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return softMigrate(JSON.parse(raw));
    }
  } catch {
    /* ignore */
  }
  return buildEmptyState();
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(loadState);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [toast, setToast] = useState(null);
  const [undoStack, setUndoStack] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    applyDocumentLang(state.locale || 'nb');
    if (typeof document !== 'undefined') {
      const emerald = state.household?.flags?.idelliciousUi !== false;
      document.documentElement.dataset.ncTheme = emerald ? 'emerald' : 'classic';
    }
  }, [state.locale, state.household?.flags?.idelliciousUi]);

  useEffect(() => {
    if (import.meta.env.VITE_OFFLINE_STACK === 'true') {
      setAuthChecked(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (!cancelled) setUser(me || null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const locale = normalizeLocale(state.locale || 'nb');
  const t = useMemo(() => createT(locale), [locale]);

  const setLocale = useCallback((nextLocale) => {
    const next = normalizeLocale(nextLocale);
    setState((prev) => ({
      ...prev,
      locale: next,
      household: { ...prev.household, locale: next },
    }));
    applyDocumentLang(next);
  }, []);

  const showToast = useCallback((message, ms = 2800) => {
    setToast(message);
    setTimeout(() => setToast(null), ms);
  }, []);

  const update = useCallback((patcher) => {
    setState((prev) => {
      const next = typeof patcher === 'function' ? patcher(prev) : { ...prev, ...patcher };
      return next;
    });
  }, []);

  const recomputeDraftIn = useCallback((draft, prev) => {
    if (!draft || !(draft.selections || []).length) {
      return draft ? { ...draft, computed: null, updated_at: new Date().toISOString() } : null;
    }
    const computed = recomputePlan(draft, {
      recipes: prev.recipes,
      inventory: prev.inventory,
      storeProducts: prev.storeProducts,
      household: prev.household,
    });
    return {
      ...draft,
      computed,
      updated_at: new Date().toISOString(),
      status:
        draft.status === 'completed' || draft.status === 'abandoned'
          ? draft.status
          : draft.step === 'tilbered'
            ? 'ready_to_prep'
            : draft.step === 'handle'
              ? 'shopping'
              : 'planning',
    };
  }, []);

  const metrics = useMemo(() => {
    const prepared = state.prepared || [];
    const freezer = prepared
      .filter((p) => p.storage_type === 'freezer')
      .reduce((s, p) => s + (p.portions_remaining || 0), 0);
    const fridge = prepared
      .filter((p) => p.storage_type === 'fridge' || p.storage_type === 'ready_now')
      .reduce((s, p) => s + (p.portions_remaining || 0), 0);
    const ready = prepared.reduce((s, p) => s + (p.portions_remaining || 0), 0);
    const shoppingOpen = (state.shopping || []).filter((s) => !s.checked).length;
    const expiringSoon = prepared.filter((p) => {
      if (!p.expiry_date) return false;
      const days = (new Date(p.expiry_date) - new Date(todayISO())) / 86400000;
      return days <= 2 && days >= 0 && p.portions_remaining > 0;
    }).length;
    const tomorrow = (state.plan || []).filter((p) => p.date === addDays(todayISO(), 1)).length;
    const daysCoverage = ready >= 3 ? Math.max(1, Math.floor(ready / 3)) : ready > 0 ? 1 : 0;
    return { freezer, fridge, ready, shoppingOpen, expiringSoon, tomorrow, daysCoverage };
  }, [state.prepared, state.shopping, state.plan]);

  const stockEval = useMemo(() => {
    if (state.household?.flags?.stockEngineV2 === false) {
      return { metrics: {}, alerts: [] };
    }
    return evaluateStock({
      prepared: state.prepared,
      inventory: state.inventory,
      household: state.household,
      storeProducts: state.storeProducts,
    });
  }, [state.prepared, state.inventory, state.household, state.storeProducts]);

  const stockAlerts = useMemo(() => {
    return (stockEval.alerts || []).map((a) => ({
      ...a,
      text: alertToText(a, t),
    }));
  }, [stockEval.alerts, t]);

  const gentleAlerts = useMemo(() => {
    if (state.household?.flags?.stockEngineV2 !== false) {
      return stockAlerts;
    }
    // Legacy path
    const alerts = [];
    const hh = state.household;
    if (metrics.freezer < (hh.min_freezer_meals || 6)) {
      alerts.push({
        id: 'low_freezer',
        text: t('stock.lowFreezer', [metrics.freezer]),
        action: 'prep',
      });
    }
    if (metrics.fridge < 2) {
      alerts.push({
        id: 'low_fridge_prepared',
        text: t('stock.lowFridgePrepared'),
        action: 'kitchen',
      });
    }
    return alerts;
  }, [metrics, state.household, stockAlerts, t]);

  /**
   * Bekreft batch-tilberedning: lagre porsjoner + generer automatisk 1 ny oppskrift.
   */
  const confirmPrep = useCallback(
    ({ recipe, portions, storageType = 'fridge', storageLocation = 'Kjøleskap' }) => {
      if (!recipe) return null;
      const n = Math.max(1, Number(portions) || recipe.portions || 1);
      const batch = calculateBatchContainers(recipe, n);
      const today = todayISO();
      const fridgeDays = recipe.fridge_days ?? (storageType === 'freezer' ? 0 : 3);
      const freezerDays = recipe.freezer_days ?? (storageType === 'freezer' ? 45 : 0);
      const expiryDays = storageType === 'freezer' ? freezerDays || 45 : fridgeDays || 3;
      const expiry = new Date(today + 'T12:00:00');
      expiry.setDate(expiry.getDate() + expiryDays);
      const expiry_date = expiry.toISOString().slice(0, 10);

      let generated = null;
      update((prev) => {
        generated = enrichRecipe(
          generateRecipeFromUse(recipe, prev.recipes, prev.household.id)
        );
        const preparedRow = {
          id: uid('pm'),
          household_id: prev.household.id,
          recipe_id: recipe.id,
          name: recipe.name,
          portions_prepared: n,
          portions_remaining: n,
          storage_location: storageLocation,
          storage_type: storageType,
          prepared_date: today,
          expiry_date,
          portion_size_label: recipe.portion_size_label || 'liten',
          reheat_notes: recipe.reheat_notes || '',
          prepared_by: 'Deg',
          containers_summary: formatBatchContainerSummary(batch),
          container_lines: batch.lines,
        };
        return {
          ...prev,
          prepared: [preparedRow, ...(prev.prepared || [])],
          recipes: [generated, ...(prev.recipes || [])],
        };
      });

      showToast(
        generated
          ? `Tilberedt · ${formatBatchContainerSummary(batch)}. Ny oppskrift: ${generated.name}`
          : `Tilberedt · ${formatBatchContainerSummary(batch)}`
      );
      return { batch, generated };
    },
    [update, showToast]
  );

  const usePortion = useCallback(
    (preparedId) => {
      let snapshot = null;
      let generated = null;
      update((prev) => {
        const prepared = prev.prepared.map((p) => {
          if (p.id !== preparedId) return p;
          snapshot = { ...p };
          return { ...p, portions_remaining: Math.max(0, (p.portions_remaining || 0) - 1) };
        });
        // Automatikk: når en porsjon fra en tilberedt rett brukes første gang fra full batch,
        // generer ikke ekstra her — generering skjer ved tilberedning. (Ett nytt per prep.)
        return { ...prev, prepared };
      });
      if (snapshot) {
        setUndoStack({ type: 'portion', preparedId, previous: snapshot.portions_remaining });
        showToast('Porsjon brukt · angre er tilgjengelig');
      }
      return generated;
    },
    [update, showToast]
  );

  const undoLast = useCallback(() => {
    if (!undoStack) return;
    if (undoStack.type === 'portion') {
      update((prev) => ({
        ...prev,
        prepared: prev.prepared.map((p) =>
          p.id === undoStack.preparedId
            ? { ...p, portions_remaining: undoStack.previous }
            : p
        ),
      }));
      showToast('Angret');
    }
    setUndoStack(null);
  }, [undoStack, update, showToast]);

  const logFood = useCallback(
    (entry) => {
      const row = {
        id: uid('log'),
        household_id: state.household.id,
        logged_at: new Date().toISOString(),
        ...entry,
      };
      update((prev) => ({ ...prev, logs: [row, ...(prev.logs || [])] }));
      showToast('Loggført');
      return row;
    },
    [state.household.id, update, showToast]
  );

  const updatePlanStatus = useCallback(
    (planId, status) => {
      update((prev) => ({
        ...prev,
        plan: prev.plan.map((p) => (p.id === planId ? { ...p, status } : p)),
      }));
      showToast(status === 'skipped_without_pressure' ? 'Hoppet over uten press' : 'Oppdatert');
    },
    [update, showToast]
  );

  /** Add a recipe to the week plan for a given date */
  const addPlanMeal = useCallback(
    (date, recipe, period = 'dinner') => {
      if (!recipe || !date) return null;
      const row = {
        id: uid('plan'),
        household_id: state.household.id,
        date,
        period,
        recipe_id: recipe.id,
        recipe_name: recipe.name_nb || recipe.name,
        portion_label: recipe.portion_size_label || 'liten',
        prep_minutes: (recipe.prep_minutes || 0) + (recipe.cook_minutes || 0) || 5,
        is_optional: false,
        is_prepared: false,
        status: 'planned',
        category: recipe.category,
      };
      update((prev) => ({
        ...prev,
        plan: [...(prev.plan || []), row].sort((a, b) =>
          a.date === b.date
            ? String(a.period).localeCompare(String(b.period))
            : a.date.localeCompare(b.date)
        ),
      }));
      showToast(locale === 'en' ? 'Added to plan' : 'Lagt til i planen');
      return row;
    },
    [state.household.id, update, showToast, locale]
  );

  const removePlanMeal = useCallback(
    (planId) => {
      update((prev) => ({
        ...prev,
        plan: (prev.plan || []).filter((p) => p.id !== planId),
      }));
      showToast(locale === 'en' ? 'Removed from plan' : 'Fjernet fra planen');
    },
    [update, showToast, locale]
  );

  /**
   * Like: keep recipe, generate a new recipe in same category.
   * Dislike: remove recipe from library (and plan), generate a replacement in same category.
   */
  const rateRecipe = useCallback(
    (recipeOrId, preference, { planEntryId } = {}) => {
      const recipeId = typeof recipeOrId === 'string' ? recipeOrId : recipeOrId?.id;
      update((prev) => {
        const source =
          (typeof recipeOrId === 'object' && recipeOrId) ||
          (prev.recipes || []).find((r) => r.id === recipeId);
        if (!source) return prev;

        const prefs = { ...(prev.recipePreferences || {}) };
        prefs[source.id] = preference;

        let recipes = [...(prev.recipes || [])];
        let plan = [...(prev.plan || [])];

        if (preference === 'disliked') {
          // Remove from library unless system seed (hide via preference only for system)
          if (source.is_system === false || source.is_generated) {
            recipes = recipes.filter((r) => r.id !== source.id);
          }
          plan = plan.filter((p) => p.recipe_id !== source.id);
          if (planEntryId) {
            plan = plan.filter((p) => p.id !== planEntryId);
          }
        } else if (preference === 'liked' && planEntryId) {
          // Keep plan entry; mark preference only
        }

        const generated = enrichRecipe(
          generateRecipeFromUse(source, recipes, prev.household.id)
        );
        recipes = [generated, ...recipes];

        return {
          ...prev,
          recipes,
          plan,
          recipePreferences: prefs,
        };
      });

      if (preference === 'liked') {
        showToast(
          locale === 'en'
            ? 'Liked — new similar recipe added'
            : 'Likt — ny oppskrift i samme kategori lagt til'
        );
      } else {
        showToast(
          locale === 'en'
            ? 'Removed — new recipe in same category'
            : 'Fjernet — ny oppskrift i samme kategori'
        );
      }
    },
    [update, showToast, locale]
  );

  const toggleShop = useCallback(
    (id) => {
      update((prev) => {
        const shopping = prev.shopping.map((s) => {
          if (s.id !== id) return s;
          const checked = !s.checked;
          return { ...s, checked };
        });
        const item = shopping.find((s) => s.id === id);
        let inventory = prev.inventory;
        if (item?.checked) {
          // Only numeric pack quantities update inventory automatically
          const qtyNum = Number(String(item.quantity).replace(',', '.'));
          const canInventory =
            Number.isFinite(qtyNum) &&
            qtyNum > 0 &&
            (item.unit === 'pk' || item.unit === 'stk' || item.store_product_key);
          if (canInventory) {
            const existing = inventory.find(
              (i) => i.store_product_key && i.store_product_key === item.store_product_key
            );
            if (existing) {
              inventory = inventory.map((i) =>
                i.id === existing.id
                  ? { ...i, quantity: (i.quantity || 0) + qtyNum }
                  : i
              );
            } else {
              const zone = zoneForCategory(item.category);
              inventory = [
                ...inventory,
                {
                  id: uid('inv'),
                  household_id: prev.household.id,
                  name: item.name_nb || item.name,
                  category: item.category,
                  quantity: qtyNum,
                  unit: item.unit === 'pk' ? 'stk' : item.unit || 'stk',
                  location_zone: zone,
                  location: locationLabelForZone(zone, 'nb'),
                  store_product_key: item.store_product_key,
                  preferred_chain: item.preferred_chain,
                  minimum_stock: 1,
                  restock_enabled: true,
                  is_essential: !!item.is_essential,
                },
              ];
            }
            showToast(t('toast.kitchenAdded', [item.name_nb || item.name]));
          } else {
            showToast(t('toast.markedBought', [item.name_nb || item.name]));
          }
        }
        let planDraft = prev.planDraft;
        // Refresh draft nets when inventory/shopping changes (review lifecycle fix)
        if (planDraft?.selections?.length) {
          planDraft = recomputeDraftIn(planDraft, { ...prev, shopping, inventory });
        }
        return { ...prev, shopping, inventory, planDraft };
      });
    },
    [update, showToast, recomputeDraftIn, t]
  );

  const addShoppingFromCatalogue = useCallback(
    (product, chain) => {
      const chainId = chain || resolveChainOrder(state.household)[0];
      const price = priceFor(product, {
        ...state.household,
        primary_chain: chainId,
      });
      const row = {
        id: uid('shop'),
        household_id: state.household.id,
        name: product.name_nb || product.name_en,
        name_nb: product.name_nb,
        quantity: '1',
        unit: product.unit || 'stk',
        category: product.category,
        checked: false,
        estimated_price_ore: price?.price_ore,
        preferred_chain: chainId,
        store_product_key: product.essential_key,
        is_essential: !!product.is_essential_seed,
      };
      update((prev) => {
        const exists = prev.shopping.some(
          (s) => !s.checked && s.store_product_key === product.essential_key
        );
        if (exists) {
          showToast(t('toast.alreadyOnList'));
          return prev;
        }
        showToast(t('toast.addedShop'));
        return { ...prev, shopping: [row, ...prev.shopping] };
      });
    },
    [state.household, update, showToast, t]
  );

  const restockEssentials = useCallback(() => {
    const preferred = resolveChainOrder(state.household)[0];
    let added = 0;
    update((prev) => {
      let shopping = [...prev.shopping];
      for (const product of prev.storeProducts || []) {
        if (!product.is_essential_seed) continue;
        const onList = shopping.some((s) => !s.checked && s.store_product_key === product.essential_key);
        if (onList) continue;
        const price = priceFor(product, prev.household);
        shopping.unshift({
          id: uid('shop'),
          household_id: prev.household.id,
          name: product.name_nb || product.name_en,
          name_nb: product.name_nb,
          quantity: '1',
          unit: product.unit || 'stk',
          category: product.category,
          checked: false,
          estimated_price_ore: price?.price_ore,
          preferred_chain: preferred,
          store_product_key: product.essential_key,
          is_essential: true,
          automatic_reason: 'Nødvendig påfyll',
        });
        added += 1;
      }
      return { ...prev, shopping };
    });
    showToast(t('toast.restocked', [added]));
  }, [state.household, update, showToast, t]);

  const resetDemo = useCallback(() => {
    const empty = buildEmptyState();
    setState(empty);
    showToast('All data er tømt');
  }, [showToast]);

  const completeOnboarding = useCallback(
    (answers) => {
      update((prev) => ({
        ...prev,
        household: {
          ...prev.household,
          ...answers.household,
          onboarding_complete: true,
        },
        profile: { ...prev.profile, ...answers.profile },
      }));
      showToast(t('toast.welcome'));
    },
    [update, showToast, t]
  );

  const shoppingTotalOre = useMemo(
    () =>
      (state.shopping || [])
        .filter((s) => !s.checked)
        .reduce((sum, s) => sum + (s.estimated_price_ore || 0) * Number(s.quantity || 1), 0),
    [state.shopping]
  );

  const ensureDraft = useCallback(() => {
    let draftId = null;
    update((prev) => {
      if (prev.planDraft?.selections) {
        draftId = prev.planDraft.id;
        return prev;
      }
      const d = createEmptyDraft(prev.household.id);
      draftId = d.id;
      return { ...prev, planDraft: d };
    });
    return draftId;
  }, [update]);

  const addToSession = useCallback(
    (recipe, portions, storageType = 'fridge') => {
      if (!recipe) return;
      update((prev) => {
        let draft = prev.planDraft || createEmptyDraft(prev.household.id);
        const n = Math.max(1, Number(portions) || recipe.portions || 1);
        const existing = (draft.selections || []).find((s) => s.recipe_id === recipe.id);
        let selections;
        if (existing) {
          selections = draft.selections.map((s) =>
            s.recipe_id === recipe.id ? { ...s, portions: s.portions + n } : s
          );
        } else {
          selections = [
            ...(draft.selections || []),
            {
              id: uid('sel'),
              recipe_id: recipe.id,
              recipe_name: recipe.name,
              category: recipe.category,
              portions: n,
              storage_type: storageType,
              storage_location:
                storageType === 'freezer'
                  ? 'Fryser'
                  : storageType === 'ready_now'
                    ? 'Klar nå'
                    : 'Kjøleskap',
            },
          ];
        }
        draft = recomputeDraftIn({ ...draft, selections, step: 'plan' }, prev);
        return { ...prev, planDraft: draft };
      });
      showToast(PLAN_COPY.addToSession);
    },
    [update, showToast, recomputeDraftIn]
  );

  const updateSessionSelection = useCallback(
    (selectionId, patch) => {
      update((prev) => {
        if (!prev.planDraft) return prev;
        const selections = prev.planDraft.selections.map((s) =>
          s.id === selectionId ? { ...s, ...patch } : s
        );
        return {
          ...prev,
          planDraft: recomputeDraftIn({ ...prev.planDraft, selections }, prev),
        };
      });
    },
    [update, recomputeDraftIn]
  );

  const removeSessionSelection = useCallback(
    (selectionId) => {
      update((prev) => {
        if (!prev.planDraft) return prev;
        const selections = prev.planDraft.selections.filter((s) => s.id !== selectionId);
        if (!selections.length) {
          return { ...prev, planDraft: null };
        }
        return {
          ...prev,
          planDraft: recomputeDraftIn({ ...prev.planDraft, selections }, prev),
        };
      });
    },
    [update, recomputeDraftIn]
  );

  const setDraftStep = useCallback(
    (step) => {
      update((prev) => {
        if (!prev.planDraft) return prev;
        return {
          ...prev,
          planDraft: recomputeDraftIn({ ...prev.planDraft, step }, prev),
        };
      });
    },
    [update, recomputeDraftIn]
  );

  const setIncludeOptional = useCallback(
    (include_optional) => {
      update((prev) => {
        if (!prev.planDraft) return prev;
        return {
          ...prev,
          planDraft: recomputeDraftIn({ ...prev.planDraft, include_optional }, prev),
        };
      });
    },
    [update, recomputeDraftIn]
  );

  const commitDraftToShopping = useCallback(() => {
    update((prev) => {
      if (!prev.planDraft?.computed?.shopping_lines?.length) {
        return prev;
      }
      const { shopping, committed_ids } = mergeShoppingCommit(
        prev.shopping,
        prev.planDraft.computed.shopping_lines,
        prev.planDraft.id,
        prev.household.id
      );
      return {
        ...prev,
        shopping,
        planDraft: {
          ...prev.planDraft,
          step: 'handle',
          status: 'shopping',
          committed_shopping_ids: committed_ids,
          updated_at: new Date().toISOString(),
        },
      };
    });
    showToast(PLAN_COPY.shoppingUpdated);
  }, [update, showToast]);

  const confirmDraftPrep = useCallback(() => {
    update((prev) => {
      const draft = prev.planDraft;
      if (!draft?.selections?.length) return prev;
      let next = { ...prev, recipes: [...(prev.recipes || [])], prepared: [...(prev.prepared || [])] };
      const completed = [];
      for (const sel of draft.selections) {
        const recipe = next.recipes.find((r) => r.id === sel.recipe_id);
        if (!recipe) continue;
        const n = Math.max(1, Number(sel.portions) || recipe.portions || 1);
        const batch = calculateBatchContainers(recipe, n);
        const today = todayISO();
        const fridgeDays = recipe.fridge_days ?? 3;
        const freezerDays = recipe.freezer_days ?? 45;
        const expiryDays =
          (sel.storage_type || 'fridge') === 'freezer' ? freezerDays || 45 : fridgeDays || 3;
        const expiry = new Date(today + 'T12:00:00');
        expiry.setDate(expiry.getDate() + expiryDays);
        const generated = enrichRecipe(
          generateRecipeFromUse(recipe, next.recipes, next.household.id)
        );
        next.recipes = [generated, ...next.recipes];
        next.prepared = [
          {
            id: uid('pm'),
            household_id: next.household.id,
            recipe_id: recipe.id,
            name: recipe.name,
            portions_prepared: n,
            portions_remaining: n,
            storage_location: sel.storage_location || 'Kjøleskap',
            storage_type: sel.storage_type || 'fridge',
            prepared_date: today,
            expiry_date: expiry.toISOString().slice(0, 10),
            portion_size_label: recipe.portion_size_label || 'liten',
            reheat_notes: recipe.reheat_notes || '',
            prepared_by: 'Deg',
            containers_summary: formatBatchContainerSummary(batch),
            container_lines: batch.lines,
            session_id: draft.id,
          },
          ...next.prepared,
        ];
        completed.push(recipe.id);
      }
      next.planDraft = {
        ...draft,
        status: 'completed',
        step: 'tilbered',
        completed_prep_ids: completed,
        updated_at: new Date().toISOString(),
      };
      return next;
    });
    showToast('Økt tilberedt · porsjoner lagret · nye oppskrifter lagt til');
  }, [update, showToast]);

  const abandonDraft = useCallback(() => {
    update((prev) => ({ ...prev, planDraft: null }));
    showToast(PLAN_COPY.abandon);
  }, [update, showToast]);

  const clearCompletedDraft = useCallback(() => {
    update((prev) => ({ ...prev, planDraft: null }));
  }, [update]);

  const value = {
    state,
    update,
    user,
    authChecked,
    locale,
    t,
    setLocale,
    metrics: {
      ...metrics,
      cupboardOk: stockEval.metrics?.cupboardOk,
    },
    stockEval,
    stockAlerts,
    gentleAlerts,
    toast,
    showToast,
    undoStack,
    undoLast,
    usePortion,
    confirmPrep,
    logFood,
    updatePlanStatus,
    addPlanMeal,
    removePlanMeal,
    rateRecipe,
    toggleShop,
    addShoppingFromCatalogue,
    restockEssentials,
    resetDemo,
    completeOnboarding,
    shoppingTotalOre,
    formatNOK,
    // symbiotic session
    ensureDraft,
    addToSession,
    updateSessionSelection,
    removeSessionSelection,
    setDraftStep,
    setIncludeOptional,
    commitDraftToShopping,
    confirmDraftPrep,
    abandonDraft,
    clearCompletedDraft,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

function addDays(iso, n) {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore utenfor provider');
  return ctx;
}
