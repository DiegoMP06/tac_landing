---
name: landing-page-design
description: Use when improving the UI and UX of landing pages or marketing sections in an Astro + Tailwind project (layout, hierarchy, spacing, components, states, motion, responsiveness). Presentation only: never changes data logic, Drizzle queries or i18n plumbing, and always respects the project's existing design tokens in global.css.
---

# Landing Page Design (Astro + Tailwind)

Raise the visual quality and the user experience of existing Astro pages to a professional level. Logic is already finished and must not be changed. Colors and typography are already defined and must not be changed.

## Hard rules (do not break)

### 1. Logic is off limits
- Do not modify Drizzle schemas, queries, API routes, middleware, route params, or any data-fetching code in frontmatter.
- Do not rename props, variables, or functions that carry data. Restyle the markup around them.
- Keep data-driven sections data-driven: keep the loops, conditionals, and props. Change the presentation of each item, not where it comes from.

### 2. Design tokens are fixed
- Colors, fonts, and any theme values defined in `global.css` (Tailwind theme) are the single source of truth. Read that file first.
- Use only those tokens (e.g. `bg-primary`, `text-foreground`, `font-heading`, or whatever names exist). Do not hardcode hex values, do not add new colors or font families, and do not edit the existing token definitions.
- If a design genuinely needs a token that does not exist (e.g. a subtle surface color), propose it in the final summary instead of adding it silently. Derive shades from existing tokens with opacity (`bg-primary/10`) or `color-mix()` when possible.

### 3. i18n is respected
- Never hardcode user-facing text in components. Every visible string, `alt`, `aria-label`, `title`, placeholder, and button label must go through the project's existing i18n helper and dictionaries.
- Before touching any text, find out how the helper works (how keys are named, where the dictionaries live, how the locale is resolved) and follow that exact convention.
- If a static text must change or a new one is needed (a new CTA label, a section subtitle, an `aria-label`):
  - Edit or add the key in the dictionary files for **all** supported locales, never just one.
  - Follow the existing key naming and nesting structure.
  - Keep placeholders/interpolation syntax identical to what the project already uses.
  - Do not change the helper, its types, or the locale configuration.
- If you find a hardcoded string already in a component, move it to the dictionaries only if it is small and safe; otherwise list it in the final summary.
- Design for text expansion: Spanish is typically 20-30% longer than English. No fixed-width buttons, no forced single-line headings, no truncation that hides meaning. Check every locale after each change.
- Keep `<html lang>`, `hreflang` alternates, and locale-aware links intact.

### 4. Other constraints
- Read existing components, layouts, and `global.css` before editing. Reuse existing components and patterns before creating new ones.
- Ask before adding dependencies. Prefer Tailwind, CSS, and Astro-native solutions over JS libraries.
- Do not refactor or reformat code unrelated to the design change.

## Process

1. **Audit** the page: note weak hierarchy, inconsistent spacing, flat sections, unclear CTAs, missing states, and anything that feels generic or unfinished. Read `global.css` to learn the available tokens.
2. **Plan** the changes section by section, briefly.
3. **Implement** top to bottom: header, hero, social proof, features, process, detail section (pricing / schedule / catalog), FAQ, final CTA, footer.
4. **Verify** at 375px, 768px, 1280px, and 1536px, in every locale, and in dark mode if the project supports it.
5. **Summarize** what changed, which files were touched, and any decisions needed.

## UI principles

**Hierarchy**
- One focal point per section and one primary CTA per viewport.
- Use the existing type scale and fonts with clear size and weight contrast between heading, subheading, and body. Fluid hero sizing with `clamp()`.
- Body text 16-18px, line-height 1.5-1.7, line length 60-75 characters.

**Color usage (with existing tokens)**
- Follow roughly 60/30/10: mostly neutral surfaces, a secondary tone for structure, the accent only for CTAs and key highlights.
- Keep WCAG AA contrast (4.5:1 body, 3:1 large text and UI).
- Alternate section backgrounds using existing neutral tokens to create rhythm and separation without heavy borders.

**Spacing and layout**
- Consistent spacing scale. Generous vertical padding between sections (`py-16` to `py-28`).
- Constrain content width (`max-w-6xl` or `max-w-7xl`), centered, with consistent horizontal padding.
- Vary layouts across sections (split, grid, centered, offset) while keeping alignment consistent.
- Prefer whitespace over dividers and boxes.

**Components**
- Buttons: primary / secondary / ghost variants, consistent height and radius, with hover, focus-visible, active, and disabled states.
- Cards: consistent radius and padding, one subtle depth cue (border or soft shadow), hover lift only when clickable.
- Badges, pills, and eyebrow labels to add structure above headings.
- Navigation: clean header (sticky if appropriate), always-visible language switcher, mobile menu that works well and closes on navigation.
- Footer: organized columns, language switcher, legal links.

**Imagery**
- Use `astro:assets` / `<Image />` with explicit `width` and `height`, and translated `alt` text.
- Hero image above the fold: `loading="eager"` and `fetchpriority="high"`; everything else lazy.
- Consistent crop ratios, radius, and treatment across images. Add placeholders or gradients for missing images.

**Motion**
- Subtle: fade/translate on scroll (8-24px), 150-300ms, ease-out. Hover and focus transitions on interactive elements.
- Animate only `transform` and `opacity`. Respect `prefers-reduced-motion`.
- Prefer CSS and the View Transitions API over JS animation libraries.

## UX principles

- **Clarity in 5 seconds:** the hero must make clear what this is, who it is for, and what to do next.
- **Scannability:** short headings, short paragraphs, visual grouping, icons or numbers as anchors. No walls of text.
- **CTA strategy:** one primary action, repeated at logical points (hero, mid-page, final CTA). Button labels describe the outcome.
- **Feedback and states:** every interactive element has hover, focus-visible, active, loading, and disabled states where relevant. Forms show clear validation, success, and error messages (translated through i18n).
- **Empty and loading states:** data-driven sections need a designed empty state and, when relevant, a skeleton or fallback. Do this in markup/CSS only, using strings from the dictionaries.
- **Navigation:** anchor links with smooth scroll and `scroll-margin-top` offset for the sticky header; clear active state; skip link for keyboard users.
- **Mobile first:** thumb-friendly touch targets (44px minimum), no hover-only interactions, readable tables (stack or scroll), sticky or prominent CTA on mobile when appropriate.
- **Trust:** place proof (numbers, logos, testimonials, speakers, partners) near CTAs.
- **Accessibility:** semantic HTML (`header`, `nav`, `main`, `section`, `footer`), a single `h1`, ordered headings, visible focus rings, correct `aria-*` only where needed, `<details>` for FAQs.

## Default landing structure

1. Hero: one headline, one supporting sentence, primary + secondary CTA, supporting visual.
2. Social proof.
3. Benefits / features (3-6 items).
4. How it works / program / timeline.
5. Detail section (pricing, schedule, catalog).
6. FAQ.
7. Final CTA.
8. Footer.

Adapt to what the page already contains; do not add sections that need new data or new content the project does not have.

## Astro specifics

- Keep components static (`.astro`) by default. Use islands (`client:visible` or `client:idle`) only for real interactivity.
- Use one styling approach consistently (Tailwind utilities). Avoid mixing in ad-hoc CSS unless needed for something Tailwind cannot express.
- Extract repeated UI into small presentational components that receive already-translated strings as props, so they stay independent of the i18n system.

## Final checklist

- [ ] No logic, query, or i18n helper changes
- [ ] Only existing tokens from `global.css` used (no hardcoded colors or fonts)
- [ ] No hardcoded visible text; any new or changed static text exists in ALL locale dictionaries
- [ ] Every locale renders without overflow or broken layout
- [ ] Responsive at 375 / 768 / 1280 / 1536
- [ ] Focus, hover, active, and disabled states present
- [ ] Contrast passes AA; images have dimensions and translated alt text
- [ ] Reduced-motion respected

## Output expectations

- Deliver complete, ready-to-copy files, not partial diffs.
- End with a short summary: files changed, i18n keys added or modified (with their locales), proposed tokens not added, and any hardcoded strings found but left untouched.
- If a request would require changing logic, tokens, or i18n structure, stop and ask instead of doing it.