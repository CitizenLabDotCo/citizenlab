import { randomEmail, randomString } from '../../../support/commands';
import { fakeSSOGlobalSignup } from './utils';

describe('SSO: user with confirmed email', () => {
  it('signs the user in after a round-trip through the fake OIDC provider', () => {
    fakeSSOGlobalSignup(cy, 'john_doe');

    // In this case, we expect we arrive directly on the success message
    cy.get('#e2e-authentication-modal').should('exist');
    cy.get('#e2e-sign-up-success-modal').should('exist');
  });

  // A verified address is trusted, so the existing account is matched on it and
  // signed straight in. No code, and deliberately no merge prompt: there is only
  // ever one account here, not two to join.
  it('signs straight in to the existing account when the email is already taken', () => {
    const email = randomEmail();
    cy.apiSignup(randomString(), randomString(), email, randomString());

    fakeSSOGlobalSignup(cy, 'john_doe', { email });

    cy.get('#e2e-sign-up-success-modal').should('exist');

    cy.getAuthUser().then((user) => {
      expect(user.body.data.attributes.email).to.eq(email);
      expect(user.body.data.attributes.verified).to.eq(true);
    });
  });
});
