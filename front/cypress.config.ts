import { defineConfig } from 'cypress';
import path from 'path';
const dotenv = require('dotenv');

dotenv.config({
  path: path.join(process.cwd(), 'cypress.env'),
});

export default defineConfig({
  viewportWidth: 1400,
  viewportHeight: 800,
  video: false,
  chromeWebSecurity: false,
  numTestsKeptInMemory: process.env.CYPRESS_NUM_TESTS_KEPT_IN_MEMORY
    ? Number(process.env.CYPRESS_NUM_TESTS_KEPT_IN_MEMORY)
    : 0,
  defaultCommandTimeout: 15000,
  retries: process.env.CYPRESS_RETRIES
    ? Number(process.env.CYPRESS_RETRIES)
    : 2,
  pageLoadTimeout: 15000,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config);
    },
    baseUrl: 'http://localhost:3000',
  },
});
