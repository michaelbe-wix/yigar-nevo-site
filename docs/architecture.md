# Architecture

## Overview

The site is a **Wix Managed Headless** project: Wix provides hosting, data (CMS, Blog, Media Manager),
and SEO, while the frontend is an **Astro** app rendered server-side (`output: "server"`) with
**React** islands for interactivity. All displayed content is fetched from Wix **at runtime** — the
repository contains no baked-in gallery items or post bodies.

## Routing

Astro provides the real URLs (good for crawlers and sharing); the interactive layer is a single React
app that behaves like an SPA.

- Every content route under `src/pages/` renders `<App client:only="react" page="…" />`.
  - `index.astro` → `home`
  - `gallery/index.astro`, `gallery/[num].astro` → `gallery` (with an optional deep-linked item)
  - `blog.astro` → `blog`
  - `post/[...slug].astro` → `post`
  - `portfolio.astro`, `portfolio-collections/[...rest].astro` → 301 redirects to `/gallery`
- `src/components/App.tsx` is a hand-rolled router. It:
  - intercepts same-origin `<a>` clicks and navigates with `history.pushState` (no full reload);
  - swaps the rendered page component (`Home` / `Gallery` / `BlogIndex` / `BlogPost`);
  - **scrolls to top on in-site navigation**, but lets the browser restore scroll on Back/Forward;
  - bootstraps gallery + post-list data once on mount.

## Data flow

Read access uses an **anonymous visitor OAuth token** minted from a public client id
(`CLIENT_ID` in `src/lib/wix.ts`) via `POST https://www.wixapis.com/oauth2/token`
(`grantType: "anonymous"`).

### Gallery

- Source: Wix CMS data collection **`GardenCollectionImages`**.
- `src/lib/galleryData.ts` maps each CMS row to a `GalleryItem`:
  - **Title & description** come from the CMS fields (the CMS is the source of truth). Title falls
    back to a filename-derived name if a row has no `title`.
  - **Category** and search keywords are derived from the **image filename**, not the CMS title, so
    editing a title in the CMS never moves a photo out of its gallery filter.
  - Thumbnail/full image URLs are `static.wixstatic.com` transform URLs.
- Server-side reads (`fetchGalleryServer`) use REST + the anonymous token; the browser uses the Wix SDK.

### Blog

- Source: **Wix Blog v3** (`blog/v3/posts/query` with the `RICH_CONTENT` fieldset).
- `src/lib/blog.ts` / `blogServer.ts` fetch posts; `BlogPost.tsx` renders the Ricos rich content via a
  lazily-loaded viewer (`RichContentViewer.tsx`). The list page (`BlogIndex.tsx`) shows each post's
  cover, excerpt, and link.

### SEO

`@wix/seo` + the Wix headless integration inject per-page title/description/canonical/OG/JSON-LD from
the real Wix content. Avoid hardcoding meta tags. `src/data/seo-live.json` is a cached snapshot used
for parity reference.

## The lightbox

`src/components/Lightbox.tsx` renders through a portal into `document.body` and implements:

- background **scroll-lock** (iOS-safe `position: fixed` on `<body>`, restored on close);
- **pinch-to-zoom + pan** (two-finger pinch, single-finger drag while zoomed, double-tap/double-click
  toggle, desktop wheel-zoom in fullscreen);
- **swipe navigation** that yields to zoom — swiping changes items only at 1× scale, and multi-touch
  gestures never navigate;
- keyboard support (Escape / arrows handled by the parent `Gallery`) and a focus trap with
  focus-return on close.

## Sitemap

`scripts/gen-sitemap.mjs` queries the CMS and writes `public/gallery-urls.xml` (home + gallery + blog +
every gallery item). Wix `release` doesn't run npm hooks and the runtime only serves static files from
`public/`, so the sitemap is committed as a static asset and regenerated manually when the collection
changes.
