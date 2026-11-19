# Architecture

How nava-ui is put together, and why. For how to use it, read the [README](README.md).

## The idea in one paragraph

Everything visual is decided once, in custom properties (`src/tokens.css`, from which the build
writes `css/tokens.css`). Components
(`css/components.css`) read those properties and nothing else, so a theme is a different set of
values under the same names. The build is small: `dist/` is the source files concatenated, plus a minified copy of each
made by esbuild (pinned to an exact version, so CI rebuilds the same bytes).
The documentation page (`index.html`) is both the manual and the test fixture: every live example
on it is screenshotted in CI.

## React wrappers

`packages/react/` (`@allan_nava/nava-ui-react`) is a second package in the same repository, an npm
workspace: TypeScript sources compiled by `tsc`, with no CSS of its own. Each component renders
the kit's markup and nothing more, so the CSS stays the one place the look is decided.
`Tabs` and `Dialog` reimplement in React what `js/nava-ui.js` does for plain HTML. Its render
tests (`node --test`, React's server renderer) check the classes and ARIA; a Playwright test
bundles a fixture with esbuild and drives the Tabs keys and the Dialog in a browser.

## Layers

```
src/tokens.css        the source: dark on :root, the light palette once
      │  scripts/build-tokens.mjs writes the light palette twice (media query + data-theme)
      ▼
css/tokens.css        values: colour (dark, light), spacing, radius, motion, type, layout
      │  read by
      ├── css/base.css         element defaults: body, headings, links, prose, code, tables, focus
      └── css/components.css   every .nv- class
                │  concatenated by scripts/build.sh
                ▼
dist/nava-ui.css               tokens + base + components, in @layer nv.tokens, nv.base, nv.components
dist/nava-ui.components.css    tokens + components (for pages with their own typography), layered too
dist/nava-ui.js                copy of js/nava-ui.js with a banner
dist/*.min.css, nava-ui.min.js the three above, minified by esbuild, banner kept
dist/tokens.{dark,light}.json  the tokens in the Design Tokens format, per theme
dist/tailwind.css, tailwind.preset.cjs  Tailwind v4 and v3 names pointing at the --nv-* properties
                               (both by scripts/export-tokens.mjs, from css/tokens.css)
```

The dependency goes one way: base and components depend on tokens, never on each other, and
tokens depend on nothing. That is what makes `nava-ui.components.css` possible.

`dist/` is committed, because the CDN serves it straight from the git tag. CI rebuilds it and
fails if the result differs from what is committed.

## Themes

| Order | Selector | Applies |
|---|---|---|
| 1 | `:root` | dark, the default |
| 2 | `@media (prefers-color-scheme: light)` on `:root:not([data-theme="dark"])` | light, when the system asks and the user has not chosen dark |
| 3 | `:root[data-theme="light"]` | light, when the user chose it |

Consequences:

- The kit follows the system with no JavaScript at all.
- The light palette is written twice (rules 2 and 3). CSS has no mixins and the kit has no
  preprocessor; `scripts/contrast.mjs` fails if the two copies differ.
- Things that differ per theme but are not colours also live in tokens. The theme toggle shows
  the sun or the moon through `--nv-icon-sun` and `--nv-icon-moon`, which hold a `display` value:
  the three-state logic stays in one place.
- Some tokens change direction, not just value: overlays lighten with white on dark and darken
  with black on light. That is why `--nv-hover-overlay` is a token and not `rgba(255,255,255,…)`
  in a component.

## Naming

- Custom properties: `--nv-<group>-<name>` (`--nv-space-4`, `--nv-accent-soft`).
- Classes: `nv-block`, `nv-block__part`, `nv-block--variant`. States set by script: `is-active`.
  Where an ARIA attribute already says it (`aria-current="page"`, `aria-pressed="true"`,
  `aria-disabled="true"`, `aria-invalid="true"`), the CSS styles the attribute, so the accessible state and the look
  cannot disagree.
- JavaScript hooks are data attributes (`data-nv-theme-toggle`, `data-nv-spotlight`), never
  classes: styling and behaviour can change independently.
- Selectors are flat, one class deep where possible, so a host page can override any rule with
  one class of its own.

## JavaScript

`js/nava-ui.js` is one IIFE with no dependencies, and optional. It does seven things:

- **Theme toggle.** Sets `data-theme` on `<html>`, stores the choice in `localStorage` under
  `nv-theme`, fires `nv:theme`, keeps the button's `aria-label` current.
- **Card spotlight.** One `pointermove` listener per `[data-nv-spotlight]` container writes
  `--nv-mx` and `--nv-my` on the hovered card; the glow itself is CSS.
- **Dismiss.** One delegated click listener: a `[data-nv-dismiss]` button removes the alert or
  toast it is in.
- **Toasts.** `navaUI.toast()` builds the toast with `createElement` and `textContent`, never
  HTML strings, and appends it to `.nv-toasts`, a `role="status"` live region created when the
  script loads and kept, because a region added together with its first message is often not
  announced. A danger
  toast gets `role="alert"`. The timer stops while the pointer or the focus is on the toast.
- **Dialogs.** A delegated click on `[data-nv-dialog="<id>"]` calls `showModal()`; the browser
  does focus, Escape and the inert page. Where `closedby="any"` is unknown, a click on the
  dialog element outside its box closes it.
- **Tabs.** Delegated click and keydown listeners on `.nv-tabs [role="tab"]`: the ARIA tab
  pattern with automatic activation and a roving `tabindex`.
- **Copy code.** Each `<pre>` under `[data-nv-copy]` is moved into an `nv-code` wrapper with a
  button and a hidden `role="status"` next to it, so the button does not scroll with the code.
  Only where `navigator.clipboard` exists; a refused copy selects the code instead.

The part that must run before first paint (reading the stored theme) is not in this file: it is
a few lines pasted in `<head>`, because a deferred script would let the wrong theme flash.

## The documentation page as a fixture

`index.html` uses only the kit, plus a small `<style>` block of `doc-` classes for the page
itself. Two things make it more than a manual:

- An element with `data-demo` is a live example. A script prints its HTML under it, read from
  the DOM, so the code shown is the code running.
- `tests/visual.spec.mjs` screenshots every `data-demo` element, named after the `<h3>` above
  it. Adding an example adds a test. Each example is screenshotted
  alone, with the rest of the page hidden, so adding an example does not move the others by a
  fraction of a pixel and change baselines nobody touched.

## Checks

| Check | Where | What it protects |
|---|---|---|
| Contrast | `scripts/contrast.mjs` | every text and background pair is 6:1 or better in both themes, and every control edge or mark 3:1 or better; the two light palettes are identical |
| Build in sync | `checks.yml`, `git diff dist/` | `dist/` matches `css/` and `js/` |
| Screenshots | `tests/visual.spec.mjs` | each example, in 2 themes × 2 widths, matches its baseline |
| No sideways overflow | `tests/visual.spec.mjs` | the page never scrolls horizontally |
| Accessibility | `tests/a11y.spec.mjs` | axe rules on the whole page; the toggle switches and remembers |
| Drift from the site | `scripts/site-drift.mjs`, weekly | tokens shared with allan-nava.github.io have the same values |
| Release agrees with its tag | `scripts/release-check.mjs`, on every `v*` tag | `VERSION`, `package.json`, the CDN URLs and a non-empty changelog section all name the tag; `dist/` at the tag is what its sources build |
| Version without a tag | `release-drift.yml`, on push and daily | a bumped `VERSION` gets its tag within two hours |

Baselines are generated on the CI runner (`workflow_dispatch` with "update snapshots"), then
downloaded and committed. Rendering differs between machines, so baselines made locally would
fail in CI.

The accessibility test turns off the page-structure rules (heading order, duplicate landmarks):
the page embeds fragments, such as a second `<h1>`, that are right in a real page.

## Relationship with the site

The kit was extracted from [allan-nava.github.io](https://github.com/Allan-Nava/Allan-Nava.github.io)
(`_sass/base/tokens.scss` and the component partials). Today the two share values by copy:

| | Site | Kit |
|---|---|---|
| Token names | `--color-bg`, `--space-4` | `--nv-bg`, `--nv-space-4` |
| 1rem | 10 px (`html` at 62.5 %) | 16 px |
| Card selector | `.projects > .list > .item > .url` | `.nv-card > .nv-card__link` |
| Source format | Sass partials, built by Jekyll | plain CSS |

`scripts/export-site.mjs` writes the kit's tokens in the site's dialect, `dist/tokens.site.scss`
(built with the rest of `dist/`, so CI fails when it is stale):

- **Names:** a token that changes with the theme becomes `--color-*` (shadows and the toggle's
  icons keep `--shadow-*` and `--icon-*`), so does an alias of one, such as `--nv-success`;
  the others drop the prefix; `--nv-width-wide` becomes `--width-listing`.
- **Lengths:** every `rem` is multiplied by 1.6, fluid sizes included.
- **Shape:** mixins, because the site applies each palette in three places: `palette-dark`,
  `palette-light`, `scale` for the theme-independent tokens, and `nv-aliases`, which points
  every `--nv-*` name at the site's, so the kit's components can run on the site (NV-37).
- **What stays in the site:** the 17 syntax-highlighting colours and `--color-inset-line-strong`,
  which no kit component uses. The site keeps them in its own mixins.

The same script writes `dist/site/_nava-<section>.scss`, one partial per section of
`css/components.css` (the section is a header comment: a line of dashes, then the title), with
every `rem` × 1.6 and the block comments removed, because the site inlines its CSS in every
page and Sass emits `/* */` comments. The rules keep reading `--nv-*`, which the site provides
with `nv-aliases`. A literal `rem` in a component is therefore safe, but a component that reads a
site token directly would not be: components read `--nv-*` only.

`--check <file or URL>` compares the export with a `tokens.scss` of the site, and the weekly
drift workflow runs it against the live file: on 2026-11-15 every one of the site's tokens came
out with the same value. Switching the site over is NV-13.

## Decisions

- **Plain CSS, no preprocessor.** The kit must be usable by pasting one `<link>`. The cost is the
  duplicated light palette, covered by a check.
- **Dark is the default.** It is the identity of the site the kit comes from; light is a
  redefinition of the same names.
- **Cards stop at two columns.** The card is horizontal: at three columns in 1120 px each is
  about 355 px, titles wrap to three lines and rows leave holes.
- **Hover only for real pointers.** On touch a hover state sticks after the tap.
- **No menu in the nav.** On phones the links scroll sideways: nothing to open, nothing that
  needs JavaScript.
- **Lists that compare values share their columns** (`subgrid` in the bar list): with one grid
  per row every bar starts after its own label and the lengths cannot be compared.
