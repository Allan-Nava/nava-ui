#!/usr/bin/env node
// Compares the kit's tokens with the ones the site ships today.
//
// The kit was extracted from allan-nava.github.io, so until the site reads its
// tokens from the kit the two can drift apart. This script reads the site's
// token file from GitHub and reports every value that differs.
//
//   node scripts/site-drift.mjs            compare with the live file
//   node scripts/site-drift.mjs <path>     compare with a local tokens.scss
//
// The site sets `html { font-size: 62.5% }`, so there 1rem is 10px; the kit
// uses 16px. Lengths are compared in pixels. Fluid sizes (clamp) and fonts are
// not compared. No dependencies. Exit code 1 on drift.

import { readFileSync } from 'node:fs';

const SITE_URL =
  'https://raw.githubusercontent.com/Allan-Nava/Allan-Nava.github.io/master/_sass/base/tokens.scss';

const strip = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

function declarations(text) {
  const out = {};
  for (const [, name, value] of text.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    out[name] = value.replace(/\s+/g, ' ').trim();
  }
  return out;
}

function body(text, header) {
  const start = text.indexOf(header);
  if (start === -1) throw new Error(`not found: ${header}`);
  const open = text.indexOf('{', start);
  let depth = 1;
  let i = open + 1;
  for (; depth > 0 && i < text.length; i++) {
    if (text[i] === '{') depth++;
    if (text[i] === '}') depth--;
  }
  return text.slice(open + 1, i - 1);
}

// "--color-bg" → "--nv-bg", "--shadow-sm" → "--nv-shadow-sm"
const kitName = (siteName) => '--nv-' + siteName.replace(/^--(color-)?/, '');

// The site calls its widest container "listing"; the kit calls it "wide".
const RENAMED = { '--nv-width-listing': '--nv-width-wide' };

const px = (value, remPx) => {
  const m = value.match(/^(-?[\d.]+)(rem|px)$/);
  if (!m) return null;
  return Number(m[1]) * (m[2] === 'rem' ? remPx : 1);
};

function same(siteValue, kitValue) {
  if (siteValue === kitValue) return true;
  const a = px(siteValue, 10);
  const b = px(kitValue, 16);
  return a !== null && b !== null && Math.abs(a - b) < 0.01;
}

const source = process.argv[2];
const siteRaw = source
  ? readFileSync(source, 'utf8')
  : await fetch(SITE_URL).then((res) => {
      if (!res.ok) throw new Error(`cannot read the site's tokens: HTTP ${res.status}`);
      return res.text();
    });

const site = strip(siteRaw);
const kit = strip(readFileSync(new URL('../css/tokens.css', import.meta.url), 'utf8'));

const kitDark = declarations(body(kit, ':root {'));
const kitLight = declarations(body(kit, ':root[data-theme="light"]'));

const siteRoot = body(site, ':root {');
const comparisons = [
  ['dark', declarations(body(site, '@mixin palette-dark')), kitDark],
  ['light', declarations(body(site, '@mixin palette-light')), kitLight],
  ['shared', declarations(siteRoot), kitDark],
];

const SKIP = /^--(font-|text-(base|lg|xl|2xl|3xl|4xl)$)/;
let drift = 0;
const notInKit = new Set();

for (const [label, siteTokens, kitTokens] of comparisons) {
  for (const [name, siteValue] of Object.entries(siteTokens)) {
    if (SKIP.test(name)) continue;
    const mapped = kitName(name);
    const target = RENAMED[mapped] ?? mapped;
    if (!(target in kitTokens)) {
      notInKit.add(name);
      continue;
    }
    if (!same(siteValue, kitTokens[target])) {
      drift++;
      console.log(`DRIFT [${label}] ${name}: site "${siteValue}", kit ${target} "${kitTokens[target]}"`);
    }
  }
}

if (notInKit.size) {
  console.log(`\nIn the site only (${notInKit.size}), not part of the kit by design or not yet ported:`);
  console.log('  ' + [...notInKit].join(', '));
}

if (drift) {
  console.error(`\n${drift} token(s) differ between the site and the kit.`);
  process.exit(1);
}
console.log('\nNo drift: every token the kit shares with the site has the same value.');
