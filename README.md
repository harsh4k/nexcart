# NexCart

A demo storefront for audio gear built with React, TypeScript, Vite, and Firebase.
Browse and filter the catalog, save products to a wishlist, and try checkout
with a Google account. Demo orders use Firestore. Checkout charges no money.

[Live demo](https://nexcart-v1.vercel.app/)

## Run locally

```sh
npm ci
npm run dev
```

The app uses its bundled catalog if Firestore cannot return products.
For your own Firebase project, use the public web configuration in
[.env.example](.env.example). See [firestore.rules](firestore.rules) for the
catalog and demo-order access rules.

```sh
npm run lint   # TypeScript check
npm run build  # production files in dist/
npm run preview
```

## License

The original NexCart application source code is MIT licensed. Brand artwork, catalog media, video, and third-party material retain their respective terms. See [LICENSE](LICENSE).
