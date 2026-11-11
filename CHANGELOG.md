# Changelog

## Unreleased

- Checks in CI: contrast of every text and background pair, screenshots of every example in two
  themes and two widths, automated accessibility rules, `dist/` in sync with the sources.
- `scripts/site-drift.mjs` and a weekly workflow: fail when a token differs from the site's.
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
