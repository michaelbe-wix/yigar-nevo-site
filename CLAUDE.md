# CLAUDE.md — agent orientation

Guidance for AI coding agents (Claude Code and similar) working in this repository.

## What this is

A Hebrew (RTL), non-commercial showcase site for Yigar Nevo's antique collection, deployed on
**Wix Managed Headless**. Astro (SSR) serves the pages; React islands (`client:only`) render the
interactive UI. All content is fetched from **live Wix services at runtime** — do not hardcode
gallery items or post text into the bundle.

Start with [`README.md`](README.md) and [`docs/architecture.md`](docs/architecture.md).

## Commands

```bash
npm install
npm run dev                                          # local dev (wix dev), port 4321
npm run build                                        # wix build
npm run release -- -t minor -c "note"                # publishes to yigarnevo.com (production!)
node scripts/gen-sitemap.mjs                          # regenerate public/gallery-urls.xml from the CMS
```

`npm run release` deploys straight to production — only run it when the user explicitly asks.

## Architecture in one paragraph

Each Astro route under `src/pages/` mounts the single `App` React component with `client:only`.
`App` (`src/components/App.tsx`) is a small hand-rolled SPA router: it intercepts same-origin `<a>`
clicks, uses `history.pushState`, and swaps between `Home` / `Gallery` / `BlogIndex` / `BlogPost`.
Data helpers in `src/lib/` fetch from Wix using an anonymous visitor OAuth token
(`CLIENT_ID` in `src/lib/wix.ts`, a public client id). SEO tags are injected by the Wix headless
integration.

## Conventions & gotchas

- **Content is the source of truth in Wix, not the repo.** Gallery titles/descriptions live in the
  CMS collection `GardenCollectionImages`; blog bodies live in Wix Blog (Ricos). Editing them is a
  CMS operation, not a code change, and takes effect without a redeploy.
- **Gallery categories derive from the image filename**, not the CMS title — so retitling an item in
  the CMS never drops it from its gallery filter. Keep this split when touching `src/lib/galleryData.ts`.
- **RTL + Hebrew everywhere.** Preserve `dir="rtl"`, right-aligned layouts, and Hebrew copy.
- **Styling** is plain CSS via tokens in `src/styles/global.css` (no framework). Match the existing
  inline-style + token idiom in components.
- **Never commit secrets.** `.env.local` holds the Wix deploy secret and is git-ignored; keep it that way.
- **Verify UI changes in the browser** (dev server) before considering them done; the lightbox has
  touch gestures (pinch-zoom, swipe) that need a real device to fully validate.

## Key files

- `src/components/App.tsx` — SPA router, scroll-to-top on nav, data bootstrap.
- `src/components/Gallery.tsx` + `Lightbox.tsx` — grid, filtering, and the zoom/swipe lightbox.
- `src/components/BlogPost.tsx` + `src/lib/blog.ts` — blog fetch + Ricos rendering.
- `src/lib/galleryData.ts` — CMS→gallery mapping (titles from CMS, category from filename).
- `src/lib/wix.ts` — the public visitor OAuth client id.
