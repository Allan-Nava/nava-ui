#!/usr/bin/env node
// Writes the kit's tokens in the dialect of allan-nava.github.io, so the site can read
// them instead of keeping its own copy (NV-12; the site switches over in NV-13).
//
//   node scripts/export-site.mjs                    write dist/tokens.site.scss
//   node scripts/export-site.mjs --check <file>     also compare with a tokens.scss of the
//                                                   site, a path or an https URL; exit 1 on
//                                                   any difference
//
// The dialect, decided by the site and not by the kit:
//   - names: --nv-bg -> --color-bg for every token that changes with the theme, except
//     shadows and the toggle's icons, which the site names --shadow-* and --icon-*;
//     --nv-space-4 -> --space-4 for the others; --nv-width-wide -> --width-listing
//   - lengths: the site sets html to 62.5 %, so its rem is 10 px: every rem is × 1.6
//   - shape: Sass mixins, because the site applies each palette in three places
//
// What the file holds:
//   @mixin palette-dark, palette-light  the colours, the shadows, the toggle's icons
//   @mixin scale                        spacing, radius, motion, type, layout
//   @mixin nv-aliases                   --nv-* pointing at the site's names, so the kit's
//                                       components work on the site without a second set
//                                       of values (NV-37)
//
// What stays in the site: tokens the kit has no component for, today the 17 syntax
// highlighting colours (--syn-*) and --color-inset-line-strong. The site keeps them in
// its own mixins, included next to these.
//
// No dependencies.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const root = new URL('..', import.meta.url);
const version = readFileSync(new URL('VERSION', root), 'utf8').trim();
const strip = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const css = strip(readFileSync(new URL('css/tokens.css', root), 'utf8'));

function body(text, header) {
  const start = text.indexOf(header);
  if (start === -1) throw new Error(`not found: ${header}`);
  const open = text.indexOf('{', start + header.length - 1);
  let depth = 1;
  let i = open + 1;
  for (; depth > 0 && i < text.length; i++) {
    if (text[i] === '{') depth++;
    if (text[i] === '}') depth--;
  }
  return text.slice(open + 1, i - 1);
}

function declarations(text) {
  const out = new Map();
  for (const [, name, value] of text.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    out.set(name, value.replace(/\s+/g, ' ').trim());
  }
  return out;
}

const dark = declarations(body(css, ':root {'));
const light = declarations(body(css, ':root[data-theme="light"]'));
const themed = new Set(light.keys());
// A theme-independent token that only points at a themed one (--nv-success:
// var(--nv-accent)) is still a colour, and takes a colour's name on the site.
const colourLike = new Set(themed);
for (const [name, value] of dark) {
  const ref = value.match(/^var\((--nv-[a-z0-9-]+)\)$/);
  if (ref && themed.has(ref[1])) colourLike.add(name);
}

// --nv-<rest> -> the site's name
function siteName(name) {
  const rest = name.replace(/^--nv-/, '');
  if (colourLike.has(name)) {
    return /^(shadow|icon)-/.test(rest) ? `--${rest}` : `--color-${rest}`;
  }
  if (rest === 'width-wide') return '--width-listing';
  return `--${rest}`;
}

const round = (n) => String(+n.toFixed(4));
function siteValue(value) {
  return value
    .replace(/(-?\d*\.?\d+)rem\b/g, (_, n) => `${round(parseFloat(n) * 1.6)}rem`)
    .replace(/var\((--nv-[a-z0-9-]+)\)/g, (_, ref) => `var(${siteName(ref)})`);
}

function block(name, entries, extra = []) {
  const lines = [...extra, ...entries.map(([k, v]) => `${siteName(k)}: ${siteValue(v)};`)];
  return `@mixin ${name} {\n${lines.map((l) => `\t${l}`).join('\n')}\n}\n`;
}

const palette = (map) => [...map].filter(([k]) => themed.has(k));
const scale = [...dark].filter(([k]) => !themed.has(k));
const aliases = [...dark.keys()].map((k) => [k, `var(${siteName(k)})`]);

const out = `// GENERATED from nava-ui v${version} (css/tokens.css) by scripts/export-site.mjs.
// Do not edit: change the kit and export again. https://github.com/Allan-Nava/nava-ui
//
// The kit's tokens in the dialect of allan-nava.github.io: the site's names, its 10 px rem,
// and mixins, because the site applies each palette in three places (dark by default, light
// from the system unless dark was chosen, the explicit choice last). The site keeps its own
// tokens (syntax highlighting, --color-inset-line-strong) in its own mixins.

${block('palette-dark', palette(dark), ['color-scheme: dark;'])}
${block('palette-light', palette(light), ['color-scheme: light;'])}
${block('scale', scale)}
// The kit's names, pointing at the site's: the kit's components read --nv-*, so with this
// on :root they take the site's values, theme included, without a second copy.
@mixin nv-aliases {
${aliases.map(([k, v]) => `\t${k}: ${v};`).join('\n')}
}
`;

mkdirSync(new URL('dist/', root), { recursive: true });
const target = new URL('dist/tokens.site.scss', root);
writeFileSync(target, out);
console.log(`dist/tokens.site.scss: ${palette(dark).length} themed tokens, ${scale.length} scale tokens, ${aliases.length} aliases`);

// --check: every token the site declares must come out of the export with the same value
const i = process.argv.indexOf('--check');
if (i !== -1) {
  const source = process.argv[i + 1];
  const siteText = source.startsWith('https://')
    ? await fetch(source).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} for ${source}`);
        return r.text();
      })
    : readFileSync(source, 'utf8');
  const site = strip(siteText);
  const exported = strip(out);

  const pairs = [
    ['palette-dark', body(site, '@mixin palette-dark'), body(exported, '@mixin palette-dark')],
    ['palette-light', body(site, '@mixin palette-light'), body(exported, '@mixin palette-light')],
    ['scale', body(site, ':root {'), body(exported, '@mixin scale')],
  ];

  let differ = 0;
  const siteOnly = [];
  for (const [label, siteBody, exportBody] of pairs) {
    const want = declarations(siteBody);
    const got = declarations(exportBody);
    for (const [name, value] of want) {
      if (!got.has(name)) {
        siteOnly.push(name);
        continue;
      }
      if (got.get(name) !== value) {
        differ++;
        console.log(`DIFF [${label}] ${name}: site "${value}", export "${got.get(name)}"`);
      }
    }
  }
  const unique = [...new Set(siteOnly)];
  console.log(`site-only tokens (${unique.length}), kept by the site: ${unique.join(', ')}`);
  if (differ) {
    console.error(`${differ} value(s) differ between the site and the export.`);
    process.exit(1);
  }
  console.log('Every token the site shares with the kit comes out of the export with the same value.');
}

