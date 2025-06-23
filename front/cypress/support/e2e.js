import 'cypress-axe';

import './commands';

Cypress.on('uncaught:exception', (error) => {
  // don't fail test when cypress encounteres a "ResizeObserver loop limit exceeded" uncaught exception
  if (/^[^(ResizeObserver loop limit exceeded)]/.test(error.message)) {
    return false;
  }

  return true;
});

beforeEach(() => {
  cy.intercept('**track_pageview**', {
    statusCode: 201,
    body: {
      success: true,
    },
  });
});
