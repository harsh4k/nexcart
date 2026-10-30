import { collection, doc, FirestoreError, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { CartItem, Product } from './types';

// Field limits mirror isValidShipping() in firestore.rules.
export const SHIPPING_FIELDS = {
  name: { label: 'Full name', max: 100, autoComplete: 'name' },
  address: { label: 'Street address', max: 200, autoComplete: 'street-address' },
  city: { label: 'City', max: 100, autoComplete: 'address-level2' },
  region: { label: 'State / region', max: 100, autoComplete: 'address-level1' },
  postalCode: { label: 'Postal code', max: 12, autoComplete: 'postal-code' },
} as const;

export type ShippingField = keyof typeof SHIPPING_FIELDS;
export type ShippingDetails = Record<ShippingField, string>;
export type ShippingErrors = Partial<Record<ShippingField, string>>;

export const EMPTY_SHIPPING: ShippingDetails = { name: '', address: '', city: '', region: '', postalCode: '' };

const POSTAL_CODE = /^[A-Za-z0-9][A-Za-z0-9 -]*$/;

const SHIPPING_KEYS = Object.keys(SHIPPING_FIELDS) as ShippingField[];

export function trimShipping(shipping: ShippingDetails): ShippingDetails {
  return Object.fromEntries(SHIPPING_KEYS.map(field => [field, shipping[field].trim()])) as ShippingDetails;
}

/** Returns one message per invalid field; an empty object means the form is valid. */
export function validateShipping(shipping: ShippingDetails): ShippingErrors {
  const errors: ShippingErrors = {};
  const trimmed = trimShipping(shipping);
  for (const field of SHIPPING_KEYS) {
    const { label, max } = SHIPPING_FIELDS[field];
    if (!trimmed[field]) errors[field] = `${label} is required.`;
    else if (trimmed[field].length > max) errors[field] = `${label} must be ${max} characters or fewer.`;
  }
  if (!errors.postalCode && (!POSTAL_CODE.test(trimmed.postalCode) || trimmed.postalCode.length < 3)) {
    errors.postalCode = 'Enter a valid postal code.';
  }
  return errors;
}

export interface OrderLine {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface PricedCart {
  /** Cart lines at the current catalog name and price. */
  lines: (OrderLine & { image: string })[];
  /** Cart items whose product is no longer in the catalog. */
  unavailable: CartItem[];
  itemCount: number;
  total: number;
}

const toCents = (amount: number) => Math.round(amount * 100);

/** Prices the cart against the live catalog, never against prices saved in localStorage. */
export function priceCart(cart: CartItem[], products: Product[]): PricedCart {
  const byId = new Map(products.map(product => [product.id, product]));
  const lines: PricedCart['lines'] = [];
  const unavailable: CartItem[] = [];
  let totalCents = 0;
  let itemCount = 0;

  for (const item of cart) {
    const product = byId.get(item.id);
    if (!product) {
      unavailable.push(item);
      continue;
    }
    lines.push({ id: product.id, name: product.name, image: product.image, price: product.price, quantity: item.quantity });
    totalCents += toCents(product.price) * item.quantity;
    itemCount += item.quantity;
  }

  return { lines, unavailable, itemCount, total: totalCents / 100 };
}

export interface Order {
  id: string;
  items: OrderLine[];
  itemCount: number;
  total: number;
  shipping: ShippingDetails;
  status: 'placed';
  createdAt: Date | null;
}

const ordersOf = (uid: string) => collection(db, 'users', uid, 'orders');

/** A fresh order ID. Reuse it when retrying the same checkout so a retry can never create a second order. */
export const newOrderId = (uid: string) => doc(ordersOf(uid)).id;

const CONFIRM_TIMEOUT_MS = 15_000;

/** Thrown when the server has not confirmed the order in time (usually offline). The write may still land later. */
export class OrderNotConfirmedError extends Error {}

/** Saves a demo order at users/{uid}/orders/{orderId}. No payment is taken. */
export async function placeOrder(uid: string, orderId: string, cart: PricedCart, shipping: ShippingDetails): Promise<void> {
  const ref = doc(ordersOf(uid), orderId);
  const write = setDoc(ref, {
    items: cart.lines.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
    itemCount: cart.itemCount,
    total: cart.total,
    shipping: trimShipping(shipping),
    status: 'placed',
    createdAt: serverTimestamp(),
  });
  // Firestore only resolves a write once the server confirms it, which never happens offline.
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new OrderNotConfirmedError('Order not confirmed in time')), CONFIRM_TIMEOUT_MS);
  });
  try {
    await Promise.race([write, timeout]);
  } catch (error) {
    // Orders are immutable, so retrying an order that already reached the server is rejected
    // as an update. If the order exists, the earlier attempt succeeded.
    if (error instanceof FirestoreError && error.code === 'permission-denied') {
      const existing = await getDoc(ref).catch(() => null);
      if (existing?.exists()) return;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

const isOrderLine = (line: unknown): line is OrderLine => {
  const l = line as Partial<OrderLine> | null;
  return typeof l === 'object' && l !== null && typeof l.id === 'string' && typeof l.name === 'string' &&
    Number.isFinite(l.price) && Number.isFinite(l.quantity);
};

const asText = (value: unknown) => (typeof value === 'string' ? value : '');

/** The signed-in user's orders, newest first. */
export async function fetchOrders(uid: string): Promise<Order[]> {
  const snapshot = await getDocs(query(ordersOf(uid), orderBy('createdAt', 'desc')));
  return snapshot.docs.map(snap => {
    // The rules check the order's overall shape, not each line, so read defensively.
    const data = snap.data();
    const items = Array.isArray(data.items) ? data.items.filter(isOrderLine) : [];
    const shipping = data.shipping ?? {};
    return {
      id: snap.id,
      items,
      itemCount: Number.isFinite(data.itemCount) ? data.itemCount : items.reduce((n, item) => n + item.quantity, 0),
      total: Number.isFinite(data.total) ? data.total : 0,
      shipping: Object.fromEntries(SHIPPING_KEYS.map(field => [field, asText(shipping[field])])) as ShippingDetails,
      status: 'placed',
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
    };
  });
}

/** Short, human-friendly order reference, e.g. NX-7F3A9C2B. */
export const orderRef = (id: string) => `NX-${id.slice(0, 8).toUpperCase()}`;

export const formatPrice = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
