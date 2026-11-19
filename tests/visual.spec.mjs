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

// Each example is screenshotted ALONE: everything else in <main> is hidden,
// so the example always sits at the same place on the page. Screenshotted in
// place, an example's position depended on everything above it, and a new
// example higher up moved the others by a fraction of a pixel, which rounded
// their heights one pixel differently and failed baselines nobody had touched.
const ALONE = `
  html.shot body > .nv-nav { display: none; }
  html.shot main > *:not(:has(.is-shot)) { display: none; }
  html.shot main > section:has(.is-shot) > *:not(.is-shot) { display: none; }
  html.shot main > section:has(.is-shot) { margin: 0; }
`;

test('every example matches its baseline', async ({ page }) => {
  await page.addStyleTag({ content: ALONE });

  const demos = page.locator('[data-demo]');
  const count = await demos.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const demo = demos.nth(i);
    const title = await demo.evaluate((el) => {
      let node = el.previousElementSibling;
      while (node && node.tagName !== 'H3') node = node.previousElementSibling;
      document.documentElement.classList.add('shot');
      document.querySelectorAll('.is-shot').forEach((other) => other.classList.remove('is-shot'));
      el.classList.add('is-shot');
      window.scrollTo(0, 0);
      return node ? node.textContent : 'untitled';
    });
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

// The page templates (NV-30): each one whole, in both themes and both widths, and never
// wider than the screen. They load the motion module (NV-33), so they are shot with reduced
// motion: a scroll reveal would leave the cards below the fold half faded.
for (const name of ['landing', 'listing', 'app']) {
  test(`example page: ${name}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/examples/${name}.html`);
    await page.evaluate(() => document.fonts.ready);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await expect(page).toHaveScreenshot(`example-${name}.png`, { fullPage: true });
  });
}
