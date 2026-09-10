/**
 * Backward-compatible re-exports + locale-aware helpers.
 * Prefer useStore().t / createT(locale) for new UI.
 */
import { createT, DEFAULT_LOCALE } from '@/lib/i18n';
import { nb } from '@/lib/i18n/messages/nb.js';
import { en } from '@/lib/i18n/messages/en.js';

const tNb = createT('nb');

export const COPY = {
  appName: 'TastyGain',
  tagline: nb.tagline,
  mealAvailable: nb.mealAvailable,
  readyWhenYouAre: nb.readyWhenYouAre,
  somethingSmall: nb.somethingSmall,
  wouldFeelManageable: nb.wouldFeelManageable,
  skippedWithoutPressure: nb.skippedWithoutPressure,
  tryAnother: nb.tryAnother,
  logged: nb.logged,
  tooMuchToday: nb.tooMuchToday,
  portionUsed: nb.portionUsed,
  undo: nb.undo,
  close: nb.close,
  back: nb.back,
  disclaimer: nb.disclaimer,
  gentleStock: {
    lowDinners: (n) => tNb('stock.lowFreezer', [n]),
    smoothieSoon: tNb('stock.milkSoon'),
    prepBuffer: (n) =>
      n === 1
        ? 'Å lage 1 fryseporsjon i dag vil gjenopprette bufferen.'
        : `Å lage ${n} fryseporsjoner i dag vil gjenopprette bufferen.`,
    readyTomorrow: (n) => tNb('stock.okReady', [n]),
  },
};

export function getCopy(locale) {
  const t = createT(locale);
  return {
    appName: t('appName'),
    tagline: t('tagline'),
    mealAvailable: t('mealAvailable'),
    readyWhenYouAre: t('readyWhenYouAre'),
    somethingSmall: t('somethingSmall'),
    disclaimer: t('disclaimer'),
    undo: t('undo'),
    back: t('back'),
  };
}

export const LOG_STATUSES = Object.entries(nb.logStatuses).map(([id, label]) => ({ id, label }));

export const STATUS_LABELS = { ...nb.statusLabels };

export function statusLabel(id, locale = DEFAULT_LOCALE) {
  const t = createT(locale);
  const key = `statusLabels.${id}`;
  const v = t(key);
  return v === key ? String(id || '').replace(/_/g, ' ') : v;
}

export const PERIODS = Object.entries(nb.periods).map(([id, label]) => ({ id, label }));
export const PERIOD_LABELS = { ...nb.periods };

export const CHAINS = [
  { id: 'rema_1000', label: 'REMA 1000', short: 'REMA' },
  { id: 'kiwi', label: 'KIWI', short: 'KIWI' },
  { id: 'coop', label: 'COOP', short: 'COOP' },
  { id: 'spar', label: 'SPAR', short: 'SPAR' },
  { id: 'bunnpris', label: 'Bunnpris', short: 'BP' },
  { id: 'joker', label: 'Joker', short: 'Joker' },
];

export const SHOP_CATEGORIES = Object.entries(nb.categories).map(([id, label]) => ({ id, label }));

export function shopCategories(locale) {
  const t = createT(locale);
  return Object.keys(nb.categories).map((id) => ({
    id,
    label: t(`categories.${id}`),
  }));
}

export const DIFFICULTY_LABELS = {
  easy: 'enkel',
  medium: 'middels',
  batch: 'større batch',
};

export const TEMP_LABELS = {
  hot: 'varm',
  cold: 'kald',
  either: 'varm eller kald',
  varies: 'varierer',
};

export const ENERGY_LABELS = {
  low: 'lav energi',
  moderate: 'middels energi',
  high: 'høy energi',
};

export const READINESS_OPTS = {
  appetite: {
    label: 'Appetitt',
    options: [
      { id: 'very_low', label: 'veldig lav' },
      { id: 'low', label: 'lav' },
      { id: 'moderate', label: 'moderat' },
      { id: 'good', label: 'god' },
    ],
  },
  nausea: {
    label: 'Kvalme',
    options: [
      { id: 'none', label: 'ingen' },
      { id: 'mild', label: 'mild' },
      { id: 'moderate', label: 'moderat' },
      { id: 'strong', label: 'sterk' },
    ],
  },
  energy: {
    label: 'Energi',
    options: [
      { id: 'very_low', label: 'veldig lav' },
      { id: 'low', label: 'lav' },
      { id: 'moderate', label: 'moderat' },
      { id: 'good', label: 'god' },
    ],
  },
  prefer_hot_cold: {
    label: 'Temperatur',
    options: [
      { id: 'hot', label: 'varm' },
      { id: 'cold', label: 'kald' },
      { id: 'either', label: 'begge deler' },
    ],
  },
  prefer_liquid_solid: {
    label: 'Konsistens',
    options: [
      { id: 'liquid', label: 'flytende' },
      { id: 'solid', label: 'fast' },
      { id: 'either', label: 'begge deler' },
    ],
  },
};

export const CONSENT_LABELS = {
  linked: 'Koblet med samtykke',
  supporter_only: 'Kun støttende person',
  proxy_attested: 'Fullmakt med bekreftelse',
};

export const PLAN_COPY = {
  sessionTitle: nb.plan.sessionTitle,
  sessionTitleDiscreet: nb.plan.sessionTitleDiscreet,
  stepPlan: nb.plan.stepPlan,
  stepHandle: nb.plan.stepHandle,
  stepPrep: nb.plan.stepPrep,
  addToSession: nb.plan.addToSession,
  prepOnlyThis: nb.plan.prepOnlyThis,
  commitShopping: nb.plan.commitShopping,
  confirmAll: nb.plan.confirmAll,
  neededFor: (names) => `Trengs til: ${names.join(', ')}`,
  haveAtHome: nb.plan.haveAtHome,
  buy: nb.plan.buy,
  fromSession: nb.plan.fromSession,
  continueSession: nb.plan.continueSession,
  emptySession: nb.plan.emptySession,
  shoppingUpdated: nb.plan.shoppingUpdated,
  readyToPrep: nb.plan.readyToPrep,
  abandon: nb.plan.abandon,
};

export function planCopy(locale) {
  const t = createT(locale);
  return {
    sessionTitle: t('plan.sessionTitle'),
    sessionTitleDiscreet: t('plan.sessionTitleDiscreet'),
    stepPlan: t('plan.stepPlan'),
    stepHandle: t('plan.stepHandle'),
    stepPrep: t('plan.stepPrep'),
    addToSession: t('plan.addToSession'),
    prepOnlyThis: t('plan.prepOnlyThis'),
    commitShopping: t('plan.commitShopping'),
    confirmAll: t('plan.confirmAll'),
    neededFor: (names) =>
      locale === 'en' ? `Needed for: ${names.join(', ')}` : `Trengs til: ${names.join(', ')}`,
    haveAtHome: t('plan.haveAtHome'),
    buy: t('plan.buy'),
    fromSession: t('plan.fromSession'),
    continueSession: t('plan.continueSession'),
    emptySession: t('plan.emptySession'),
    shoppingUpdated: t('plan.shoppingUpdated'),
    readyToPrep: t('plan.readyToPrep'),
    abandon: t('plan.abandon'),
  };
}

export const EASY_FOOD_OPTIONS = [
  { id: 'cake', label: 'kake' },
  { id: 'candy', label: 'godteri' },
  { id: 'sweet', label: 'søtt' },
  { id: 'salty', label: 'salt' },
  { id: 'chocolate', label: 'sjokolade' },
  { id: 'chips', label: 'chips' },
  { id: 'shakes', label: 'shakes' },
  { id: 'cheese', label: 'ost' },
];

export const FLAVOR_OPTIONS = [
  { id: 'sweet', labelNb: 'Søtt', labelEn: 'Sweet' },
  { id: 'salty', labelNb: 'Salt', labelEn: 'Salty' },
  { id: 'cake', labelNb: 'Kake', labelEn: 'Cake' },
  { id: 'candy', labelNb: 'Godteri', labelEn: 'Candy' },
];

export { createT, nb, en };
