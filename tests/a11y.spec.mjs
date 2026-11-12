import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// The documentation page embeds fragments: a second <h1>, several <header>
// and <footer>. Those are right in a real page and wrong only because they sit
// side by side here, so the page-structure rules are off. Everything about the
// components themselves stays on: contrast, names, roles, ARIA.
const STRUCTURE = [
  'heading-order',
  'page-has-heading-one',
  'landmark-banner-is-top-level',
  'landmark-contentinfo-is-top-level',
  'landmark-no-duplicate-banner',
  'landmark-no-duplicate-contentinfo',
  'landmark-unique',
  'region',
];

test('no accessibility violations', async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => document.fonts.ready);

  const results = await new AxeBuilder({ page }).disableRules(STRUCTURE).analyze();
  const summary = results.violations.map((v) => ({
    rule: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.map((n) => n.target.join(' ')),
  }));
  expect(summary).toEqual([]);
});

test('the theme toggle switches and remembers the theme', async ({ page }) => {
  await page.goto('/index.html');
  const html = page.locator('html');
  const before = await page.evaluate(() => window.navaUI.theme());
  await page.locator('[data-nv-theme-toggle]').first().click();
  const after = before === 'dark' ? 'light' : 'dark';
  await expect(html).toHaveAttribute('data-theme', after);

  await page.reload();
  await expect(html).toHaveAttribute('data-theme', after);
});

test('a toast is announced, can be dismissed, and goes away by itself', async ({ page }) => {
  await page.goto('/index.html');

  await page.evaluate(() => window.navaUI.toast('Saved.', { tone: 'success', timeout: 0 }));
  const region = page.locator('.nv-toasts');
  await expect(region).toHaveAttribute('role', 'status');
  const toast = region.locator('.nv-toast');
  await expect(toast).toHaveText(/Saved\./);

  await toast.getByRole('button', { name: 'Dismiss' }).click();
  await expect(toast).toHaveCount(0);

  await page.evaluate(() => window.navaUI.toast('Gone soon.', { timeout: 300 }));
  await expect(region.locator('.nv-toast')).toHaveCount(1);
  await expect(region.locator('.nv-toast')).toHaveCount(0);

  await page.evaluate(() => window.navaUI.toast('<img src=x onerror=alert(1)>', { timeout: 0 }));
  await expect(region.locator('img')).toHaveCount(0);
});
