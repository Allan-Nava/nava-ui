# Architecture

How nava-ui is put together, and why. For how to use it, read the [README](README.md).

## The idea in one paragraph

Everything visual is decided once, in custom properties (`css/tokens.css`). Components
(`css/components.css`) read those properties and nothing else, so a theme is a different set of
values under the same names. There is no build tool: `dist/` is the source files concatenated.
The documentation page (`index.html`) is both the manual and the test fixture: every live example
on it is screenshotted in CI.

## Layers

```
css/tokens.css        values: colour (dark, light), spacing, radius, motion, type, layout
      │  read by
      ├── css/base.css         element defaults: body, headings, links, prose, code, tables, focus
      └── css/components.css   every .nv- class
                │  concatenated by scripts/build.sh
                ▼
dist/nava-ui.css               tokens + base + components
dist/nava-ui.components.css    tokens + components (for pages with their own typography)
dist/nava-ui.js                copy of js/nava-ui.js with a banner
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
  `aria-disabled="true"`), the CSS styles the attribute, so the accessible state and the look
  cannot disagree.
- JavaScript hooks are data attributes (`data-nv-theme-toggle`, `data-nv-spotlight`), never
  classes: styling and behaviour can change independently.
- Selectors are flat, one class deep where possible, so a host page can override any rule with
  one class of its own.

## JavaScript

`js/nava-ui.js` is one IIFE with no dependencies, and optional. It does two things:

- **Theme toggle.** Sets `data-theme` on `<html>`, stores the choice in `localStorage` under
  `nv-theme`, fires `nv:theme`, keeps the button's `aria-label` current.
- **Card spotlight.** One `pointermove` listener per `[data-nv-spotlight]` container writes
  `--nv-mx` and `--nv-my` on the hovered card; the glow itself is CSS.

The part that must run before first paint (reading the stored theme) is not in this file: it is
a few lines pasted in `<head>`, because a deferred script would let the wrong theme flash.

## The documentation page as a fixture

`index.html` uses only the kit, plus a small `<style>` block of `doc-` classes for the page
itself. Two things make it more than a manual:

- An element with `data-demo` is a live example. A script prints its HTML under it, read from
  the DOM, so the code shown is the code running.
- `tests/visual.spec.mjs` screenshots every `data-demo` element, named after the `<h3>` above
  it. Adding an example adds a test.

## Checks

| Check | Where | What it protects |
|---|---|---|
| Contrast | `scripts/contrast.mjs` | every text and background pair is 6:1 or better in both themes, and every control edge or mark 3:1 or better; the two light palettes are identical |
| Build in sync | `checks.yml`, `git diff dist/` | `dist/` matches `css/` and `js/` |
| Screenshots | `tests/visual.spec.mjs` | each example, in 2 themes × 2 widths, matches its baseline |
| No sideways overflow | `tests/visual.spec.mjs` | the page never scrolls horizontally |
| Accessibility | `tests/a11y.spec.mjs` | axe rules on the whole page; the toggle switches and remembers |
| Drift from the site | `scripts/site-drift.mjs`, weekly | tokens shared with allan-nava.github.io have the same values |

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

The weekly drift check is the guard until the site consumes the kit's tokens directly, which is
tracked in [BACKLOG.md](BACKLOG.md) as NV-12 and NV-13.

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
