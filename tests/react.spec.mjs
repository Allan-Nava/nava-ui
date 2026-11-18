import { test, expect } from '@playwright/test';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { renameSync, writeFileSync } from 'node:fs';

// @allan_nava/nava-ui-react's behaviour in a browser: the tab keys and the native dialog. The fixture is
// bundled from the package's TypeScript sources, so the test needs no build of the package.
// Every worker builds it; each writes a file of its own and renames it into place, so a page
// never loads a bundle another worker is halfway through writing.
test.beforeAll(async () => {
  const out = fileURLToPath(new URL('react/fixture.js', import.meta.url));
  const result = await build({
    entryPoints: [fileURLToPath(new URL('react/fixture.jsx', import.meta.url))],
    bundle: true,
    minify: true,
    write: false,
    jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'warning',
  });
  const tmp = `${out}.${process.pid}.tmp`;
  writeFileSync(tmp, result.outputFiles[0].contents);
  renameSync(tmp, out);
});

test('React Tabs: click, arrows with wrap, Home and End, one tab in the tab order', async ({ page }) => {
  await page.goto('/tests/react/fixture.html');
  const list = page.getByRole('tablist', { name: 'React tabs' });
  const tab = (name) => list.getByRole('tab', { name });

  await tab('Two').click();
  await expect(tab('Two')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('Second panel')).toBeVisible();
  await expect(page.getByText('First panel')).toBeHidden();

  await page.keyboard.press('ArrowRight');
  await expect(tab('Three')).toBeFocused();
  await expect(page.getByText('Third panel')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(tab('One')).toBeFocused();
  await page.keyboard.press('End');
  await expect(tab('Three')).toBeFocused();
  await page.keyboard.press('Home');
  await expect(tab('One')).toBeFocused();
  await expect(list.locator('[tabindex="0"]')).toHaveCount(1);
});

test('React Dialog: opens as a modal, closes on Escape and outside, focus goes back', async ({ page }) => {
  await page.goto('/tests/react/fixture.html');
  const opener = page.getByRole('button', { name: 'Open the React dialog' });
  const dialog = page.getByRole('dialog', { name: 'A React dialog' });

  await opener.click();
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((el) => el.matches(':modal'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
  await expect(page.locator('[data-closed]')).toHaveText('1');

  await opener.click();
  await page.mouse.click(5, 5);
  await expect(dialog).toBeHidden();

  await opener.click();
  await dialog.getByRole('button', { name: 'Done' }).click();
  await expect(dialog).toBeHidden();
});
