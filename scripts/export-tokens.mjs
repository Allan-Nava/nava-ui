#!/usr/bin/env node
// Writes the kit's tokens for projects that do not write plain CSS (NV-29), from css/tokens.css,
// which is itself generated from src/tokens.css:
//
//   dist/tokens.dark.json    the Design Tokens format (DTCG, 2025.10): every token with the
//   dist/tokens.light.json   dark or the light palette; the scale is the same in both
//   dist/tailwind.css        Tailwind v4: an `@theme inline` block naming the kit's tokens
//   dist/tailwind.preset.cjs Tailwind v3: a preset with the same names
//
// The two Tailwind files never copy a value: they point at the kit's custom properties
// (var(--nv-…)), so the page still needs the kit's tokens (dist/nava-ui.css or css/tokens.css)
// and the theme keeps switching with them. The JSON files carry the values themselves, for
// tools such as Style Dictionary that build their own outputs.
//
// What the JSON cannot say exactly is kept, not guessed: a fluid size (clamp()), a length in
// ch, a shadow with several layers — their $value is the closest plain value and the CSS is in
// $extensions["dev.nava-ui"].css.
//
// No dependencies. Run by scripts/build.sh.

import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('..', import.meta.url);
const version = readFileSync(new URL('VERSION', root), 'utf8').trim();
const css = readFileSync(new URL('css/tokens.css', root), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

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
  for (const [, name, value] of text.matchAll(/--nv-([a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    out.set(name, value.replace(/\s+/g, ' ').trim());
  }
  return out;
}

const dark = declarations(body(css, ':root {'));
const light = declarations(body(css, ':root[data-theme="light"]'));
const themed = new Set(light.keys());

// --- where each token goes: [group, key] ------------------------------------
const GROUPS = [
  [/^space-(.+)$/, 'spacing'],
  [/^radius-(.+)$/, 'radius'],
  [/^dur-(.+)$/, 'duration'],
  [/^dur$/, 'duration', 'default'],
  [/^ease-(.+)$/, 'easing'],
  [/^ease$/, 'easing', 'default'],
  [/^font-(.+)$/, 'font-family'],
  [/^text-(.+)$/, 'font-size'],
  [/^leading-(.+)$/, 'line-height'],
  [/^leading$/, 'line-height', 'default'],
  [/^tracking-(.+)$/, 'letter-spacing'],
  [/^shadow-(.+)$/, 'shadow'],
  [/^(measure|width-.+|nav-height)$/, 'size'],
];

function place(name) {
  if (name.startsWith('icon-')) return null; // the theme toggle's internals
  for (const [re, group, key] of GROUPS) {
    const m = name.match(re);
    if (m) return [group, key ?? m[1]];
  }
  return ['color', name]; // the palette, and the colours that point at it (success → accent)
}

// --- values ------------------------------------------------------------------
const round = (n) => +n.toFixed(4);

function colour(value) {
  let m = value.match(/^#([0-9a-f]{6})$/i);
  if (m) {
    const c = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
    return { colorSpace: 'srgb', components: c.map((x) => round(x / 255)), alpha: 1, hex: `#${m[1].toLowerCase()}` };
  }
  m = value.match(/^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\s*\)$/);
  if (m) {
    const c = [m[1], m[2], m[3]].map(Number);
    const hex = '#' + c.map((x) => x.toString(16).padStart(2, '0')).join('');
    return { colorSpace: 'srgb', components: c.map((x) => round(x / 255)), alpha: m[4] === undefined ? 1 : +m[4], hex };
  }
  return null;
}

function dimension(value) {
  const m = value.match(/^(-?[\d.]+)(px|rem|em)$/);
  return m ? { value: +m[1], unit: m[2] } : null;
}

const ref = (value) => {
  const m = value.match(/^var\(--nv-([a-z0-9-]+)\)$/);
  if (!m) return null;
  const p = place(m[1]);
  return p ? `{${p[0]}.${p[1]}}` : null;
};

const exact = (css) => ({ 'dev.nava-ui': { css } });

function token(group, value) {
  const alias = ref(value);
  if (alias) return { $value: alias };
  switch (group) {
    case 'color': {
      const c = colour(value);
      if (c) return { $type: 'color', $value: c };
      break;
    }
    case 'spacing':
    case 'radius':
    case 'letter-spacing':
    case 'size': {
      const d = dimension(value);
      if (d) return { $type: 'dimension', $value: d };
      const ch = value.match(/^([\d.]+)ch$/);
      // 1ch is about half an em in a sans-serif text face
      if (ch) return { $type: 'dimension', $value: { value: round(+ch[1] * 0.5), unit: 'em' }, $extensions: exact(value) };
      break;
    }
    case 'font-size': {
      const d = dimension(value);
      if (d) return { $type: 'dimension', $value: d };
      const clamp = value.match(/^clamp\((-?[\d.]+)rem,.*,\s*(-?[\d.]+)rem\)$/);
      if (clamp) return { $type: 'dimension', $value: { value: +clamp[1], unit: 'rem' }, $description: `fluid, from ${clamp[1]}rem to ${clamp[2]}rem`, $extensions: exact(value) };
      break;
    }
    case 'duration': {
      const m = value.match(/^([\d.]+)ms$/);
      if (m) return { $type: 'duration', $value: { value: +m[1], unit: 'ms' } };
      break;
    }
    case 'easing': {
      const m = value.match(/^cubic-bezier\(([^)]+)\)$/);
      if (m) return { $type: 'cubicBezier', $value: m[1].split(',').map((x) => +x.trim()) };
      break;
    }
    case 'font-family':
      return { $type: 'fontFamily', $value: value.split(/,\s*/).map((f) => f.replace(/^"|"$/g, '')) };
    case 'line-height':
      if (/^[\d.]+$/.test(value)) return { $type: 'number', $value: +value };
      break;
    case 'shadow': {
      const m = value.match(/^(-?[\d.]+)(?:px)? (-?[\d.]+)px (-?[\d.]+)px (rgba?\([^)]+\))$/);
      if (m) {
        return {
          $type: 'shadow',
          $value: { color: colour(m[4]), offsetX: { value: +m[1], unit: 'px' }, offsetY: { value: +m[2], unit: 'px' }, blur: { value: +m[3], unit: 'px' }, spread: { value: 0, unit: 'px' } },
        };
      }
      break;
    }
  }
  throw new Error(`--nv-…: no Design Tokens form for "${value}" in group ${group}; add one to scripts/export-tokens.mjs`);
}

function tree(palette) {
  const out = {
    $description: `nava-ui v${version}, ${palette === light ? 'light' : 'dark'} theme. Generated from src/tokens.css by scripts/export-tokens.mjs.`,
  };
  for (const [name] of dark) {
    const p = place(name);
    if (!p) continue;
    const value = themed.has(name) ? palette.get(name) : dark.get(name);
    (out[p[0]] ??= {})[p[1]] = token(p[0], value);
  }
  return out;
}

const write = (file, text) => writeFileSync(new URL(`dist/${file}`, root), text);
write('tokens.dark.json', JSON.stringify(tree(dark), null, 2) + '\n');
write('tokens.light.json', JSON.stringify(tree(light), null, 2) + '\n');

// --- Tailwind -------------------------------------------------------------------
// Tailwind's namespace for each group, and the prefix that keeps the kit's names apart from
// Tailwind's own (bg-nv-surface, p-nv-4, rounded-nv-lg).
const TW = {
  color: ['color', 'colors'],
  spacing: ['spacing', 'spacing'],
  radius: ['radius', 'borderRadius'],
  'font-family': ['font', 'fontFamily'],
  'font-size': ['text', 'fontSize'],
  'line-height': ['leading', 'lineHeight'],
  'letter-spacing': ['tracking', 'letterSpacing'],
  shadow: ['shadow', 'boxShadow'],
  easing: ['ease', 'transitionTimingFunction'],
  duration: [null, 'transitionDuration'],
};

const v4 = [];
const v3 = {};
for (const [name] of dark) {
  const p = place(name);
  if (!p || !TW[p[0]]) continue;
  const [ns, key] = TW[p[0]];
  const label = `nv-${p[1]}`;
  if (ns) v4.push(`  --${ns}-${label}: var(--nv-${name});`);
  (v3[key] ??= {})[label] = `var(--nv-${name})`;
}

write('tailwind.css', `/* nava-ui v${version} for Tailwind CSS v4 — generated by scripts/export-tokens.mjs.
   Import it after Tailwind and load the kit's tokens too (dist/nava-ui.css, or css/tokens.css):
   every name points at a --nv-* property, so the classes follow the kit's theme.
     @import "tailwindcss";
     @import "@allan_nava/nava-ui/dist/tailwind.css";
   Then bg-nv-surface, text-nv-fg-muted, p-nv-4, rounded-nv-lg, shadow-nv-md, ease-nv-out. */
@theme inline {
${v4.join('\n')}
}
`);

write('tailwind.preset.cjs', `// nava-ui v${version} for Tailwind CSS v3 — generated by scripts/export-tokens.mjs.
// A preset: presets: [require('@allan_nava/nava-ui/dist/tailwind.preset.cjs')] in tailwind.config.js.
// Every value points at a --nv-* property, so load the kit's tokens too (dist/nava-ui.css or
// css/tokens.css); the classes then follow the kit's theme. Colours given as var() do not take
// Tailwind's opacity modifiers (bg-nv-accent/50): the kit has soft variants for that.
module.exports = {
  theme: {
    extend: ${JSON.stringify(v3, null, 2).replace(/\n/g, '\n    ')},
  },
};
`);

console.log(`dist/tokens.{dark,light}.json, dist/tailwind.css (${v4.length} names), dist/tailwind.preset.cjs`);
