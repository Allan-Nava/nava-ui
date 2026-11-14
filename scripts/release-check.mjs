#!/usr/bin/env node
// Checks that a release tag and the files at that tag agree, and writes the
// release notes. Used by .github/workflows/release.yml; runs locally too.
//
//   node scripts/release-check.mjs <tag> [--dir <checkout>] [--notes <file>]
//
//   <tag>       vX.Y.Z
//   --dir       the checkout of that tag (default: the repository this script is in)
//   --notes     where to write the release notes (default: print them)
//
// What must agree with the tag:
//   - VERSION
//   - the "version" of package.json, when the file exists (it does from 0.2.0)
//   - every CDN URL in README.md and index.html (nava-ui@vX.Y.Z)
//   - a "## X.Y.Z" section in CHANGELOG.md, with something in it
//
// When GITHUB_OUTPUT is set it also writes:
//   version=X.Y.Z
//   publish=true|false   true only when package.json exists and is not private:
//                        the npm job of the release workflow waits for that (NV-23)
//
// No dependencies. Exit code 1 when something disagrees.

import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const tag = args[0];
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const dir = option('--dir', fileURLToPath(new URL('..', import.meta.url)));
const notesPath = option('--notes', null);

if (!tag || !/^v\d+\.\d+\.\d+$/.test(tag)) {
  console.error('usage: node scripts/release-check.mjs vX.Y.Z [--dir <checkout>] [--notes <file>]');
  process.exit(2);
}

const version = tag.slice(1);
const read = (file) => readFileSync(join(dir, file), 'utf8');
const problems = [];

// VERSION
const fileVersion = read('VERSION').trim();
if (fileVersion !== version) problems.push(`VERSION says ${fileVersion}, the tag says ${version}`);

// package.json
let publish = false;
const checked = ['VERSION'];
if (existsSync(join(dir, 'package.json'))) {
  const pkg = JSON.parse(read('package.json'));
  if (pkg.version !== version) problems.push(`package.json says ${pkg.version}, the tag says ${version}`);
  publish = pkg.private !== true;
  checked.push('package.json');
}

// CDN URLs: every pinned URL must name this tag
for (const file of ['README.md', 'index.html']) {
  if (!existsSync(join(dir, file))) continue;
  const pinned = [...read(file).matchAll(/nava-ui@(v[\w.-]+)/g)].map((m) => m[1]);
  const wrong = [...new Set(pinned.filter((v) => v !== tag))];
  if (pinned.length === 0) problems.push(`${file} has no CDN URL pinned to a tag`);
  if (wrong.length) problems.push(`${file} pins ${wrong.join(', ')} in its CDN URLs instead of ${tag}`);
}

// CHANGELOG section: from "## X.Y.Z" to the next "## "
const lines = read('CHANGELOG.md').split('\n');
const start = lines.findIndex((line) => new RegExp(`^## \\[?${version.replace(/\./g, '\\.')}\\]?(\\s|$)`).test(line));
let section = [];
if (start === -1) {
  problems.push(`CHANGELOG.md has no "## ${version}" section`);
} else {
  const end = lines.findIndex((line, i) => i > start && line.startsWith('## '));
  section = lines.slice(start + 1, end === -1 ? undefined : end);
  while (section.length && !section[0].trim()) section.shift();
  while (section.length && !section[section.length - 1].trim()) section.pop();
  if (section.length === 0) problems.push(`the "## ${version}" section of CHANGELOG.md is empty`);
}

if (problems.length) {
  for (const p of problems) console.error(`FAIL ${p}`);
  process.exit(1);
}

const cdn = `https://cdn.jsdelivr.net/gh/Allan-Nava/nava-ui@${tag}/dist`;
const notes = `${section.join('\n')}

## Use this version

\`\`\`html
<link rel="stylesheet" href="${cdn}/nava-ui.css">
<script defer src="${cdn}/nava-ui.js"></script>
\`\`\`

The files attached below are the same \`dist/\` files.
`;

if (notesPath) writeFileSync(notesPath, notes);
else process.stdout.write(notes);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\npublish=${publish}\n`);
}

console.error(`ok — ${tag} agrees with ${checked.join(', ')}, the CDN URLs and CHANGELOG.md` +
  (publish ? '; the package is public, npm publish will run' : '; the package is private, no npm publish'));
