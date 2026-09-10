import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** NOK from øre: 12900 → "129,00 kr" */
export function formatNOK(ore) {
  if (ore == null || Number.isNaN(ore)) return '—';
  const n = ore / 100;
  return (
    n.toLocaleString('nb-NO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' kr'
  );
}

/** European date: 26.07.2026 */
export function formatDateEU(date) {
  const d = typeof date === 'string' ? new Date(date + (date.length === 10 ? 'T12:00:00' : '')) : date;
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function addDaysISO(iso, days) {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
