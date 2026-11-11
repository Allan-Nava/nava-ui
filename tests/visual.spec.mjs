import { test, expect } from '@playwright/test';

// One screenshot per live example of the documentation page, named after the
// heading above it. A new example gets a baseline the first time the
// "update snapshots" workflow runs; a changed one fails until it is updated.

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => document.fonts.ready);
});

test('every example matches its baseline', async ({ page }) => {
  // The page's own nav is sticky: on an example taller than the viewport it
  // would be drawn over the top of the screenshot.
  await page.addStyleTag({ content: 'body > .nv-nav { visibility: hidden; }' });

  const demos = page.locator('[data-demo]');
  const count = await demos.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const demo = demos.nth(i);
    const title = await demo.evaluate((el) => {
      let node = el.previousElementSibling;
      while (node && node.tagName !== 'H3') node = node.previousElementSibling;
      return node ? node.textContent : 'untitled';
    });
    await demo.scrollIntoViewIfNeeded();
    await expect.soft(demo).toHaveScreenshot(`${slug(title)}.png`);
  }
});

test('page top: nav and lede', async ({ page }) => {
  await expect(page).toHaveScreenshot('page-top.png');
});

test('tokens: colour swatches', async ({ page }) => {
  await expect(page.locator('.doc-swatches')).toHaveScreenshot('swatches.png');
});

test('nothing overflows the viewport sideways', async ({ page }) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
