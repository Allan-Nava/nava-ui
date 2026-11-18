#!/usr/bin/env bash
# Builds dist/ from css/ and js/: it concatenates, then minifies with esbuild, the one dev
# dependency (pinned to an exact version, so CI builds the same bytes). Run `npm ci` first.
set -euo pipefail
cd "$(dirname "$0")/.."

version="$(cat VERSION)"
banner="/*! nava-ui v${version} | Apache-2.0 | https://github.com/Allan-Nava/nava-ui */"

mkdir -p dist
{
  echo "$banner"
  cat css/tokens.css css/base.css css/components.css
} > dist/nava-ui.css

# Components and tokens only, for pages that keep their own typography.
{
  echo "$banner"
  cat css/tokens.css css/components.css
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
