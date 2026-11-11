# Changelog

## Unreleased

- Form controls: `nv-field`, `nv-input--box`, `nv-textarea`, `nv-select`, `nv-checkbox`,
  `nv-radio`, `nv-switch`, `nv-choice`, `nv-fieldset` and `nv-legend`.
- New token `--nv-border-control`, the edge of form controls, at 3:1 or better on the page and
  on a surface in both themes; the contrast script now checks control edges and marks at 3:1.
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
