# Two Riders

The source for [tworiders.com](https://www.tworiders.com) — a bicycle travel
journal covering two cross-country tours (the TransAmerica Trail in 2004 and the
Southern Tier in 2006) and a photography section.

Built with [Hugo](https://gohugo.io) and a hand-rolled theme, deployed to
**Cloudflare Workers** static assets. Migrated from the original Kirby CMS site
(preserved in this repo's first commit).

## Stack

- **Hugo (extended)** — static site generator, native image processing.
- **EB Garamond** + **Jost** — self-hosted variable WOFF2 fonts (`static/fonts/`),
  with full OpenType features (small caps, oldstyle + lining figures, true
  italic). Both are SIL Open Font License; license files sit beside the fonts.
- **Cloudflare Workers** — free static hosting, built and deployed on every push.

No external runtime dependencies: no jQuery, no web-font CDN, no analytics/tag
manager. The lightbox is ~1 KB of vanilla JS (`assets/js/lightbox.js`).

## Local development

Requires [Hugo extended](https://gohugo.io/installation/) (or just Node — the
`hugo-extended` npm package vendors the binary).

```sh
npm install        # installs Hugo via the hugo-extended package
npm run dev        # http://localhost:1313  (live reload)
npm run build      # production build into ./public
```

## Content

Everything lives under `content/`:

```
content/
  _index.md                  home page
  about.md                   about page
  transamerica/_index.md     tour intro + index (grouped by state)
  transamerica/<slug>/       one journal entry per folder (a page bundle)
    index.md                 front matter + prose; {{< gallery >}} embeds its photos
    *.jpg                    the entry's gallery images
  southern-tier/…            same shape as transamerica
  photography/_index.md      album grid
  photography/<slug>/        one album per folder (a page bundle)
    index.md                 title, cover, description
    *.jpg                    album photos
```

Shared images referenced by absolute URL (route maps, hero covers) live in
`static/photography/`. Image alt text is carried in each bundle's front matter
under `resources:` and drives both accessibility and lightbox captions.

### Add a journal entry

Create `content/<tour>/<slug>/index.md`:

```markdown
---
title: "Town, State"
type: "note"
date: 2006-03-10
weight: 20060310          # YYYYMMDD — keeps the tour in chronological order
author: "Mickey Deagle"
shortname: "Town"          # shown in the index and prev/next
tags: ["Texas"]            # the state it falls under in the index
resources:
  - src: "photo-01.jpg"
    params: { alt: "what's in the photo" }
---

Your prose. Drop {{< gallery >}} anywhere to lay out this entry's images.
```

Drop the photos in the same folder.

## Deploying to Cloudflare Workers

Deployment uses **Cloudflare Workers Builds** (Cloudflare watches the repo and
builds on every push — no API tokens or GitHub Actions needed). One-time setup:

1. In the Cloudflare dashboard: **Workers & Pages → Create → Workers →
   Import a repository**, and connect `mickeydeagle/tworiders`.
2. Set the build configuration:
   - **Build command:** `npm run build`
   - **Deploy command:** `npx wrangler deploy` (the default)
   - **Branch:** `main`
   Cloudflare reads [`wrangler.jsonc`](./wrangler.jsonc) and serves `./public`
   as static assets.
3. Save and deploy. The first build publishes to
   `https://tworiders.<your-account>.workers.dev`.
4. Attach the domain: **Workers → tworiders → Settings → Domains & Routes →
   Add custom domain**, and add `www.tworiders.com` (point the apex
   `tworiders.com` at it too, with a redirect to `www`).

After that, every push to `main` rebuilds and redeploys automatically.

To deploy by hand instead (requires `wrangler login`):

```sh
npm run deploy
```

## Repo history & migration

The first commit is the original Kirby site. The conversion to Hugo was done
with [`scripts/migrate-from-kirby.mjs`](./scripts/migrate-from-kirby.mjs), which
parsed the Kirby flat files into Hugo content bundles. To re-run it you'd restore
the Kirby tree first: `git checkout <first-commit> -- content`.
