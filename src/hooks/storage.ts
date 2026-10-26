// Reads a saved cart or wishlist. Items saved before product IDs became strings
// can't be matched to the catalog, so they are dropped.
export function loadSaved<T extends { id: string }>(key: string): T[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is T => typeof item?.id === 'string');
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
