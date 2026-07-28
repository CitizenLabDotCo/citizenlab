import { ProfileName, Overrides, fakeSSOAuth } from '../utils';

export const fakeSSOGlobalSignup = (
  cy: Cypress.Chainable,
  profileName: ProfileName,
  { email, sub }: Overrides = {}
) => {
  cy.visit('/');

  // Sanity check: no session cookie before the SSO flow starts.
  cy.getCookie('cl2_jwt').should('be.null');

  cy.get('#e2e-navbar-login-menu-item').click();

  fakeSSOAuth(cy, profileName, { email, sub });
};
