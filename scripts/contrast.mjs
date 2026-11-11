#!/usr/bin/env node
// Measures the WCAG contrast of every text/background pair the components use,
// in both themes, reading the values straight from css/tokens.css.
// Also checks that the two copies of the light palette are identical.
// No dependencies. Exit code 1 if a pair is under the threshold.

import { readFileSync } from 'node:fs';

const MIN = 6; // the bar the site set for itself; WCAG AA for body text is 4.5
// Comments are stripped first: they mention the selectors this script looks for.
const css = readFileSync(new URL('../css/tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

function block(selector) {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  const tokens = {};
  for (const [, name, value] of css.slice(open + 1, close).matchAll(/(--nv-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    tokens[name] = value.trim();
  }
  return tokens;
}

function parse(value) {
  let m = value.match(/^#([0-9a-f]{6})$/i);
  if (m) {
    const n = parseInt(m[1], 16);
    return { r: n >> 16, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  m = value.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const [r, g, b, a = 1] = m[1].split(',').map(Number);
    return { r, g, b, a };
  }
  throw new Error(`cannot parse colour: ${value}`);
}

// Paints `top` over an opaque `bottom`.
function over(top, bottom) {
  const mix = (t, b) => t * top.a + b * (1 - top.a);
  return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b), a: 1 };
}

function luminance({ r, g, b }) {
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// [text, background, ...layers under the background, bottom last].
// A translucent background is composited over the layers that follow it.
const PAIRS = [
  ['--nv-fg', '--nv-bg'],
  ['--nv-fg-strong', '--nv-bg'],
  ['--nv-fg-muted', '--nv-bg'],
  ['--nv-accent', '--nv-bg'],
  ['--nv-fg', '--nv-surface'],
  ['--nv-fg-strong', '--nv-surface'],
  ['--nv-fg-muted', '--nv-surface'],
  ['--nv-accent', '--nv-surface'],
  ['--nv-fg-strong', '--nv-surface-hover'],
  ['--nv-fg-muted', '--nv-surface-hover'],
  ['--nv-accent', '--nv-surface-hover'],
  ['--nv-accent-text', '--nv-accent-soft', '--nv-bg'],
  ['--nv-accent-text', '--nv-accent-soft', '--nv-surface'],
  ['--nv-on-accent', '--nv-accent'],
  ['--nv-on-accent', '--nv-accent-hover'],
  ['--nv-code-fg', '--nv-code-bg'],
  ['--nv-fg-muted', '--nv-glass', '--nv-bg'],
  ['--nv-fg-strong', '--nv-hover-overlay', '--nv-glass', '--nv-bg'],
  ['--nv-fg', '--nv-overlay-soft', '--nv-bg'],
];

// Edges and marks of controls: WCAG 1.4.11 asks 3:1 for the parts needed to
// identify a control. [mark or edge, what it sits on].
const UI_MIN = 3;
const UI_PAIRS = [
  ['--nv-border-control', '--nv-bg'],
  ['--nv-border-control', '--nv-surface'],
  ['--nv-accent', '--nv-bg'],
  ['--nv-accent', '--nv-surface'],
  ['--nv-on-accent', '--nv-accent'],
];

const dark = block(':root {');
const light = block(':root[data-theme="light"]');
const lightMedia = block(':root:not([data-theme="dark"])');

let failed = false;

for (const name of new Set([...Object.keys(light), ...Object.keys(lightMedia)])) {
  if (light[name] !== lightMedia[name]) {
    console.error(`MISMATCH ${name}: "${lightMedia[name]}" in the media query, "${light[name]}" under [data-theme="light"]`);
    failed = true;
  }
}

for (const name of Object.keys(light)) {
  if (!(name in dark)) {
    console.error(`MISSING ${name} is defined for light but not for dark`);
    failed = true;
  }
}

for (const [theme, tokens] of [['dark', dark], ['light', light]]) {
  console.log(`\n${theme}`);
  for (const [text, ...layers] of PAIRS) {
    const background = layers
      .map((name) => parse(tokens[name]))
      .reduceRight((bottom, top) => over(top, bottom));
    const value = ratio(parse(tokens[text]), background);
    const ok = value >= MIN;
    if (!ok) failed = true;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${value.toFixed(1).padStart(5)}:1  ${text} on ${layers.join(' over ')}`);
  }
  for (const [mark, under] of UI_PAIRS) {
    const value = ratio(parse(tokens[mark]), parse(tokens[under]));
    const ok = value >= UI_MIN;
    if (!ok) failed = true;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${value.toFixed(1).padStart(5)}:1  ${mark} against ${under} (control, min ${UI_MIN}:1)`);
  }
}

if (failed) {
  console.error(`\nSome pairs are under their minimum (${MIN}:1 for text, ${UI_MIN}:1 for controls), or the palettes are out of sync.`);
  process.exit(1);
}
console.log(`\nAll text pairs are at ${MIN}:1 or better and all control pairs at ${UI_MIN}:1 or better, in both themes.`);
