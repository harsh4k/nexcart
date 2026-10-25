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
- **Auth + user data:** Firebase (Google sign-in, Firestore `users/{uid}`, Storage `profiles/{uid}`).
  Rules live in `firestore.rules`.
- **Catalog API:** Express in `server.ts` (`/api/products`, `/api/categories`, `/api/checkout`,
  `/api/health`). Uses MongoDB via Mongoose when `MONGODB_URI` is set, otherwise serves built-in mock data.
  In dev the same server mounts Vite as middleware on port 3000.
- **Deploy:** Vercel (`vercel.json`).

> **Decided 2026-10-25: Firebase only.** Catalog and orders move to Firestore; `server.ts`, Express,
> MongoDB/Mongoose and `/api/*` are removed in roadmap step 2, and the app deploys to Vercel as a static
> SPA. Until that PR lands, the Express setup above is still what runs. Don't add new Express routes or
> Mongo code.

## Layout

```
server.ts              Express API + Vite dev middleware
src/App.tsx            Router, global state (auth, cart, wishlist, search) and the four drawers
src/pages/             One file per route: Home, Stories, StoryDetail, About, Film, Checkout, Profile, HelpDesk
src/components/        Navbar, Footer, Overlay (side drawer), ScrollHub, LoadingScreen, SmoothScroll, FeedbackWidget
src/data/stories.ts    Editorial content for /stories
src/types.ts           Product, CartItem, Story, UserProfile
src/firebase.ts        Firebase app, auth, db, storage
firestore.rules        Firestore security rules
```

## Commands

```bash
npm install
npm run dev        # Express + Vite on http://localhost:3000 (mock catalog without MONGODB_URI)
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
2. Backend + deploy: move catalog and orders to Firestore, remove Express/Mongo, env-based Firebase config,
   tighter Firestore/Storage rules, static SPA deploy on Vercel.
3. Store core: split `App.tsx` state into hooks, product detail page, working search, category filter.
4. Real checkout and orders: validated form, persisted orders, real Profile data, toasts instead of `alert()`.
5. Accessibility and design polish.
6. Performance: lazy Firebase, compressed media, font loading.
7. Docs and release: README with screenshots, Playwright smoke test, legal pages.
