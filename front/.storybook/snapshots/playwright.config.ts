import { PlaywrightTestConfig, devices } from '@playwright/test';

const baseUrl = 'http://localhost:6006';

const config: PlaywrightTestConfig = {
  testDir: './test-runner',
  outputDir: './test-results',
  workers: undefined,
  timeout: 60 * 1000,
  use: {
    ignoreHTTPSErrors: true,
    video: {
      mode: 'off',
      size: { width: 800, height: 800 },
    },
    baseURL: baseUrl,
    trace: 'on',
    launchOptions: {
      // slowMo: 1 * 1000,
    },
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,
  },
  retries: 1,
  maxFailures: process.env.CI === 'true' ? 20 : undefined,
  updateSnapshots: 'none',
  expect: {
    toMatchSnapshot: {
      maxDiffPixels: 5,
    },
  },
  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'safari',
      use: {
        ...devices['Desktop Safari'],
      },
    },
    {
      name: 'iPhone 13 Pro',
      use: {
        ...devices['iPhone 13 Pro'],
      },
    },
    {
      name: 'Pixel 5',
      use: {
        ...devices['Pixel 5'],
      },
    },
  ],
  reporter: [
    [
      'html',
      {
        outputFolder: './test-report',
        open: 'never',
      },
    ],
    ['dot'],
    ['junit', { outputFile: './test-report/report.xml' }],
    ['json', { outputFile: './test-report/report.json' }],
  ],
};
export default config;
