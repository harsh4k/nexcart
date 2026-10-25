import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { PRODUCTS } from './data/products';
import { Product } from './types';

function isProduct(value: unknown): value is Omit<Product, 'id'> {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === 'string' &&
    typeof v.price === 'number' &&
    typeof v.category === 'string' &&
    typeof v.image === 'string' &&
    typeof v.description === 'string'
  );
}

const TIMEOUT_MS = 8000;

/**
 * Loads the catalog from the Firestore `products` collection. Falls back to the
 * built-in catalog when the collection is empty, has no valid documents, or
 * Firestore can't be reached within TIMEOUT_MS.
 */
export async function fetchProducts(): Promise<Product[]> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const snapshot = await Promise.race([
      getDocs(collection(db, 'products')),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`timed out after ${TIMEOUT_MS} ms`)), TIMEOUT_MS);
      }),
    ]);
    const products: Product[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (isProduct(data)) {
        const { name, price, category, image, description } = data;
        products.push({ id: doc.id, name, price, category, image, description });
      }
    });
    return products.length > 0 ? products : PRODUCTS;
  } catch (error) {
    console.warn('NexCart: Firestore catalog unavailable, using built-in catalog.', error);
    return PRODUCTS;
  } finally {
    clearTimeout(timer);
  }
}
