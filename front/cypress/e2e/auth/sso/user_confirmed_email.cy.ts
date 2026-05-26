import { fakeSSOSignup } from './utils';

describe('SSO: user with confirmed email', () => {
  it('signs the user in after a round-trip through the fake OIDC provider', () => {
    fakeSSOSignup(cy, 'john_doe');

    // In this case, we expect we arrive directly on the success message
    cy.get('#e2e-authentication-modal').should('exist');
    cy.get('#e2e-sign-up-success-modal').should('exist');
  });
});
