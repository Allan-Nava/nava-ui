#!/usr/bin/env bash
# Builds css/tokens.css from src/tokens.css, then dist/ from css/ and js/: it concatenates, then minifies with esbuild, the one dev
# dependency (pinned to an exact version, so CI builds the same bytes). Run `npm ci` first.
set -euo pipefail
cd "$(dirname "$0")/.."

version="$(cat VERSION)"
banner="/*! nava-ui v${version} | Apache-2.0 | https://github.com/Allan-Nava/nava-ui */"

mkdir -p dist

# css/tokens.css is generated from src/tokens.css, with the light palette written twice
# (NV-28): first, because everything below reads it.
node scripts/build-tokens.mjs

# Cascade layers (NV-25): each source goes in its own layer of `nv`, so any rule of the
# host page that is not in a layer wins over the kit, whatever its specificity. The order
# statement comes first and fixes the order: tokens, then base, then components. Only
# dist/ is layered: css/ stays plain, and so does the export for the site
# (scripts/export-site.mjs reads css/), whose own rules are not in layers.
layer() { printf '\n@layer %s {\n' "$1"; cat "$2"; printf '}\n'; }
{
  echo "$banner"
  echo "@layer nv.tokens, nv.base, nv.components;"
  layer nv.tokens css/tokens.css
  layer nv.base css/base.css
  layer nv.components css/components.css
} > dist/nava-ui.css

# Components and tokens only, for pages that keep their own typography.
{
  echo "$banner"
  echo "@layer nv.tokens, nv.base, nv.components;"
  layer nv.tokens css/tokens.css
  layer nv.components css/components.css
} > dist/nava-ui.components.css

{
  echo "$banner"
  cat js/nava-ui.js
} > dist/nava-ui.js

# Minified copies, same content: esbuild keeps the /*! banner (a legal comment). The
# CDN and npm serve both; the readable files stay the ones the docs point at.
ESBUILD=node_modules/.bin/esbuild
[ -x "$ESBUILD" ] || { echo "build: esbuild is missing — run npm ci" >&2; exit 1; }
for f in nava-ui.css nava-ui.components.css nava-ui.js; do
  "$ESBUILD" "dist/$f" --minify --legal-comments=inline --log-level=warning \
    --outfile="dist/${f%.*}.min.${f##*.}"
done

# The tokens in the dialect of allan-nava.github.io (Sass mixins, 10 px rem).
node scripts/export-site.mjs

echo "dist/ built for v${version}"
wc -c dist/*.css dist/*.js dist/*.scss
echo "gzip:"; for f in dist/*.min.css dist/*.min.js; do printf "%8d %s\n" "$(gzip -9c "$f" | wc -c)" "$f"; done
