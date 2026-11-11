# nava-ui

A small, dark-first UI kit in plain CSS: the design tokens and components of
[allan-nava.github.io](https://allan-nava.github.io), extracted so that other projects can share
the same look.

- **No build step, no framework.** One stylesheet, one optional script of about 2 KB.
- **Two themes.** Dark by default, light when the system asks for it, and an explicit choice that
  wins over both.
- **Token-driven.** Components read CSS custom properties and nothing else: to re-theme, override
  tokens.
- **Namespaced.** Every class starts with `nv-`, every custom property with `--nv-`.

**Live documentation, with every component and its HTML: <https://allan-nava.github.io/nava-ui/>**

## Contents

- [Install](#install)
- [Quick start](#quick-start)
- [What is in the box](#what-is-in-the-box)
- [Tokens](#tokens)
- [Components](#components)
- [Theming](#theming)
- [JavaScript](#javascript)
- [Accessibility](#accessibility)
- [Differences from the site](#differences-from-the-site)
- [Development](#development)
- [License and credits](#license-and-credits)

## Install

Pick one.

**From a CDN**, pinned to a release tag:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Allan-Nava/nava-ui@v0.1.0/dist/nava-ui.css">
<script defer src="https://cdn.jsdelivr.net/gh/Allan-Nava/nava-ui@v0.1.0/dist/nava-ui.js"></script>
```

**As files in your project.** Copy `dist/` and `fonts/` side by side: the stylesheet loads the font
from `../fonts/`.

```
your-site/
├── dist/nava-ui.css
├── dist/nava-ui.js
└── fonts/inter-latin-wght-normal.woff2
```

**As a git submodule**, to follow updates:

```bash
git submodule add https://github.com/Allan-Nava/nava-ui.git vendor/nava-ui
```

```html
<link rel="stylesheet" href="vendor/nava-ui/dist/nava-ui.css">
```

## Quick start

A complete page: nav, opening, a list of cards, footer.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My site</title>

  <!-- Remembers the theme choice. In <head>, before the stylesheet: it must run before first paint. -->
  <script>
  (function () {
    try {
      var t = localStorage.getItem('nv-theme');
      if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
    } catch (e) {}
  })();
  </script>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Allan-Nava/nava-ui@v0.1.0/dist/nava-ui.css">
  <script defer src="https://cdn.jsdelivr.net/gh/Allan-Nava/nava-ui@v0.1.0/dist/nava-ui.js"></script>
</head>
<body>
  <a class="nv-skip-link" href="#main">Skip to content</a>

  <header class="nv-nav">
    <div class="nv-nav__inner">
      <a class="nv-nav__brand" href="/"><span class="nv-nav__name">My site</span></a>
      <ul class="nv-nav__links">
        <li><a class="nv-nav__link" href="/" aria-current="page">Home</a></li>
        <li><a class="nv-nav__link" href="/projects">Projects</a></li>
      </ul>
      <button class="nv-nav__icon" type="button" data-nv-theme-toggle>
        <!-- sun and moon icons: copy them from index.html -->
      </button>
    </div>
  </header>

  <main class="nv-wrap nv-wrap--wide" id="main">
    <div class="nv-lede">
      <p class="nv-lede__kicker">Software engineer</p>
      <h1 class="nv-lede__title">I build <span class="nv-em">things</span> that stay up.</h1>
      <p class="nv-lede__sub">One or two sentences about what this site is.</p>
      <div class="nv-actions">
        <a class="nv-button nv-button--primary" href="/projects">See the projects</a>
        <a class="nv-button" href="/about">About</a>
      </div>
    </div>

    <section class="nv-section">
      <div class="nv-section-head">
        <h2 class="nv-section-head__title">Latest projects</h2>
        <a class="nv-section-head__link" href="/projects">All projects →</a>
      </div>
      <ul class="nv-list nv-list--two" data-nv-spotlight>
        <li class="nv-card">
          <a class="nv-card__link" href="/projects/one">
            <div class="nv-card__thumb nv-ph nv-ph-0"><span>ON</span></div>
            <div class="nv-card__body">
              <h3 class="nv-card__title">Project one</h3>
              <p class="nv-card__excerpt">What it does, in two lines at most.</p>
              <div class="nv-card__meta"><span>2026</span><span class="nv-card__meta-tag">#golang</span></div>
            </div>
          </a>
        </li>
      </ul>
    </section>
  </main>
</body>
</html>
```

## What is in the box

| Path | Contents | Use it when |
|---|---|---|
| `dist/nava-ui.css` | tokens, base and components | nava-ui styles the whole page |
| `dist/nava-ui.components.css` | tokens and components, no element styles | the page already has its own typography |
| `dist/nava-ui.js` | theme toggle, card spotlight | optional: the CSS works without it |
| `css/tokens.css` | the custom properties | you write your own components on these values |
| `css/base.css` | page, headings, links, prose, code, tables, focus | source of the base layer |
| `css/components.css` | every `nv-` class | source of the components |
| `fonts/` | Inter Variable, Latin subset, 48 KB | loaded by `base.css` |
| `index.html` | the documentation page | a working example of everything |

## Tokens

Defined in [`css/tokens.css`](css/tokens.css). Colour tokens change with the theme; the others do
not.

### Colour

| Token | Dark | Light | Role |
|---|---|---|---|
| `--nv-bg` | `#050505` | `#f6f7f8` | page background |
| `--nv-surface` | `#101215` | `#ffffff` | cards, inputs, buttons |
| `--nv-surface-hover` | `#171a1f` | `#eef1f3` | hovered surface |
| `--nv-border` | white 9% | black 11% | hairlines |
| `--nv-border-strong` | white 18% | black 22% | borders of controls |
| `--nv-fg` | `#eae4e4` | `#1a1e23` | body text |
| `--nv-fg-strong` | `#ffffff` | `#05070a` | titles, emphasis |
| `--nv-fg-muted` | `#a9a9b0` | `#515a65` | secondary text |
| `--nv-accent` | `#10cf53` | `#086830` | links, primary actions |
| `--nv-accent-hover` | `#01ff5a` | `#085e2c` | hovered accent |
| `--nv-accent-soft` | accent 12% | accent 10% | background of tags and inline code |
| `--nv-accent-border` | accent 35% | accent 30% | border of tags, hovered cards |
| `--nv-accent-text` | `#7be8a6` | `#075527` | text on `accent-soft` |
| `--nv-on-accent` | `#04170c` | `#ffffff` | text on `accent` |
| `--nv-glass` | near-black 72% | white 78% | the nav island |
| `--nv-code-bg`, `--nv-code-fg`, `--nv-code-border` | | | code blocks |
| `--nv-thumb-bg`, `--nv-thumb-veil` | | | the tile behind third-party images |
| `--nv-shadow-sm`, `--nv-shadow-md`, `--nv-shadow-nav` | | | elevation |

The light accent is the same hue as the dark one, much darker: the accent is used both as text and
as a background with text on it, and a mid green holds neither side on a light page.

The values are the ones in production on the site. `scripts/contrast.mjs` measures every text
and background pair the components use, in both themes, and CI fails under 6:1 (WCAG AA asks
4.5:1 for body text). If you change a colour, run it.

### Spacing, radius, motion, type, layout

| Group | Tokens | Values |
|---|---|---|
| Spacing | `--nv-space-1` … `--nv-space-9` | 4, 8, 12, 16, 24, 32, 48, 64, 96 px |
| Radius | `--nv-radius-sm`, `-md`, `-lg`, `-pill` | 4, 8, 14 px, 999 px |
| Duration | `--nv-dur-fast`, `--nv-dur`, `--nv-dur-slow` | 120, 200, 360 ms |
| Easing | `--nv-ease`, `--nv-ease-out` | standard curve; a long ease-out for lifts |
| Fonts | `--nv-font-sans`, `--nv-font-mono` | Inter Variable with system fallback; system monospace |
| Sizes | `--nv-text-xs`, `-sm`, `-base`, `-lg`, `-xl`, `-2xl`, `-3xl`, `-4xl` | 12 and 14 px fixed, then fluid from 16 to 50 px |
| Line height | `--nv-leading-tight`, `-snug`, `--nv-leading` | 1.15, 1.35, 1.7 |
| Tracking | `--nv-tracking-tight`, `-wide` | −0.02em for titles, 0.08em for uppercase labels |
| Widths | `--nv-width-normal`, `-large`, `-wide`, `--nv-measure` | 640, 880, 1120 px, 68ch |

Which radius for what: `sm` for inline code and focus rings, `md` for images and code blocks, `lg`
for cards and panels, `pill` for everything you can click that is not a card.

## Components

The HTML of each one is on the [documentation page](https://allan-nava.github.io/nava-ui/#components),
under "Show the HTML".

| Component | Classes | Notes |
|---|---|---|
| Layout | `nv-wrap`, `nv-wrap--large`, `nv-wrap--wide` | 640 px for reading, 880 px, 1120 px for listings |
| Nav | `nv-nav`, `nv-nav__inner`, `__brand`, `__avatar`, `__name`, `__links`, `__link`, `__icon` | floating glass island; current page with `aria-current="page"` or `.is-active` |
| Button | `nv-button`, `nv-button--primary`, `nv-actions` | one primary per view; works on `<a>` and `<button>` |
| Tag | `nv-tag` | a label on content; hover only when it is a link |
| Chip | `nv-chip`, `nv-chip__count`, `nv-chips` | a link to a topic, with an optional count |
| Filter chip | `nv-chip nv-chip--filter` | a `<button>` with `aria-pressed`, or `.is-active` |
| Card list | `nv-list`, `nv-list--two` | one column; two from 860 px |
| Card | `nv-card`, `nv-card__link`, `__thumb`, `__body`, `__title`, `__excerpt`, `__meta`, `__meta-tag` | the whole card is one link |
| Thumbnail variants | `nv-card__thumb--square`, `nv-card__thumb--contain` | square for vertical sources; `contain` on a tile for logos and screenshots you do not control |
| Placeholder | `nv-ph`, `nv-ph-0` … `nv-ph-5` | a monogram on a gradient, for cards without an image |
| Lede | `nv-lede`, `__kicker`, `__title`, `__sub`, `nv-em` | the opening of a page |
| Section head | `nv-section`, `nv-section-head`, `__title`, `__link` | title, small link, hairline |
| Stats | `nv-stats`, `nv-stat`, `__value`, `__label` | use a `<dl>` |
| Bars | `nv-bars`, `nv-bar`, `__label`, `__track`, `__fill`, `__value` | width as an inline style |
| Form field | `nv-label`, `nv-input`, `nv-hint` | `<kbd>` is styled by the base layer |
| Pagination | `nv-pagination`, `__btn`, `__page` | hide a missing arrow with `aria-disabled="true"` |
| Panel | `nv-panel`, `__title`, `__text` | a centred call to action |
| Footer | `nv-footer`, `__cols`, `__title`, `__name`, `__text`, `__list`, `__link`, `__bottom` | three columns, two on tablets, one on phones |
| Utilities | `nv-skip-link`, `nv-sr-only` | skip link; text for screen readers only |

Naming is `nv-block`, `nv-block__part`, `nv-block--variant`, and `is-state` for states set by
script.

Breakpoints, written as plain media queries because custom properties cannot be used there:
560 px (phones), 780 px, 860 px (two columns of cards), 1050 px.

## Theming

Three rules, in this order:

1. `:root` is dark.
2. `@media (prefers-color-scheme: light)` applies light on `:root:not([data-theme="dark"])`.
3. `<html data-theme="light">` or `data-theme="dark"` wins over both.

So without any JavaScript the kit follows the system. The script and the `<head>` snippet in the
[quick start](#quick-start) only add a remembered choice.

To change the look, override tokens after the stylesheet:

```css
:root {
  --nv-accent: #4c8dff;
  --nv-accent-hover: #74a7ff;
  --nv-accent-soft: rgba(76, 141, 255, 0.12);
  --nv-accent-border: rgba(76, 141, 255, 0.35);
  --nv-accent-text: #a9c8ff;   /* text on accent-soft */
  --nv-on-accent: #04101f;     /* text on accent */
  --nv-radius-lg: 8px;
}
```

A colour changed for dark must be changed for light too. The light values live under two
selectors, so override both:

```css
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) { --nv-accent: #1d4fb8; /* … */ }
}
:root[data-theme="light"] { --nv-accent: #1d4fb8; /* … */ }
```

To use a different font, set `--nv-font-sans` and load your font yourself.

## JavaScript

`dist/nava-ui.js` is optional and has no dependencies. Load it with `defer`.

| Feature | How to turn it on | What it does |
|---|---|---|
| Theme toggle | `data-nv-theme-toggle` on a button | switches `data-theme` on `<html>`, stores the choice in `localStorage` under `nv-theme`, keeps the button's `aria-label` in sync |
| Card spotlight | `data-nv-spotlight` on a container of cards | writes the pointer position on `--nv-mx` and `--nv-my`; off for touch and for reduced motion |

From your own code:

```js
navaUI.theme();            // "dark" or "light": the theme in effect now
navaUI.setTheme('light');  // set and remember
document.addEventListener('nv:theme', function (event) {
  console.log(event.detail.theme);
});
```

For the toggle icon, put two SVGs in the button with the classes `nv-icon-sun` and `nv-icon-moon`:
the tokens show the one for the theme the button switches to. Both icons are in
[`index.html`](index.html).

## Accessibility

- Focus is always visible: a 2 px accent outline on links, buttons, inputs and `summary`.
- `prefers-reduced-motion: reduce` turns off transitions, the card lift and the spotlight.
- Card hover applies only to real pointers (`@media (hover: hover)`); touch gets an `:active`
  state, so a card does not stay highlighted after a tap.
- The nav has no menu to open: on small screens the links scroll sideways, and it works without
  JavaScript.
- A block that scrolls sideways (a wide `<pre>`, a table in a scrolling wrapper) needs
  `tabindex="0"`, or keyboard users cannot scroll it.
- What the kit cannot do for you: mark the current page (`aria-current="page"`), give filter chips
  `aria-pressed`, give icon-only buttons a label, and write `alt` text.

## Differences from the site

The kit is an extraction, with three deliberate changes:

- **1rem is 16 px.** The site sets `html` to 62.5 %, so there 1rem is 10 px. That is hostile to a
  page that embeds the kit, so every value was converted: the pixel results are the same.
- **Flat, prefixed classes.** The site styles its cards through selectors such as
  `.projects > .list > .item > .url`, tied to its templates. Here the same card is `.nv-card` with
  `.nv-card__link`, and so on.
- **Only what is reusable.** Site-specific pieces are left out: the rotating word in the home
  title, the scroll-driven reveals, view transitions, the YouTube thumbnail crops, syntax
  highlighting colours, comments.

### Staying in sync with the site

The kit and the site share their tokens by copy, for now. `scripts/site-drift.mjs` reads the
site's token file and reports every value that differs from the kit's, comparing lengths in
pixels (on the site 1rem is 10 px). A weekly workflow runs it and fails on drift.

```bash
npm run drift
```

## Development

How the kit is put together, and why, is in [ARCHITECTURE.md](ARCHITECTURE.md). Instructions for AI
coding agents are in [CLAUDE.md](CLAUDE.md).

Planned work is in [BACKLOG.md](BACKLOG.md); the GitHub issues and milestones are generated from
it.

The kit itself has no dependencies; the tests use Playwright. Edit `css/` and `js/`, then rebuild `dist/`:

```bash
./scripts/build.sh
```

Checks, the same ones CI runs on every push and pull request:

```bash
npm run contrast   # contrast of every text and background pair, both themes; no install needed
npm ci && npx playwright install chromium
npm test           # screenshots of every example (2 themes × 2 widths), accessibility, theme toggle
```

The screenshot baselines in `tests/__screenshots__/` are generated on the CI runner, so that
fonts and rendering match. After a deliberate visual change, run the `checks` workflow by hand
with "update snapshots", download the `screenshots` artifact and commit it:

```bash
gh workflow run checks.yml -f update_snapshots=true
gh run download <run-id> -n screenshots -D tests/__screenshots__
```

To look at the documentation page locally:

```bash
npm run serve
```

Rules for a change:

1. A new colour goes into `css/tokens.css` three times: `:root`, the light media query, and
   `:root[data-theme="light"]`. A colour that exists only in dark is invisible in light sooner or
   later.
2. Components use tokens only: no literal colours, sizes from the spacing and type scales.
3. Every new class gets a live example in `index.html` (which gives it a screenshot test) and a
   row in the table above. A new text and background pair gets a line in `scripts/contrast.mjs`.
4. Bump `VERSION`, add an entry to `CHANGELOG.md`, rebuild, tag `vX.Y.Z`: the CDN URL is the tag.

## License and credits

Code: [Apache License 2.0](LICENSE). See [NOTICE](NOTICE).

- The site this kit comes from started from the [Indigo](https://github.com/sergiokopplin/indigo)
  Jekyll theme by Sérgio Kopplin (MIT). The tokens and components here were written for the site's
  later redesign.
- [Inter](https://github.com/rsms/inter) by The Inter Project Authors, under the
  [SIL Open Font License 1.1](fonts/OFL.txt). The file in `fonts/` is a Latin subset of the
  variable font.
