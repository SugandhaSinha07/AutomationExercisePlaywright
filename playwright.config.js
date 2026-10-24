// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  /* Folder where Playwright looks for *.spec.js files */
  testDir: './tests',

  /* Max time for one whole test (default is 30s) */
  timeout: 60 * 1000,

  /* Max time for an expect() assertion to pass (default is 5s) */
  expect: {
    timeout: 10 * 1000,
  },

  /* Run tests inside a file in parallel too, not just different files */
  fullyParallel: true,

  /* Fail the build on CI if test.only was accidentally left in the code */
  forbidOnly: !!process.env.CI,

  /* Retry failed tests — the practice site sometimes times out or returns 520 errors.
     A test that passes on retry is reported as "flaky" so it is still visible. */
  retries: process.env.CI ? 2 : 1,

  /* Parallel workers: 1 on CI, 2 locally — more would overload the slow practice site */
  workers: process.env.CI ? 1 : 2,

  /* list = readable console output, html = report opened via `npx playwright show-report` */
  reporter: [['list'], ['html', { open: 'never' }]],

  /* Shared settings for every project below */
  use: {
    /* Lets tests call page.goto('/login') instead of the full URL */
    baseURL: 'https://automationexercise.com',

    /* Run without a visible browser window; use --headed to watch */
    headless: true,

    /* Max time for one action like click() or fill() (0 = no limit by default) */
    actionTimeout: 15 * 1000,

    /* Max time for page.goto() and other navigations */
    navigationTimeout: 30 * 1000,

    /* Debugging evidence — only kept when something goes wrong */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  /* Each project = the same tests run with different browser settings */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
