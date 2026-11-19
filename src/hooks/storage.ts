import type { Product } from '../types';

export function isSavedProduct(value: unknown): value is Product {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === 'string' && item.id.length > 0 &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' && Number.isFinite(item.price) && item.price >= 0 &&
    typeof item.category === 'string' &&
    typeof item.image === 'string' &&
    typeof item.description === 'string';
}

export function loadSaved<T>(key: string, isItem: (item: unknown) => item is T): T[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isItem);
  } catch {
    return [];
  }
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private mode): the cart still works for this visit.
  }
}
