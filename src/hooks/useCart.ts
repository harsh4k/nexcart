import { useCallback, useEffect, useMemo, useState } from 'react';
import { CartItem, Product } from '../types';
import { loadSaved, save } from './storage';

const KEY = 'nexcart_cart';
export const MAX_QUANTITY = 10;

const clamp = (n: number) => Math.min(MAX_QUANTITY, Math.max(1, n));

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => loadSaved<CartItem>(KEY));

  useEffect(() => save(KEY, items), [items]);

  const add = useCallback((product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: clamp(item.quantity + quantity) } : item);
      }
      return [...prev, { ...product, quantity: clamp(quantity) }];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: clamp(item.quantity + delta) } : item,
    ));
  }, []);

  /** Updates name, price and image from the live catalog. Items missing from it are kept for checkout to flag. */
  const syncWithCatalog = useCallback((products: Product[]) => {
    const byId = new Map(products.map(product => [product.id, product]));
    setItems(prev => {
      let changed = false;
      const next = prev.map(item => {
        const product = byId.get(item.id);
        if (!product || (product.price === item.price && product.name === item.name && product.image === item.image)) return item;
        changed = true;
        return { ...item, name: product.name, price: product.price, image: product.image };
      });
      return changed ? next : prev;
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  return { items, add, remove, updateQuantity, syncWithCatalog, clear, total, count };
}

export type Cart = ReturnType<typeof useCart>;
