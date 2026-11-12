import { defineConfig } from 'cypress';

import config from './cypress.config';

export default defineConfig({
  ...config,
  // Keep the preview's iframe boundary checks intact. Cypress's default rewrite
  // treats them as frame-busting code and prevents isolation from starting.
  modifyObstructiveCode: false,
  e2e: {
    ...config.e2e,
    specPattern: 'cypress/phase_preview/**/*.cy.ts',
  },
});
