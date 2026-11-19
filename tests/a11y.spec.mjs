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

  // The pointer is still where the Dismiss button was, and a toast under the
  // pointer keeps its timer stopped: move it away first.
  await page.mouse.move(0, 0);
  await page.evaluate(() => window.navaUI.toast('Gone soon.', { timeout: 300 }));
  await expect(region.locator('.nv-toast')).toHaveCount(1);
  await expect(region.locator('.nv-toast')).toHaveCount(0);

  await page.evaluate(() => window.navaUI.toast('<img src=x onerror=alert(1)>', { timeout: 0 }));
  await expect(region.locator('img')).toHaveCount(0);
});

test('a dialog opens as a modal, closes on Escape and outside, and gives the focus back', async ({ page }) => {
  await page.goto('/index.html');
  const opener = page.getByRole('button', { name: 'Open the dialog' });
  const dialog = page.locator('#doc-dialog');

  await opener.click();
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((el) => el.matches(':modal'))).toBe(true);
  // The browser moves the focus into the dialog: the first focusable is its close button.
  await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();

  // closedby="any": a click on the backdrop, outside the box, closes it.
  await opener.click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(dialog).toBeHidden();

  // The close button works without the script: it is in a <form method="dialog">.
  await opener.click();
  await dialog.getByRole('button', { name: 'Keep it' }).click();
  await expect(dialog).toBeHidden();
});

test('tabs select on click and move with the arrow keys, Home and End', async ({ page }) => {
  await page.goto('/index.html');
  const list = page.getByRole('tablist', { name: 'Deploy details' });
  const tab = (name) => list.getByRole('tab', { name });
  const panel = (n) => page.locator(`#doc-panel-${n}`);

  await tab('Logs').click();
  await expect(tab('Logs')).toHaveAttribute('aria-selected', 'true');
  await expect(tab('Overview')).toHaveAttribute('aria-selected', 'false');
  await expect(panel(2)).toBeVisible();
  await expect(panel(1)).toBeHidden();

  await page.keyboard.press('ArrowRight');
  await expect(tab('Settings')).toBeFocused();
  await expect(panel(3)).toBeVisible();

  await page.keyboard.press('ArrowRight');
  await expect(tab('Overview')).toBeFocused();
  await expect(panel(1)).toBeVisible();

  await page.keyboard.press('End');
  await expect(tab('Settings')).toBeFocused();
  await page.keyboard.press('Home');
  await expect(tab('Overview')).toBeFocused();

  // One tab in the tab order: Tab leaves the list and goes to the panel.
  await expect(list.locator('[tabindex="0"]')).toHaveCount(1);
  await page.keyboard.press('Tab');
  await expect(panel(1)).toBeFocused();
});

test('a table row is selected by its checkbox, and the table box takes the focus', async ({ page }) => {
  await page.goto('/index.html');
  const box = page.getByRole('region', { name: 'Regions' });
  await box.focus();
  await expect(box).toBeFocused();

  const row = page.getByRole('row', { name: /eu-south-1/ });
  const bg = () => row.evaluate((el) => getComputedStyle(el).backgroundColor);
  const before = await bg();
  // The row's background has a short transition: wait for it to settle.
  await row.getByRole('checkbox', { name: 'Select eu-south-1' }).check();
  await expect.poll(bg).not.toBe(before);
  await row.getByRole('checkbox', { name: 'Select eu-south-1' }).uncheck();
  await page.mouse.move(0, 0);
  await expect.poll(bg).toBe(before);
});

test('a code block gets a copy button that copies its code and says so', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/index.html');
  // Every code block of the page has one, the printed sources included.
  const blocks = await page.locator('main pre').count();
  await expect(page.locator('main .nv-code > pre')).toHaveCount(blocks);
  await expect(page.locator('main .nv-code__copy')).toHaveCount(blocks);

  const block = page.locator('.nv-code', { has: page.locator('pre[data-nv-copy]') });
  const button = block.getByRole('button', { name: 'Copy' });
  await button.focus();
  await expect(button).toHaveCSS('opacity', '1');
  await button.press('Enter');
  await expect(button).toHaveText('Copied');
  await expect(block.getByRole('status')).toHaveText('Copied to the clipboard');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('npm install @allan_nava/nava-ui');
  await expect(button).toHaveText('Copy', { timeout: 3000 });
  await expect(block.getByRole('status')).toHaveText('');
});

// The page templates are whole pages, so here every rule is on, the structure ones included.
for (const name of ['landing', 'listing', 'app']) {
  test(`example page ${name}: no accessibility violations`, async ({ page }) => {
    await page.goto(`/examples/${name}.html`);
    await page.evaluate(() => document.fonts.ready);
    const results = await new AxeBuilder({ page }).analyze();
    const summary = results.violations.map((v) => ({
      rule: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target.join(' ')),
    }));
    expect(summary).toEqual([]);
  });
}

test('the listing example filters by kind and by search, and says when nothing matches', async ({ page }) => {
  await page.goto('/examples/listing.html');
  const cards = page.locator('[data-filter-list] .nv-card:visible');
  await expect(cards).toHaveCount(8);
  await page.getByRole('button', { name: /Metrics/ }).click();
  await expect(cards).toHaveCount(2);
  await page.getByLabel('Search').fill('zzz');
  await expect(cards).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'No integration matches' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear the filters' }).click();
  await expect(cards).toHaveCount(8);
});
