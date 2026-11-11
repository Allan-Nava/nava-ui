import { defineConfig } from '@playwright/test';

const desktop = { width: 1200, height: 900 };
const phone = { width: 390, height: 844 };

// The same tests run four times: two themes, two widths. The theme is driven
// through prefers-color-scheme, which is how the kit picks it without JS.
export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  snapshotPathTemplate: 'tests/__screenshots__/{projectName}/{arg}{ext}',
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' },
  },
  use: {
    baseURL: 'http://127.0.0.1:8765',
    browserName: 'chromium',
    deviceScaleFactor: 1,
  },
  projects: [
    { name: 'desktop-dark', use: { viewport: desktop, colorScheme: 'dark' } },
    { name: 'desktop-light', use: { viewport: desktop, colorScheme: 'light' } },
    { name: 'phone-dark', use: { viewport: phone, colorScheme: 'dark' } },
    { name: 'phone-light', use: { viewport: phone, colorScheme: 'light' } },
  ],
  webServer: {
    command: 'python3 -m http.server 8765 --bind 127.0.0.1',
    url: 'http://127.0.0.1:8765/index.html',
    reuseExistingServer: !process.env.CI,
  },
});
