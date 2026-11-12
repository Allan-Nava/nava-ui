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

## v0.3.0 — One source of truth with the site <!-- ms: phase=next -->

The kit and allan-nava.github.io share their tokens by copy. Make the site read them from the
kit, so the copy cannot age. To start once the kit is stable.

- [x] **NV-11 — Detect drift from the site**: `scripts/site-drift.mjs` reads the site's
  `_sass/base/tokens.scss` and compares every shared token, lengths in pixels; a weekly
  workflow fails on drift. First run: none; 18 tokens exist in the site only. <!-- nv: prio=high size=S labels=site,ci ver=0.2.0 -->
- [ ] **NV-12 — Token file in the site's dialect**: `scripts/export-site.mjs` writes
  `dist/tokens.site.scss` from `css/tokens.css` with the site's names (`--color-bg`,
  `--space-4`, `--width-listing`), lengths in its 10 px rem, and the palettes as the two Sass
  mixins it already includes. Done when the drift script reports nothing on the generated
  file and the site-only tokens (syntax highlighting, `--color-inset-line-strong`) have a
  decided home. <!-- nv: prio=high size=M labels=site,tokens -->
- [ ] **NV-13 — The site reads its tokens from the kit**: vendor the generated file into the
  site as `_sass/base/tokens.scss` with a sync script pinned to a kit tag, and a check in the
  site's CI that fails when the vendored file differs from the pin. The change is in the
  site's repository, which has its own rules. Needs NV-12. <!-- nv: prio=high size=M labels=site -->
- [ ] **NV-14 — Port the fixes back to the site**: the bar list of the stats page has rows
  with their own grid, so bars start at different points (the kit uses `subgrid`); and
  `.brand-name` is `display: none` on phones, harmless only if the avatar has an `alt`. Check
  both on the live site and fix them there. <!-- nv: prio=med size=S labels=site,a11y -->

## v0.4.0 — Components for applications <!-- ms: phase=next -->

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
- [ ] **NV-18 — Empty and loading states**: an empty-state block (title, text, one action),
  a skeleton that respects `prefers-reduced-motion`, and a spinner for buttons. <!-- nv: prio=med size=S labels=components -->
- [ ] **NV-19 — Dialog**: styles for the native `<dialog>` and its backdrop on the glass
  tokens, with header, body and actions; no focus-trap code, the element provides it. <!-- nv: prio=med size=M labels=components,a11y -->
- [ ] **NV-20 — Tabs**: a tab list in the look of the nav links, with the ARIA tab pattern
  and arrow-key movement in the optional script. <!-- nv: prio=med size=M labels=components,a11y -->
- [ ] **NV-21 — Badges**: a small status label in neutral, accent, warning and danger, and a
  dot variant, with a text alternative so the state is not told by colour alone. <!-- nv: prio=low size=S labels=components -->
- [ ] **NV-22 — Data table**: a table wrapper that scrolls with keyboard access, row hover on
  `--nv-row-hover`, a sticky header, numeric columns with tabular figures, a selected row. <!-- nv: prio=med size=M labels=components,a11y -->

## v0.5.0 — Distribution <!-- ms: phase=later -->

Today the kit installs from a CDN URL or by copying files. Worth doing once the components
are stable.

- [ ] **NV-23 — npm package**: publish `nava-ui` with `dist/`, `css/` and `fonts/`, an
  `exports` map for the stylesheets and the script, and install instructions next to the CDN
  ones. <!-- nv: prio=high size=M labels=dist -->
- [ ] **NV-24 — Minified build**: `dist/nava-ui.min.css` and `.min.js` with their sizes in the
  README; decide between a zero-dependency minifier script and a dev dependency, keeping the
  build reproducible in CI. <!-- nv: prio=med size=S labels=dist -->
- [ ] **NV-25 — Cascade layers**: wrap tokens, base and components in `@layer nv.tokens,
  nv.base, nv.components`, so any rule of the host page wins without fighting specificity;
  document the consequence for unlayered resets. <!-- nv: prio=med size=M labels=components,dist -->
- [ ] **NV-26 — Release automation**: on a `v*` tag, check that the tag matches `VERSION`,
  create the GitHub release from the changelog section, and publish to npm; add the
  release-drift check so a bumped version without a tag is noticed. <!-- nv: prio=med size=M labels=ci,dist -->

## v0.6.0 — Tokens from one file <!-- ms: phase=later -->

- [ ] **NV-28 — One token source**: the light palette is written twice in `css/tokens.css`
  because CSS has no mixins. Keep the values in one file and generate `tokens.css` and the
  site dialect (NV-12) from it, with the build check covering both. <!-- nv: prio=med size=M labels=tokens -->
- [ ] **NV-29 — Token exports**: from the same source, a JSON file in the Design Tokens
  format and a Tailwind preset, for projects that do not write plain CSS. <!-- nv: prio=low size=M labels=tokens,dist -->

## v0.7.0 — Documentation and examples <!-- ms: phase=later -->

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
