# CLAUDE.md

Instructions for Claude Code (and other AI agents) working in this repository.

## What this is

nava-ui is a small UI kit in plain CSS: design tokens and components extracted from
[allan-nava.github.io](https://github.com/Allan-Nava/Allan-Nava.github.io). Public repository,
Apache-2.0. Documentation page: <https://allan-nava.github.io/nava-ui/> (GitHub Pages, `main`,
root).

How the pieces fit is in [ARCHITECTURE.md](ARCHITECTURE.md); how to use the kit is in
[README.md](README.md). Read ARCHITECTURE.md before changing structure.

## Language

Everything in this repository is in English: code, comments, docs, commit messages, issues,
milestones.

## Layout

```
css/tokens.css        custom properties: the only place where values are decided
css/base.css          element defaults (optional layer)
css/components.css    every .nv- class
js/nava-ui.js         optional: theme toggle, card spotlight
dist/                 built by scripts/build.sh, committed (the CDN serves it from the tag)
fonts/                Inter Variable, Latin subset, with its licence
index.html            documentation page and test fixture
BACKLOG.md            planned work, the source of truth; ROADMAP.md is generated from it
scripts/build.sh      concatenates css/ and js/ into dist/
scripts/contrast.mjs  contrast of every pair, both themes
scripts/site-drift.mjs  compares tokens with the site's
tests/                Playwright: screenshots, accessibility, theme toggle
tests/__screenshots__/  baselines, generated on the CI runner
```

## Rules

- **Never edit `dist/` by hand.** Edit `css/` or `js/`, then run `./scripts/build.sh` and commit
  both. CI fails when they are out of sync.
- **A colour goes in three places** in `css/tokens.css`: `:root`, the light media query, and
  `:root[data-theme="light"]`. The two light blocks must be identical.
- **Components use tokens only.** No literal colours; sizes from the spacing and type scales.
  The fixed pixel values that exist (control heights, the card thumbnail) come from the site.
- **Prefix everything**: classes `nv-`, custom properties `--nv-`, data attributes `data-nv-`.
  Classes starting with `doc-` belong to `index.html` only and are not part of the kit.
- **A new component needs four things**: the CSS, a live example in `index.html` inside an
  element with `data-demo` under an `<h3>`, a row in the README component table, and new
  screenshot baselines. A new text and background pair also needs a line in
  `scripts/contrast.mjs`.
- **A visual change needs new baselines.** They are generated in CI, never locally:
  `gh workflow run checks.yml -f update_snapshots=true`, wait, then
  `gh run download <run-id> -n screenshots -D tests/__screenshots__` (delete the folder first)
  and commit. Look at the changed images before committing them.
- **Accessibility is part of the component.** Focus visible, hover only under
  `@media (hover: hover)`, motion off under `prefers-reduced-motion`, state styled through ARIA
  attributes where one exists. Do not hide a link's only text with `display: none`.
- **Keep the docs true.** A changed fact is changed everywhere it is stated: README,
  ARCHITECTURE.md, CHANGELOG.md, `index.html`, this file.
- **Planned work goes in `BACKLOG.md`** (ids `NV-n`, never reused). `ROADMAP.md` is generated
  by `npx backlogsync roadmap` and never edited by hand; the GitHub issues and milestones
  follow the backlog on push to `main`, one way. Do not create or edit backlog issues on
  GitHub: change the file. A finished item is ticked and gets `ver=main` (or the version) in
  the same commit as the work.
- **The site is a separate repository** with its own rules (it is never pushed by an agent).
  Do not change it from here.

## Commands

```bash
./scripts/build.sh          # rebuild dist/
npm run contrast            # contrast check, no install needed
npm run drift               # compare tokens with the live site
npm run backlog             # validate BACKLOG.md and that ROADMAP.md is current
npm run roadmap             # regenerate ROADMAP.md after editing the backlog
npm ci && npx playwright install chromium
npm test                    # screenshots, accessibility, theme toggle
python3 -m http.server 8000 # look at index.html
```

Before calling a change done: `./scripts/build.sh`, `npm run contrast`, and the `checks` workflow
green on the pushed commit. If the browser tests cannot run locally (missing system libraries),
say so and rely on CI.

## Releases

1. Move the "Unreleased" entries of `CHANGELOG.md` under the new version and date.
2. Update `VERSION`, the `version` in `package.json`, and the version in the CDN URLs of
   `README.md` and `index.html`.
3. `./scripts/build.sh`, commit, tag `vX.Y.Z`, push the commit and the tag.

The CDN URL contains the tag, so a release is not visible to users until the tag is pushed.

## Git

- Commits are authored as the repository owner, with no co-author trailer and no AI attribution
  in commits, pull requests or issues.
- Work on `main`; small, complete commits.
