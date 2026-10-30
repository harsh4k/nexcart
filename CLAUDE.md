# NexCart — Project Context

> Global rules in `~/.claude/CLAUDE.md` still apply. This file holds only what is specific to NexCart.

## What this is

NexCart is a portfolio-grade e-commerce storefront: a small, curated tech catalog (audio, wearables,
home) presented as an immersive, scroll-driven shopping experience. Users browse, search, save to a
wishlist, add to cart, sign in with Google and place (demo) orders.

It started as a Google AI Studio export and was left unfinished. The goal now is a store that works end to
end, looks and feels premium, and is honest: no fabricated data on screen, no fake payments.

| What | Where |
|---|---|
| Repo | https://github.com/harsh4k/nexcart |
| Live | https://nexcart-v1.vercel.app/ (Vercel) |
| Audit + plan | "NexCart audit and completion plan" (Claude Doc, 2026-10-25) |

## Stack

- **Frontend:** React 19, Vite 6, TypeScript 5.8, React Router 7, Tailwind CSS 4 (configured in
  `src/index.css` via `@theme`, no `tailwind.config`), `motion` for animation, `lenis` for smooth scroll,
  `lucide-react` icons.
- **Backend: Firebase only** (decided 2026-10-25). No server of our own.
  - Auth: Google sign-in.
  - Firestore: `products/{id}` (public read, console/Admin-only writes) and `users/{uid}` (owner only).
    Demo orders live in `users/{uid}/orders` (owner create/read, immutable, `createdAt` = server time).
    Checkout needs sign-in; no payment is taken.
  - Storage: `profiles/{uid}` avatars.
  - Rules: `firestore.rules`, `storage.rules` (deploy with the Firebase CLI via `firebase.json`).
    `firebase.json` targets the AI Studio project's named Firestore database; switch it to `(default)`
    if the app moves to a fresh Firebase project.
- **Catalog:** `src/catalog.ts` reads Firestore `products`; if the collection is empty, invalid or
  unreachable (8 s timeout) it falls back to the built-in `src/data/products.ts`, which is also the seed data.
- **Config:** `VITE_FIREBASE_*` env vars (`.env.example`), all or none. When `VITE_FIREBASE_PROJECT_ID`
  is unset, `firebase-applet-config.json` (the original AI Studio project) is used as a whole.
- **Deploy:** Vercel, static SPA (`vercel.json` rewrites every path to `index.html`).

## Layout

```
src/App.tsx            Router and wiring: calls the hooks, picks the open drawer, passes props to routes
src/hooks/             useCart, useWishlist (localStorage via storage.ts), useAuthUser, useCatalog
src/pages/             One file per route: Home, Product (/products/:id), Stories, StoryDetail, About, Film,
                       Checkout, Profile, HelpDesk
src/components/        Navbar, Footer, Overlay (side drawer), ScrollHub, LoadingScreen, SmoothScroll, FeedbackWidget
src/components/drawers/ Cart, Wishlist, Account and Search drawers (all built on Overlay)
src/components/checkout/ ShippingForm and OrderSummary for /checkout
src/components/Toast.tsx ToastProvider + useToast(); use it instead of alert()
src/productFilters.ts  categoriesOf() and matchesQuery(), shared by the catalog filter and search
src/orders.ts          Shipping validation, priceCart() against the catalog, placeOrder()/fetchOrders()
src/data/products.ts   Built-in catalog / Firestore seed (IDs are slugs)
src/data/stories.ts    Editorial content for /stories
src/catalog.ts         fetchProducts(): Firestore with built-in fallback
src/avatar.ts          Client-side check that mirrors storage.rules for avatars
src/types.ts           Product, CartItem, Story, UserProfile
src/firebase.ts        Firebase app, auth, db, storage
firestore.rules        Firestore security rules
storage.rules          Storage security rules
```

## Commands

```bash
npm install
npm run dev        # Vite on http://localhost:3000 (built-in catalog if Firestore has none)
npm run lint       # currently tsc --noEmit (typecheck only)
npm run build      # vite build -> dist/
npm run preview
```

Env vars are documented in `.env.example`. Never commit `.env`.

## Conventions

- Match the existing visual language: monochrome (black/white/gray), Inter, large tight-tracked headings,
  rounded cards (`rounded-3xl`/`rounded-[2.5rem]`), generous whitespace. Refine it; don't replace it.
- Tailwind utilities in JSX; shared values (colors, radii, fonts) belong in `@theme` in `src/index.css`.
- Pages are lazy-loaded in `App.tsx`; keep new routes lazy.
- Catalog links: `/products/:id` for a product, `/#shop` for the catalog, `/?category=<name>#shop` for a
  filtered catalog. Home scrolls to the catalog when the hash is `#shop`.
- Cart quantities are capped at `MAX_QUANTITY` (10) inside `useCart`. Cart prices are synced to the live
  catalog (`syncWithCatalog`); orders are always priced with `priceCart()`, never from localStorage.
- User-facing messages go through `useToast()`, never `alert()`.
- Reuse `Overlay` for drawers and existing types from `src/types.ts`; don't add parallel ones.
- Every interactive element needs a visible label (or `aria-label`), a `:focus-visible` state, and must be
  a real `<button>`/`<a>`. Respect `prefers-reduced-motion`.
- Check every UI change in the browser at desktop (1440px) and mobile (390px) widths.

## Hard rules

- **No fabricated data on screen.** Orders, addresses, counts and payment methods come from real state or
  are not shown.
- **Never collect real card numbers.** Checkout is a clearly labelled demo unless a real payment provider
  is added deliberately.
- No secrets in the repo. Firebase web config is public by design but belongs in `VITE_` env vars;
  server-only keys never get a `VITE_` prefix or a Vite `define`.
- No new dependency without asking first.
- Work lands through focused PRs on feature branches. Never push to `main`.

## Roadmap

Ordered PRs from the 2026-10-25 audit:

1. Foundation: fix lockfile, patch vulnerable deps, drop unused deps, ESLint + Vitest, GitHub Actions CI.
2. Backend + deploy (done): Firestore catalog, Express/Mongo removed, env-based Firebase config,
   tighter Firestore/Storage rules, static SPA deploy on Vercel.
3. Store core (done): `App.tsx` state split into hooks, product detail page, working search, category filter.
4. Real checkout and orders (done): validated form, persisted orders, real Profile data, toasts instead of `alert()`.
5. Accessibility and design polish.
6. Performance: lazy Firebase, compressed media, font loading.
7. Docs and release: README with screenshots, Playwright smoke test, legal pages.
