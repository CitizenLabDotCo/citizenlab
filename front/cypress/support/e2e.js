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
  cy.setCookie(
    'cl2_consent',
    '{%22analytics%22:false%2C%22advertising%22:false%2C%22functional%22:true%2C%22savedChoices%22:{%22google_tag_manager%22:false%2C%22matomo%22:false%2C%22google_analytics%22:false}}'
  );
});
