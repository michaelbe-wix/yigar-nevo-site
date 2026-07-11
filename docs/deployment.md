# Deployment & content workflows

## Prerequisites

- Node ≥ 20.11
- The Wix CLI (installed as a dev dependency; `npm install` provides it)
- Authenticated Wix session — the CLI writes credentials to `.env.local` (git-ignored)

## Deploying code changes

Code changes (anything under `src/`, `astro.config.mjs`, etc.) reach production only via a build +
release:

```bash
npm run build                                   # wix build
npm run release -- -t minor -c "release note"   # wix release → publishes to yigarnevo.com
```

- `-t` sets the version bump (`major` / `minor` / `patch`).
- `-c` is the release comment.
- Releasing publishes **straight to production** (`yigarnevo.com`). There is no staging gate, so
  build and sanity-check locally (`npm run dev`) first.

## Updating content (no redeploy needed)

Because the frontend reads Wix at runtime, **content edits go live without a release**:

- **Gallery** — edit rows in the CMS collection `GardenCollectionImages` (titles, descriptions).
  Categories are derived from the image filename, so keep filenames meaningful.
- **Blog** — edit posts in Wix Blog. Publishing a post (or draft update + publish) is immediate.

Only the code that *reads* those fields needs to be deployed; the values themselves are served live.

## Regenerating the sitemap

When the gallery collection changes, regenerate the static sitemap and commit it:

```bash
node scripts/gen-sitemap.mjs      # writes public/gallery-urls.xml
```

Then deploy (the sitemap ships from `public/` as a static asset).

## Secrets

`.env.local` holds the Wix deploy credentials, including `WIX_CLIENT_SECRET`. It is git-ignored and
must never be committed. If it is missing, re-run the Wix CLI setup to regenerate it. `.env.example`
documents the expected keys.
