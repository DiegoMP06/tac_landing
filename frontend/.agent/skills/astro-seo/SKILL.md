---
name: astro-seo
description: Use when implementing or improving SEO in an Astro project with custom i18n: meta tags, Open Graph / Twitter images, favicon set, canonical and hreflang, sitemap, robots, structured data (JSON-LD), and web manifest. Does not change business logic, Drizzle queries, or the i18n system.
---

# Astro SEO (multilingual)

Implement complete, professional technical SEO for an Astro site: head metadata, social images (banner / Open Graph / Twitter), favicon set, canonical + hreflang, sitemap, robots, structured data, and performance signals. Everything must work with the project's existing custom i18n.

## Hard rules (do not break)

1. **Do not change business logic.** No edits to Drizzle schemas or queries, API routes, or middleware behavior. Reading existing data through existing query functions to build SEO output (for example a sitemap of dynamic pages) is allowed; changing those functions is not.
2. **Do not change the i18n system.** Do not modify the helper, locale config, or routing strategy. All SEO text (titles, descriptions, OG text, alt text, structured data strings) must come from the existing dictionaries via the existing helper.
3. **New SEO strings go in ALL locales.** Follow the existing key naming and nesting. Never add a key to only one locale. Keep interpolation syntax identical to the project's.
4. **Use existing design tokens.** For `theme-color`, manifest colors, and generated image colors, read the values from `global.css` (Tailwind theme). Do not invent new colors or fonts.
5. **Read before writing.** Inspect `astro.config.*`, the base layout(s), `global.css`, the i18n helper and dictionaries, `public/`, and existing pages before making changes. Reuse what exists.
6. **Ask before adding dependencies.** Prefer built-in Astro features. Approved by default only if truly needed: `@astrojs/sitemap` and `sharp` (already bundled with Astro for images).
7. **Never invent facts.** Do not fabricate company data, addresses, social handles, ratings, or phone numbers for structured data. If a value is missing, leave the field out and list it in the final summary.

## Process

1. **Audit** current state: what the head contains, which pages lack titles/descriptions, whether `site` is set, what images and icons exist, how locales are routed (prefix, subdomain, etc.).
2. **Plan** the file list and the new i18n keys.
3. **Implement** in this order: config, SEO component, layout integration, per-page props, images, favicon + manifest, sitemap, robots, structured data.
4. **Validate** (see checklist) and **summarize**.

## 1. Configuration

- `astro.config.*` must define `site` with the production URL (required for canonical URLs, sitemap, and absolute OG image URLs). If unknown, ask for it; do not guess.
- Set `trailingSlash` and `build.format` consistently with the existing routing, and use that same convention in every canonical URL and sitemap entry.
- Put the production URL and site-level constants (site name, default locale, Twitter/X handle if the user has one) in one place, e.g. `src/config/seo.ts`, reading from env where appropriate.

## 2. Reusable `<SEO />` component

Create `src/components/SEO.astro` (or extend the existing head component) and use it from the base layout. It receives already-translated strings as props so it stays independent of the i18n helper.

Props (typed): `title`, `description`, `image` (path or URL, optional), `imageAlt`, `type` (`website` | `article`), `noindex` (boolean), `canonical` (optional override), `publishedTime` / `modifiedTime` (optional, for articles), `alternates` (list of `{ locale, url }`).

It must render:

**Basics**
- `<title>`: unique per page, 50-60 characters, primary keyword first, brand last (`Page title | Brand`).
- `<meta name="description">`: unique per page, 120-160 characters, written as a call to action, not keyword stuffing.
- `<link rel="canonical">`: absolute URL built from `Astro.site` + the current path, without query strings or tracking params.
- `<meta name="robots">`: `index, follow` by default; `noindex, nofollow` when `noindex` is true (admin, thank-you pages, search results, drafts). Add `max-image-preview:large`.
- `<meta name="viewport">`, `<meta charset="utf-8">`, and `<html lang>` set from the active locale (BCP 47, e.g. `es`, `en`, `es-MX`).
- `<meta name="theme-color">` using the primary background token from `global.css` (with a dark variant via `media` attribute if the site supports dark mode).
- `<meta name="author">` and `<meta name="generator">` only if the project already uses them.

**Multilingual**
- `<link rel="alternate" hreflang="xx" href="...">` for every available locale of the current page, plus `hreflang="x-default"` pointing to the default locale. URLs must be absolute and reciprocal (each language version links to all others, including itself).
- Only emit alternates for locales where that page actually exists. Use the project's existing routing helper to build the localized URL; do not hardcode path patterns.

**Open Graph**
- `og:type`, `og:site_name`, `og:title`, `og:description`, `og:url` (same as canonical), `og:locale` (format `es_MX` / `en_US`), `og:locale:alternate` for the other locales.
- `og:image` (absolute URL), `og:image:width` (1200), `og:image:height` (630), `og:image:alt`, `og:image:type`.
- For articles: `article:published_time`, `article:modified_time`, `article:author`.

**Twitter / X**
- `twitter:card` = `summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`. Add `twitter:site` / `twitter:creator` only if the user provides handles.

**Performance hints**
- `<link rel="preconnect">` for third-party origins actually used (fonts, analytics). Preload only the hero image and critical font, never more than 2-3 resources.

## 3. Social / banner images

Required assets:
- **Open Graph / Twitter banner:** 1200x630 px, 1.91:1, PNG or JPG, under 300 KB ideally (max 5 MB), important content inside the central safe area (keep ~80px margins; avoid text at the edges).
- **Square variant** (optional, 1200x1200) for platforms that crop square.
- **One default image per locale** if the image contains text (for example `og-default-es.png`, `og-default-en.png`). If images contain no text, a single shared image is enough.
- Per-page images when the page has its own visual (articles, events, products); fall back to the locale default.

How to produce them (choose the least invasive option that fits the project):
1. **Static design assets (preferred when the user has a logo/brand art):** place finished images in `public/og/` and reference them by absolute URL.
2. **Generated at build time:** write a small Node script (for example `scripts/generate-og.mjs`) using `sharp` to compose the banner from the existing logo, brand colors from `global.css`, and the translated site name/tagline read from the dictionaries. Output to `public/og/`. Add an npm script (`"og": "node scripts/generate-og.mjs"`) and tell the user how to run it.
3. **Dynamic per-page images:** only if the user asks and agrees to a new dependency (for example `satori` + `@resvg/resvg-js`) through an Astro endpoint. Cache aggressively.

Rules: never use a low-resolution logo stretched to fit; keep text legible at thumbnail size (minimum ~48px equivalent); always provide a translated `og:image:alt`.

## 4. Favicon and app icons

Generate from the existing logo or mark (ask for the source file if none exists, preferably SVG or 512x512+ PNG). Produce in `public/`:

| File | Size | Purpose |
|---|---|---|
| `favicon.svg` | scalable | Modern browsers (supports `prefers-color-scheme` inside the SVG when possible) |
| `favicon.ico` | 32x32 (and 16x16 inside) | Legacy browsers, and crawlers that request `/favicon.ico` |
| `favicon-96x96.png` | 96x96 | Google Search results (multiples of 48 px) |
| `apple-touch-icon.png` | 180x180 | iOS home screen, opaque background, no transparency |
| `icon-192.png` | 192x192 | Android / PWA |
| `icon-512.png` | 512x512 | Android / PWA splash |
| `icon-maskable-512.png` | 512x512 | Maskable icon with logo inside the central 80% safe zone |

Head tags:
```html
<link rel="icon" href="/favicon.ico" sizes="32x32" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="icon" href="/favicon-96x96.png" type="image/png" sizes="96x96" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
```

`public/site.webmanifest`: `name`, `short_name`, `description`, `start_url`, `display: "standalone"`, `background_color` and `theme_color` (from `global.css` tokens), and the icons above including the maskable one. If the site is multilingual, keep the manifest in the default language unless the project already serves per-locale manifests.

Generate the PNG/ICO files with a `sharp` script (for example `scripts/generate-icons.mjs`) from the source logo, and document the command.

## 5. Sitemap and robots

**Sitemap**
- If the site is static or mostly static: use `@astrojs/sitemap` with the `i18n` option mapping locales to BCP 47 codes so it emits `xhtml:link` alternates. Add `filter` to exclude noindex pages (admin, API, thank-you).
- If pages are dynamic or rendered on demand (SSR) from the database: create `src/pages/sitemap.xml.ts` (or `sitemap-index.xml.ts`) that lists static routes plus dynamic ones, reusing the **existing** read functions for the data. Include `<loc>`, `<lastmod>` (when a real date exists), and `xhtml:link` alternates per locale. Do not add `<priority>` or `<changefreq>` (ignored by Google). Split into multiple files beyond 50,000 URLs.
- Only list canonical, indexable, 200-status URLs.

**robots.txt** (`public/robots.txt` or a `robots.txt.ts` endpoint if it must be dynamic):
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://YOUR-DOMAIN/sitemap-index.xml
```
Adjust disallowed paths to the project's real private routes. Never disallow CSS/JS/image assets. Use the production domain from the `site` config. Use `noindex` meta (not robots.txt) to keep a page out of the index.

## 6. Structured data (JSON-LD)

Add a small `JsonLd.astro` component that renders `<script type="application/ld+json">` from a typed object. Apply only types that match real content:
- **Site-wide:** `Organization` (name, url, logo, `sameAs` social profiles only if provided) and `WebSite` (name, url, `inLanguage`).
- **Home / landing:** `WebPage`; add `Event` (name, startDate, endDate, location, `eventAttendanceMode`, organizer, offers) only if the site is for an event and the data exists.
- **Inner pages:** `BreadcrumbList` matching the visible breadcrumbs.
- **FAQ sections:** `FAQPage` only if the questions and answers are visible on the page.
- **Articles/blog:** `Article` / `BlogPosting` with headline, image, datePublished, dateModified, author.
- **Products/services:** `Product` / `Service` / `Offer` only with real data. Never invent ratings or reviews.

All text fields come from the dictionaries or database through existing functions. Use absolute URLs. `inLanguage` reflects the active locale.

## 7. Content and markup signals

- Exactly one `<h1>` per page, containing the main topic; logical `h2`-`h3` hierarchy.
- All images: translated `alt` text (empty `alt=""` only for decorative images), explicit `width` and `height`, `astro:assets` / `<Image />` for responsive formats (AVIF/WebP), hero `fetchpriority="high"` and everything else lazy.
- Descriptive link text (no "click here"); `rel="noopener noreferrer"` on external `target="_blank"` links.
- Internal links between related pages and between language versions (a visible language switcher using real `<a href>` links, not JS-only navigation).
- Friendly, lowercase, hyphenated URLs; keep slugs stable.
- Soft 404s avoided: non-existent routes must return a real 404 status with a helpful translated 404 page (`noindex`).
- Do not block rendering with large third-party scripts; load analytics with `defer` or `async`, or via Partytown if the project already uses it.

## 8. Validation checklist

- [ ] `astro build` succeeds with no new errors
- [ ] Every page has a unique title and description in every locale
- [ ] Canonical URLs are absolute, use the production `site`, and match the sitemap
- [ ] hreflang alternates are reciprocal and include `x-default`
- [ ] OG image loads at its absolute URL (1200x630) with translated alt text
- [ ] Favicon set present; `/favicon.ico` and `/site.webmanifest` respond with 200
- [ ] `sitemap` and `robots.txt` are reachable and reference each other
- [ ] JSON-LD is valid (check with Google Rich Results Test and Schema.org validator)
- [ ] Noindex pages are excluded from the sitemap
- [ ] No hardcoded visible or SEO strings; new keys exist in ALL locales
- [ ] No logic, query, or i18n helper changes
- [ ] Lighthouse SEO 100 and Accessibility 90+ on mobile

Suggested manual checks for the user after deploy: Google Search Console (submit the sitemap, inspect a URL), Facebook Sharing Debugger, LinkedIn Post Inspector, and a Twitter/X card preview.

## Output expectations

- Deliver complete, ready-to-copy files, not partial diffs.
- End with a short summary: files created or changed, i18n keys added (with locales), assets generated and the commands to regenerate them, and anything missing that the user must provide (production URL, logo source, social handles, real business data).
- If something would require changing logic, the i18n system, or design tokens, stop and ask instead of doing it.