import { useCallback, useEffect, useState } from 'react';
import { Product } from '../types';
import { loadSaved, save } from './storage';

const KEY = 'nexcart_wishlist';

export function useWishlist() {
  const [items, setItems] = useState<Product[]>(() => loadSaved<Product>(KEY));

  useEffect(() => save(KEY, items), [items]);

  const toggle = useCallback((product: Product) => {
    setItems(prev => prev.some(item => item.id === product.id)
      ? prev.filter(item => item.id !== product.id)
      : [...prev, product]);
  }, []);

  const remove = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const has = useCallback((id: string) => items.some(item => item.id === id), [items]);

  return { items, toggle, remove, has };
}

export type Wishlist = ReturnType<typeof useWishlist>;
