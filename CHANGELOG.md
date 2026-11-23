# Changelog

## Unreleased

## 0.11.0 — 2026-11-23

Three fixes found by building a documentation site with the kit (streamprobe-operator).

- A footer with only `nv-footer__bottom` drew two rules one above the other, with a gap: the
  bottom line now drops its own border and spacing when it is the footer's first child, so a
  one-line footer has the footer's single border (NV-40). New example in the documentation page.
- `nv-table` inside `nv-table-wrap` keeps a minimum width of 34rem on screens up to 640px and
  scrolls in its box, instead of squeezing its last column to a word per line (NV-41).
- Inline `code` in paragraphs, list items, definitions and quotes wraps anywhere, so a long
  path or identifier no longer widens the page on a phone; in tables it stays whole (NV-42).

## 0.10.0 — 2026-11-19

A copy button on code blocks, and the site's motion as an optional module.

- Motion module (NV-33): `dist/nava-ui.motion.css` (and `.min.css`, `@allan_nava/nava-ui/motion.css`),
  optional and loaded after the kit, with the site's movement: a scroll reveal for `nv-card`,
  `nv-tile` and `nv-reveal`, the `nv-section-head` rule drawn as it enters, and cross-document
  view transitions with the nav held in place. All of it off under `prefers-reduced-motion`,
  the scroll effects only where `animation-timeline: view()` exists, no JavaScript. In its own
  layer, `nv.motion`, after the components; attached to the GitHub release. The page templates
  load it.
- Copy button on code blocks (NV-31): `data-nv-copy` on a `<pre>`, or on a container of code
  blocks, and nava-ui.js wraps each block in `nv-code` with a `nv-code__copy` button. It shows on
  hover and on keyboard focus (always on touch screens), says "Copied" for a moment, announces
  it through a hidden status, and selects the code when the browser refuses the copy. Added
  only where the Clipboard API exists. `navaUI.copyButton(pre)` for a block added later. Every
  code block of the documentation page has one.

## 0.9.1 — 2026-11-18

The npm package under the name npm accepts.

- The kit's npm package is `@allan_nava/nava-ui`: npm refuses the bare `nava-ui` as too close
  to `naive-ui`, so the 0.9.0 publish failed and nothing went out under that name. Install with
  `npm install @allan_nava/nava-ui`; imports become `@allan_nava/nava-ui`,
  `@allan_nava/nava-ui/js`, `@allan_nava/nava-ui/tailwind-preset` and so on. The CDN URLs do not
  change.

## 0.9.0 — 2026-11-18

Components for a page about a person, and the npm packages under the owner's scope.

- Profile (`nv-profile`), timeline (`nv-timeline`) and award (`nv-award`) components, for a
  page about a person: a round photo with name, role and buttons; roles in order with a rail and
  the current one in accent; a recognition set apart with an accent hairline and wash. Each is
  exported for the site as a partial in `dist/site/`.

- The React package is `@allan_nava/nava-ui-react`, in the owner's npm scope, instead of
  `@nava-ui/react`, which would have needed an npm organisation; it was never published under
  the old name.

- npm: `nava-ui` (with `dist/`, `css/`, `src/` and `fonts/`, and short `exports` paths such as
  `nava-ui/js` and `nava-ui/tailwind-preset`) and `@allan_nava/nava-ui-react`, published by the release
  workflow through npm trusted publishing, with provenance and no token.

- Usage rules on the documentation page: under every component's example, what it is for, what
  it is not for, and the accessibility left to the author (labels, ARIA state, markup order).

## 0.8.0 — 2026-11-18

One source for the tokens and exports from it, page templates, and React wrappers.

- `@nava-ui/react` in `packages/react`: typed React wrappers over the classes — `Button`,
  `Badge`, `Pill`, `Alert`, `EmptyState`, `Skeleton`, `Spinner`, `Bento`, `Tile`, `DataTable`,
  `Field`, `Input`, `Textarea`, `Select`, `Choice`, `Fieldset`, `Tabs` and `Dialog` — with render
  tests and a browser test of Tabs and Dialog. Same version as the kit; published with it.
- Page templates in `examples/`: a landing, a listing with filters and an application screen
  (tabs, a data table, a form, a dialog), built only with the kit and linked from the
  documentation page; CI screenshots each one whole and runs every accessibility rule on it.
- Tokens for other tools, from the same source: `dist/tokens.dark.json` and
  `dist/tokens.light.json` in the Design Tokens format (2025.10), and `dist/tailwind.css`
  (Tailwind v4, `@theme inline`) and `dist/tailwind.preset.cjs` (Tailwind v3), whose names
  point at the kit's custom properties so the classes follow the theme. Built by
  `scripts/export-tokens.mjs`, attached to the release; both Tailwind files were compiled with
  Tailwind 4.1 and 3.4 before shipping.
- One token source: `src/tokens.css` states the light palette once, and `scripts/build-tokens.mjs`
  (run by `./scripts/build.sh`) generates `css/tokens.css` with it written twice, in the
  system-preference media query and on `[data-theme="light"]`. The build refuses a light token
  missing from the dark `:root`; CI and the release check that `css/tokens.css` matches its
  source. The values did not change: the minified files came out byte for byte the same.

## 0.7.0 — 2026-11-18

The kit in cascade layers, so a host page overrides it without fighting specificity, and minified
files next to the readable ones.

- Cascade layers: `dist/nava-ui.css` and `dist/nava-ui.components.css` put the kit in
  `nv.tokens`, `nv.base` and `nv.components`, so any unlayered rule of the host page wins without
  fighting specificity. **Changed:** an unlayered reset of the page (`a { color }`,
  `button { all: unset }`) now also wins over the components, and a token override on `:root`
  alone now reaches the light theme; the README says how to order a reset before the kit. `css/`
  and the site export stay unlayered.
- Minified files next to the readable ones: `dist/nava-ui.min.css`,
  `dist/nava-ui.components.min.css` and `dist/nava-ui.min.js`, with their sizes in the README and
  attached to the release. Built by esbuild, the one build dependency, pinned to an exact
  version so CI rebuilds the same bytes; `npm ci` now comes before `./scripts/build.sh`.

## 0.6.0 — 2026-11-18

The components an application needs beyond forms and feedback: dialogs, tabs, data tables, and
what a region shows while it is empty or loading.

- Data table (`nv-table-wrap`, `nv-table`): a box that scrolls both ways and can be scrolled from
  the keyboard, a sticky header, `nv-table__num` for right-aligned tabular figures, row hover
  on `--nv-row-hover`, and a selected row that follows the checkbox in its first cell; the
  contrast script checks text over a hovered and a selected row.
- Tabs (`nv-tabs`): the ARIA tab pattern in the look of the nav links; nava-ui.js selects on
  click and moves with the arrow keys, Home and End, with one focusable tab at a time.
- Dialog (`nv-dialog`): styles for the native `<dialog>` and its backdrop on the glass token,
  with header, close button, a body that scrolls and actions; the page behind does not scroll.
  No focus-trap code: `showModal()` gives focus, Escape and the inert page. nava-ui.js opens a
  dialog from a button with `data-nv-dialog="<id>"` and adds `closedby="any"` to browsers that
  do not know it.
- Empty and loading states: `nv-empty` (icon, title, text, one action), `nv-skeleton` with
  `--line` and `--circle` and a shimmer that stops under reduced motion, and `nv-spinner` for a
  button marked `aria-busy="true"`, which stays readable and ignores clicks.

## 0.5.0 — 2026-11-15

A banner for the opening of a page, first used on the site's videos page.

- Banner (`nv-banner`): a page opening over a faint grid, an accent glow and layered ridges in
  an inline SVG, the look of the YouTube channel banner in tokens, so it follows both themes.
  Without reduced motion the ridge line draws itself on load, the glow breathes and the
  ridges drift at three speeds on scroll (scroll-driven animation, where supported); first
  built for the site's videos page, which imports it as `dist/site/_nava-banner.scss`.
- The contrast script checks strong text over the accent glow on the page; the banner's facts
  are in `--nv-fg`, because muted text over the glow is 5.6:1 in the light theme.

## 0.4.0 — 2026-11-15

The components as Sass partials for allan-nava.github.io, so the site can use them directly.

- `dist/site/_nava-*.scss`: every component section as a Sass partial for allan-nava.github.io,
  with its 10 px rem and no comments, so the site can import the components it uses.
- The `dist/` check in CI also fails on a generated file that was never committed.

## 0.3.0 — 2026-11-15

Components for applications, and the tokens in the dialect of allan-nava.github.io, so the site
can read them from the kit.

- The weekly site drift check stands down once the site imports the kit's export: from then on
  the site's own CI compares its copy with the pinned tag.
- `dist/tokens.site.scss`: the tokens in the dialect of allan-nava.github.io (its names, its
  10 px rem, Sass mixins) plus `--nv-*` aliases, generated by `scripts/export-site.mjs`; its
  `--check` mode, run weekly, compares the export with the site's live tokens.
- A logo (`assets/logo.svg`): three tiles of a bento grid in the accent and off-white on
  near-black, the family look of the other projects. It is the favicon and the nav mark of the
  documentation page, and it heads the README.
- A 1280×640 social preview, rendered from `assets/social-preview.html` by
  `scripts/render-assets.mjs` (the `assets` workflow), used as the page's `og:image`.
- Bento grid (`nv-bento`, `nv-tile`): tiles of different sizes in one, two or six columns, with
  width and height modifiers, dense placement and a feature tile.
- Badges (`nv-badge`) in a neutral and three toned variants, with an optional dot.
- Marked pills and legends (`nv-pill`, `nv-mark`, `nv-pills--legend`): a kind told by the shape of the
  mark, the pill's border and words, never by colour alone; first built for the site's
  `/stack/` page.
- Release automation: pushing a `vX.Y.Z` tag checks that `VERSION`, `package.json`, the CDN
  URLs and the changelog agree with it (`scripts/release-check.mjs`), and creates the GitHub
  release with the changelog section and the `dist/` files; a daily check fails when a bumped
  `VERSION` has no tag.
- Form controls: `nv-field`, `nv-input--box`, `nv-textarea`, `nv-select`, `nv-checkbox`,
  `nv-radio`, `nv-switch`, `nv-choice`, `nv-fieldset` and `nv-legend`.
- New token `--nv-border-control`, the edge of form controls, at 3:1 or better on the page and
  on a surface in both themes; the contrast script now checks control edges and marks at 3:1.
- Alerts in four tones (`nv-alert`) and toasts (`nv-toast`, `navaUI.toast()`), with a
  `data-nv-dismiss` button; new tokens `--nv-info` and `--nv-warning` with their soft and border
  variants in both themes.
- Validation states: `aria-invalid="true"` on any control, the class `is-valid`, and the
  messages `nv-error` and `nv-valid`.
- New tokens `--nv-danger`, `--nv-danger-soft` and `--nv-danger-border` in both themes, checked
  by the contrast script; `--nv-success` and its variants as aliases of the accent.
- Changed: `nv-input` uses `--nv-border-control` instead of `--nv-border-strong`, so its edge
  is easier to see, and its focus adds a soft ring to the accent-coloured edge.

## 0.2.0 — 2026-11-11

The quality gate: nothing changes in the kit without a check noticing.

- Checks in CI: contrast of every text and background pair, screenshots of every example in two
  themes and two widths, automated accessibility rules, `dist/` in sync with the sources.
- `scripts/site-drift.mjs` and a weekly workflow: fail when a token differs from the site's.
- The browser tests run in the official Playwright image, so they do not depend on the runner's
  package mirrors; `scripts/serve.mjs` is the static server for the tests and for local use.
- `BACKLOG.md` is the source of truth for planned work; `ROADMAP.md` and the GitHub issues are
  generated from it.
- `ARCHITECTURE.md` and `CLAUDE.md`.
- Fix: code blocks and the table wrapper of the documentation page, which scroll sideways on
  phones, can be reached from the keyboard.
- Fix: on phones the brand name in the nav is hidden visually instead of with `display: none`,
  so a brand link without an image keeps its accessible name.
- Fix: the bars of a bar list start on the same line (the rows share the columns of the list).

## 0.1.0 — 2026-11-11

First release: the tokens and components of allan-nava.github.io as a standalone kit.

- Tokens for colour (dark and light), spacing, radius, motion, type and layout.
- Base layer for page, headings, links, prose, code and tables.
- Components: layout wrappers, nav island, buttons, tags and chips, card list with thumbnail
  variants and generated placeholders, lede, section head, stats, bars, form field, pagination,
  panel, footer.
- Optional script: theme toggle and card spotlight.
- Documentation page with a live example and the HTML of every component.
