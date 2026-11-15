#!/usr/bin/env node
// Renders the images made from HTML sources:
//   assets/social-preview.html  ->  assets/social-preview.png  (1280×640)
//
// Uses the Chromium of @playwright/test, already a dev dependency for the tests.
// Run it where Playwright's browser works: locally after `npx playwright install chromium`,
// or in CI with the "assets" workflow, which uploads the result as an artifact.
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const root = new URL('..', import.meta.url);
const jobs = [
  { source: 'assets/social-preview.html', target: 'assets/social-preview.png', width: 1280, height: 640 },
];

const browser = await chromium.launch();
for (const job of jobs) {
  const page = await browser.newPage({ viewport: { width: job.width, height: job.height }, deviceScaleFactor: 1 });
  await page.goto(new URL(job.source, root).href);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: fileURLToPath(new URL(job.target, root)) });
  console.log(`${job.source} -> ${job.target} (${job.width}×${job.height})`);
  await page.close();
}
await browser.close();
