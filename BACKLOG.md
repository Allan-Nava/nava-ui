# Backlog — nava-ui

Single source of truth for planned work. Items keep a stable `NV-n` id; ROADMAP.md is
generated from this file (`npx backlogsync roadmap`) and the GitHub issues follow on push to
main.

```
## v0.2.0 — Title <!-- ms: phase=next -->

- [ ] **NV-99 — Short name**: what it is, why, what it touches. <!-- nv: prio=high size=M labels=components -->
```

## v0.1.0 — The site's look, extracted <!-- ms: phase=shipped -->

- [x] **NV-1 — Design tokens**: colour for the dark and light themes, spacing, radius, motion,
  type and layout as `--nv-` custom properties in `css/tokens.css`, converted from the site's
  10 px rem to the standard 16 px. <!-- nv: prio=high size=M labels=tokens ver=0.1.0 -->
- [x] **NV-2 — Base layer**: element defaults for page, headings, links, prose, code, tables
  and focus in `css/base.css`, optional, with the self-hosted Inter Variable subset. <!-- nv: prio=high size=S labels=components ver=0.1.0 -->
- [x] **NV-3 — Components**: layout wrappers, nav island, buttons, tags and chips, card list
  with thumbnail variants and generated placeholders, lede, section head, stats, bars, form
  field, pagination, panel, footer; flat `nv-` classes instead of the site's template-bound
  selectors. <!-- nv: prio=high size=L labels=components ver=0.1.0 -->
- [x] **NV-4 — Optional script**: theme toggle that remembers the choice, and the card
  spotlight; about 2 KB, no dependencies, the CSS works without it. <!-- nv: prio=med size=S labels=components ver=0.1.0 -->
- [x] **NV-5 — Documentation page and README**: a GitHub Pages page with a live example and
  the HTML of every component, read from the DOM; a README with install, quick start, token
  and component tables, theming. <!-- nv: prio=high size=M labels=docs ver=0.1.0 -->

## v0.2.0 — Quality gate <!-- ms: phase=shipped -->

Nothing changes in the kit without a check noticing.

- [x] **NV-6 — Contrast of every pair in CI**: `scripts/contrast.mjs` reads `css/tokens.css`
  and measures the WCAG ratio of every text and background pair the components use, in both
  themes, compositing translucent backgrounds; fails under 6:1, and when the two copies of the
  light palette differ. First run: 19 pairs pass, the lowest at 6.1:1. <!-- nv: prio=high size=S labels=a11y,ci ver=0.2.0 -->
- [x] **NV-7 — Screenshots of every example**: Playwright screenshots each `data-demo` element
  of the documentation page in two themes and two widths (60 baselines, generated on the CI
  runner), plus a test that the page never scrolls sideways. Found and fixed: the bars of the
  bar list did not start on the same line. <!-- nv: prio=high size=M labels=ci,components ver=0.2.0 -->
- [x] **NV-8 — Automated accessibility rules**: axe on the documentation page in the four
  projects, and a test of the theme toggle. Found and fixed: the brand name hidden with
  `display: none` on phones, and scrolling code blocks without keyboard access. <!-- nv: prio=high size=S labels=a11y,ci ver=0.2.0 -->
- [x] **NV-9 — dist/ in sync with the sources**: CI rebuilds `dist/` and fails when it differs
  from what is committed, because the CDN serves it from the tag. <!-- nv: prio=med size=S labels=ci,dist ver=0.2.0 -->
- [x] **NV-10 — ARCHITECTURE.md and CLAUDE.md**: how the kit is put together and why, and the
  working rules for coding agents. <!-- nv: prio=med size=S labels=docs ver=0.2.0 -->
- [x] **NV-27 — Release 0.2.0**: the fixes found by the checks were on `main` while the CDN
  URL pointed at the first tag. Changelog entries moved under 0.2.0, `VERSION`, `package.json`
  and the URLs in README and `index.html` bumped, `dist/` rebuilt, tag `v0.2.0`. <!-- nv: prio=high size=S labels=dist ver=0.2.0 -->

## v0.3.0 — One source of truth with the site <!-- ms: phase=shipped -->

The kit and allan-nava.github.io share their tokens by copy. Make the site read them from the
kit, so the copy cannot age. To start once the kit is stable.

- [x] **NV-11 — Detect drift from the site**: `scripts/site-drift.mjs` reads the site's
  `_sass/base/tokens.scss` and compares every shared token, lengths in pixels; a weekly
  workflow fails on drift. First run: none; 18 tokens exist in the site only. <!-- nv: prio=high size=S labels=site,ci ver=0.2.0 -->
- [x] **NV-12 — Token file in the site's dialect**: `scripts/export-site.mjs` writes
  `dist/tokens.site.scss` from `css/tokens.css` with the site's names (`--color-bg`,
  `--space-4`, `--width-listing`), lengths in its 10 px rem, and the palettes as the two Sass
  mixins it already includes. Done when the drift script reports nothing on the generated
  file and the site-only tokens (syntax highlighting, `--color-inset-line-strong`) have a
  decided home. Done: the export reproduces every token of the site's current file with the
  same value (`--check`, also run weekly against the live file); it also emits `nv-aliases`
  for NV-37; the 18 site-only tokens stay in the site, in its own mixins. <!-- nv: prio=high size=M labels=site,tokens ver=main -->
- [x] **NV-13 — The site reads its tokens from the kit**: vendor the generated file into the
  site as `_sass/base/tokens.scss` with a sync script pinned to a kit tag, and a check in the
  site's CI that fails when the vendored file differs from the pin. The change is in the
  site's repository, which has its own rules. Needs NV-12.
  Done on 2026-11-15: the site pins v0.3.0 with `scripts/sync_nava_ui.sh`, its `checks.yml` fails
  on a modified copy, and its compiled tokens came out unchanged; checks, deploy and Lighthouse
  green. The weekly drift check here stands down. <!-- nv: prio=high size=M labels=site ver=0.3.0 -->
- [x] **NV-14 — Port the fixes back to the site**: the bar list of the stats page has rows
  with their own grid, so bars start at different points (the kit uses `subgrid`); and
  `.brand-name` is `display: none` on phones, harmless only if the avatar has an `alt`. Check
  both on the live site and fix them there. Done on 2026-11-18: the site's `/stats/` uses the
  kit's `nv-bars` (vendored `_nava-bars.scss`, its own bar styles deleted); the brand link
  has an explicit `aria-label`, so hiding the name keeps its accessible name and needed no
  change. Checks, deploy and Lighthouse green. <!-- nv: prio=med size=S labels=site,a11y ver=0.5.0 -->
- [x] **NV-37 — The site's Stack section on the kit**: once the site reads its tokens from the
  kit (NV-13), rebuild "What I work with" and `/stack/` with `nv-bento`, `nv-tile` and
  `nv-pill`, and delete the site's own `stack.scss`. The first section of the site that uses
  the kit's components directly, and the proof that the two can live on one page.
  Done on 2026-11-15: the site vendors `_nava-bento.scss` and `_nava-marks-pills-and-legends.scss`
  from v0.4.0 next to the tokens, its `stack.scss` is gone; checks, deploy and Lighthouse
  green. <!-- nv: prio=med size=M labels=site,components ver=0.4.0 -->

## v0.4.0 — Components for applications <!-- ms: phase=shipped -->

The kit has the shape of a portfolio: cards, an opening, a footer. An application needs forms,
feedback and overlays. Each item ships with a live example, its screenshots and the
accessibility rules green.

- [x] **NV-15 — Form controls**: select, textarea, checkbox, radio and switch on the same
  tokens as `nv-input`, with a field wrapper that ties label, control and hint together; a
  rectangular input variant next to the pill. Done with a new token, `--nv-border-control`,
  because the edge of a control has to reach 3:1 and the hairline borders do not; the contrast
  script checks it. <!-- nv: prio=high size=L labels=components,a11y ver=main -->
- [x] **NV-16 — Validation states**: error and success on every control, with the message
  linked through `aria-describedby` and `aria-invalid`, never by colour alone; needs danger
  and success colours in both themes, with their pairs in the contrast script. Done: the CSS
  styles `aria-invalid` itself, valid is the class `is-valid`, danger is a new colour and
  success an alias of the accent. <!-- nv: prio=high size=M labels=components,tokens,a11y ver=main -->
- [x] **NV-17 — Alerts and toasts**: an inline alert in four tones (info, success, warning,
  danger) with an icon slot, and a toast region with `role="status"`; the stacking and the
  timeout in the optional script. Done with `navaUI.toast()`, a `data-nv-dismiss` button, and
  info and warning colours in both themes. <!-- nv: prio=med size=M labels=components,a11y ver=main -->
- [x] **NV-18 — Empty and loading states**: an empty-state block (title, text, one action),
  a skeleton that respects `prefers-reduced-motion`, and a spinner for buttons. Done as
  `nv-empty`, `nv-skeleton` (`--line`, `--circle`) and `nv-spinner`; a working button is
  `aria-busy="true"`, which keeps it readable where `disabled` would halve its contrast. <!-- nv: prio=med size=S labels=components ver=main -->
- [x] **NV-19 — Dialog**: styles for the native `<dialog>` and its backdrop on the glass
  tokens, with header, body and actions; no focus-trap code, the element provides it. Done as
  `nv-dialog`: the close button sits in a `<form method="dialog">`, the page behind stops
  scrolling, and nava-ui.js opens a dialog from `data-nv-dialog` and backs `closedby="any"` in
  browsers without it; a browser test covers focus, Escape and the click outside. <!-- nv: prio=med size=M labels=components,a11y ver=main -->
- [x] **NV-20 — Tabs**: a tab list in the look of the nav links, with the ARIA tab pattern
  and arrow-key movement in the optional script. Done as `nv-tabs`, with automatic activation:
  the arrows move and select, wrapping, Home and End go to the ends, one tab is focusable at a
  time; a browser test covers the keys and the panels. <!-- nv: prio=med size=M labels=components,a11y ver=main -->
- [x] **NV-21 — Badges and marked chips**: a small status label in neutral, accent, warning and
  danger, and a dot variant, with a text alternative so the state is not told by colour alone.
  Also the chip with a mark that changes shape, and its legend, built first in the site's
  `/stack/` page: a filled dot, a ring and a diamond, a solid, neutral or dashed border, and
  the words for screen readers. Done as `nv-badge` and `nv-pill` with `nv-mark`; the marks are
  drawn with borders only, so they also show in forced colours. <!-- nv: prio=med size=M labels=components,a11y ver=main -->
- [x] **NV-22 — Data table**: a table wrapper that scrolls with keyboard access, row hover on
  `--nv-row-hover`, a sticky header, numeric columns with tabular figures, a selected row.
  Done as `nv-table-wrap` and `nv-table`: a row is selected when the checkbox in its first cell
  is checked (`:has()`), so the state stays where a screen reader finds it; `is-selected` for
  rows without one. <!-- nv: prio=med size=M labels=components,a11y ver=main -->
- [x] **NV-35 — Bento grid**: tiles of different sizes in one grid, as in the "What I work
  with" section of the site: one column on phones, two on tablets, a named-area layout on
  desktop with a fallback to auto placement for a tile without an area, and a highlighted
  tile with a soft wash of the accent. Done with span modifiers and dense placement instead
  of named areas, which a kit cannot know: a page that wants a fixed composition still sets
  its own areas. <!-- nv: prio=med size=M labels=components ver=main -->
- [x] **NV-38 — Banner**: the opening of the site's videos page, from the YouTube channel
  banner: kicker, title, a line of words and one of facts over a grid, an accent glow and
  layered ridges in an inline SVG, in tokens so it follows both themes, with motion that stops
  under `prefers-reduced-motion`. Done as `nv-banner`: the ridge line draws itself on load and
  the ridges drift on scroll where scroll-driven animation exists; the site imports
  `_nava-banner.scss` instead of keeping its own copy. <!-- nv: prio=med size=M labels=components,site ver=main -->

## v0.5.0 — Distribution <!-- ms: phase=later -->

Today the kit installs from a CDN URL or by copying files. Worth doing once the components
are stable.

- [ ] **NV-23 — npm package**: publish `nava-ui` with `dist/`, `css/` and `fonts/`, an
  `exports` map for the stylesheets and the script, and install instructions next to the CDN
  ones. The release workflow already has the npm job (NV-26): it runs once `package.json`
  drops `"private": true`, with an `NPM_TOKEN` secret. <!-- nv: prio=high size=M labels=dist -->
- [x] **NV-24 — Minified build**: `dist/nava-ui.min.css` and `.min.js` with their sizes in the
  README; decide between a zero-dependency minifier script and a dev dependency, keeping the
  build reproducible in CI. Done with esbuild as a dev dependency pinned to an exact version:
  a hand-written minifier would have to know where CSS whitespace matters (`calc()`, media
  queries, selectors) and JS would need a parser. Also `nava-ui.components.min.css`; the
  release attaches all six files. <!-- nv: prio=med size=S labels=dist ver=main -->
- [ ] **NV-25 — Cascade layers**: wrap tokens, base and components in `@layer nv.tokens,
  nv.base, nv.components`, so any rule of the host page wins without fighting specificity;
  document the consequence for unlayered resets. <!-- nv: prio=med size=M labels=components,dist -->
- [x] **NV-26 — Release automation**: on a `v*` tag, check that the tag matches `VERSION`,
  create the GitHub release from the changelog section, and publish to npm; add the
  release-drift check so a bumped version without a tag is noticed. Done: `release.yml` with
  `scripts/release-check.mjs`, which also checks `package.json`, the CDN URLs and `dist/`;
  `release-drift.yml` on the backlogsync reusable workflow. The npm job is wired and waits for
  NV-23. <!-- nv: prio=med size=M labels=ci,dist ver=main -->

## v0.6.0 — Tokens from one file <!-- ms: phase=later -->

- [ ] **NV-28 — One token source**: the light palette is written twice in `css/tokens.css`
  because CSS has no mixins. Keep the values in one file and generate `tokens.css` and the
  site dialect (NV-12) from it, with the build check covering both. <!-- nv: prio=med size=M labels=tokens -->
- [ ] **NV-29 — Token exports**: from the same source, a JSON file in the Design Tokens
  format and a Tailwind preset, for projects that do not write plain CSS. <!-- nv: prio=low size=M labels=tokens,dist -->

## v0.7.0 — Documentation and examples <!-- ms: phase=later -->

- [x] **NV-36 — Logo and social preview**: a mark in the family of the other projects (green
  on near-black, rounded square), used as the favicon and in the nav of the documentation
  page and at the top of the README; and a 1280×640 social preview rendered from an HTML
  source, for the repository settings and the page's `og:image`. Done: three tiles of a bento
  grid; the preview is rendered by the `assets` workflow, in the Playwright image. <!-- nv: prio=med size=S labels=docs ver=main -->

- [ ] **NV-30 — Page templates**: three complete pages built only with the kit (a landing, a
  listing with filters, an application screen with a form and a table), linked from the
  documentation and covered by screenshots. They show how the pieces sit together. <!-- nv: prio=med size=L labels=docs,components -->
- [ ] **NV-31 — Copy button on code**: a button on every code block of the documentation
  page, visible on hover and on focus, as on the site. <!-- nv: prio=low size=S labels=docs -->
- [ ] **NV-32 — Usage rules per component**: for each component when to use it, when not to,
  and the accessibility duties left to the author, next to its example. <!-- nv: prio=med size=M labels=docs,a11y -->
- [ ] **NV-33 — Opt-in motion module**: the site's scroll reveal, section rule and view
  transitions as a separate `nava-ui.motion.css`, off under `prefers-reduced-motion`. <!-- nv: prio=low size=M labels=components -->
- [ ] **NV-34 — React components**: thin typed wrappers over the classes, in a separate
  package. Only when a React project adopts the kit; the CSS stays the source of the look. <!-- nv: prio=low size=L labels=components,dist -->
