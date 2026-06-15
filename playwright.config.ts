import { defineConfig, devices } from '@playwright/test'

/**
 * E2E config. Tests run against the *production build* served by `vite preview`
 * (base '/'), so they exercise the same bundle that ships to GitHub Pages.
 *
 * The `pretest:e2e` npm script runs `npm run build` before the suite (locally and
 * in CI), so the webServer only needs to boot preview — and even a reused local
 * preview server serves the freshly-built dist.
 */
const PORT = 4173
const baseURL = `http://localhost:${PORT}`
const isCI = !!process.env.CI

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run preview -- --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
})
