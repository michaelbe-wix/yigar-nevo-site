# Yigar Nevo Collection — [yigarnevo.com](https://www.yigarnevo.com)

A Hebrew, fully right-to-left (RTL) showcase site for **Yigar Nevo's** private collection of
antique everyday objects from Eretz Israel — millstones, blacksmith anvils, weights and scales,
Marseille roof tiles, taps, clay pipes and jugs — photographed in his garden in Ramat Yochanan.

It's a non-commercial museum-style site with three areas:

- **דף הבית** (Home) — landing page with intro, featured pieces, and latest blog posts.
- **גלריה** (Gallery) — a filterable, searchable grid of ~84 photographed items, each opening in a
  lightbox with pinch-to-zoom, keyboard/swipe navigation, and share links.
- **בלוג** (Blog) — long-form posts about the collection (e.g. the history of Marseille roof tiles).

## Tech stack

- **[Wix Managed Headless](https://dev.wix.com/docs/go-headless)** — hosting + data (CMS, Blog, Media).
- **[Astro](https://astro.build/)** in SSR mode (`output: "server"`) — routing and server rendering.
- **React** islands hydrated with `client:only` for the interactive UI (gallery, lightbox, blog reader).
- **TypeScript**, plain CSS with design tokens (no CSS framework).
- Content is fetched **at runtime** from Wix — nothing is hardcoded into the bundle.

## Data sources (all live Wix, read at runtime)

| Content | Source | How |
| --- | --- | --- |
| Gallery items | Wix CMS collection `GardenCollectionImages` | Wix Data query (anonymous visitor token) |
| Blog posts | Wix Blog v3 | `blog/v3/posts/query` with `RICH_CONTENT` (rendered via Ricos) |
| Images | Wix Media Manager | `static.wixstatic.com` transform URLs |

Read access uses an **anonymous visitor OAuth client** (a public client ID). The gallery's display
titles/descriptions live in the CMS (the source of truth); image categories are derived from filenames
so re-titling never drops a photo from its filter. See [`docs/architecture.md`](docs/architecture.md).

## Local development

Requires **Node ≥ 20.11** and the Wix CLI (installed as a dev dependency).

```bash
npm install
npm run dev        # wix dev — local dev server on http://localhost:4321
```

The Wix CLI manages authentication and writes credentials to `.env.local` (git-ignored).
See [`.env.example`](.env.example) for the expected variables.

## Build & deploy

```bash
npm run build              # wix build
npm run release -- -t minor -c "your release note"   # wix release → publishes to yigarnevo.com
```

Deploys go straight to production (`yigarnevo.com`). CMS/Blog **content** edits take effect
immediately without a redeploy, since content is read at runtime. See
[`docs/deployment.md`](docs/deployment.md).

## Project structure

```
.
├── astro.config.mjs        # Astro + Wix integrations, SSR adapter
├── wix.config.json         # Wix site/app identifiers (public)
├── public/                 # static assets (favicons, sitemap XML)
├── scripts/
│   └── gen-sitemap.mjs      # regenerates public/gallery-urls.xml from the CMS (run manually)
└── src/
    ├── pages/              # Astro routes (home, gallery, blog, post, redirects)
    ├── layouts/            # HTML shell
    ├── components/         # React UI (App, Gallery, Lightbox, BlogIndex, BlogPost, chrome…)
    ├── lib/                # data helpers (gallery, blog, wix client, seo, routes)
    ├── styles/             # global.css (design tokens, RTL)
    └── data/               # cached SEO metadata
```

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — how routing, data fetching, and the gallery/blog work.
- [`docs/deployment.md`](docs/deployment.md) — build, release, and content-update workflows.
- [`CLAUDE.md`](CLAUDE.md) — orientation for AI coding agents working in this repo.

## Notes on identifiers

`wix.config.json` (`siteId`, `appId`) and the visitor `CLIENT_ID` in `src/lib/wix.ts` are **public
identifiers** already embedded in the deployed site — they carry no privileged access on their own.
The only real secret (`WIX_CLIENT_SECRET`, used by the CLI for deployment) lives in `.env.local` and
is never committed.
