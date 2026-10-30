import { Product } from './types';

/** Categories in catalog order, without duplicates. */
export function categoriesOf(products: Product[]): string[] {
  return [...new Set(products.map(p => p.category))];
}

/** Case-insensitive match on name, category or description. An empty query matches everything. */
export function matchesQuery(product: Product, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [product.name, product.category, product.description].some(text => text.toLowerCase().includes(q));
}
