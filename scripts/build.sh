#!/usr/bin/env bash
# Builds dist/ from css/ and js/. No dependencies: it concatenates.
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

echo "dist/ built for v${version}"
wc -c dist/*
