import { useEffect, useState } from 'react';
import { fetchProducts } from '../catalog';
import { PRODUCTS } from '../data/products';
import { Product } from '../types';

export function useCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // fetchProducts already falls back to the built-in catalog; the catch is a
    // last resort so the full-screen loader can never stay up forever.
    fetchProducts()
      .catch(() => PRODUCTS)
      .then((data) => {
        if (cancelled) return;
        setProducts(data);
        setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { products, isLoading };
}
