#!/usr/bin/env node
// Writes css/tokens.css from src/tokens.css (NV-28). The source states the light palette once,
// on :root[data-theme="light"]; the output states it twice, because CSS has no mixins and the
// two selectors are what make "system preference, unless the user chose" work without
// JavaScript:
//
//   @media (prefers-color-scheme: light) { :root:not([data-theme="dark"]) { …light… } }
//   :root[data-theme="light"] { …light… }
//
// It refuses a source where a light token is missing from the dark :root (it would never
// change back in dark), or where the light block is missing or written twice.
//
//   node scripts/build-tokens.mjs           write css/tokens.css
//
// No dependencies. Run by scripts/build.sh before anything that reads css/tokens.css.

import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('..', import.meta.url);
const source = readFileSync(new URL('src/tokens.css', root), 'utf8');

const LIGHT = ':root[data-theme="light"] {';
const first = source.indexOf(LIGHT);
if (first === -1 || source.indexOf(LIGHT, first + 1) !== -1) {
  console.error('src/tokens.css: expected exactly one :root[data-theme="light"] block');
  process.exit(1);
}
const code = source.replace(/\/\*[\s\S]*?\*\//g, '');
if (/@media[^{]*prefers-color-scheme/.test(code)) {
  console.error('src/tokens.css: the media-query copy of the light palette is generated; remove it from the source');
  process.exit(1);
}

// The light block: from its selector to the matching brace.
const open = first + LIGHT.length;
let depth = 1;
let end = open;
for (; depth > 0 && end < source.length; end++) {
  if (source[end] === '{') depth++;
  if (source[end] === '}') depth--;
}
const body = source.slice(open, end - 1); // between the braces, newlines included

const names = (text) => new Set([...text.matchAll(/(--nv-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
const darkBlock = source.slice(source.indexOf(':root {'), first);
const missing = [...names(body)].filter((n) => !names(darkBlock).has(n));
if (missing.length) {
  console.error(`src/tokens.css: light tokens missing from the dark :root: ${missing.join(', ')}`);
  process.exit(1);
}

const indented = body.replace(/\n(?!\n|$)/g, '\n  ');
const media = `@media (prefers-color-scheme: light) {\n  :root:not([data-theme="dark"]) {${indented}  }\n}\n\n`;

const header = '/* GENERATED from src/tokens.css by scripts/build-tokens.mjs: edit the source, then run\n   ./scripts/build.sh. https://github.com/Allan-Nava/nava-ui */\n\n';
const out = header + source.slice(0, first) + media + source.slice(first);
writeFileSync(new URL('css/tokens.css', root), out);
console.log(`css/tokens.css: ${names(body).size} light tokens, written twice`);
