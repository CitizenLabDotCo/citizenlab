import { randomEmail } from '../../../support/commands';
import { fakeSSOSignup } from './utils';
import { confirmEmail, enterEmail } from '../../../support/auth';

describe('SSO: user with unconfirmed email', () => {
  it.only('signs the user in after a round-trip through the fake OIDC provider', () => {
    fakeSSOSignup(cy, 'tracy_smith');

    // Expect to be on email confirmation step
    confirmEmail(cy);

    // After confirming email, we expect to arrive on the success message
    cy.get('#e2e-authentication-modal').should('exist');
    cy.get('#e2e-sign-up-success-modal').should('exist');
  });

  it('allows user to re-request a code', () => {
    fakeSSOSignup(cy, 'tracy_smith');

    // Re-request code
    cy.dataCy('resend-code').click();
    cy.get('#e2e-authentication-modal').should('have.text', 'New code sent');

    // Confirm email with the new code (which is always the same in the e2e env)
    confirmEmail(cy);
  });

  it('allows user to change email', () => {
    fakeSSOSignup(cy, 'tracy_smith');

    // Go to change email screen
    cy.get('#e2e-go-to-change-email').click();

    // Enter new email and continue
    const newEmail = randomEmail();
    enterEmail(cy, newEmail);

    // Confirm email with the new code (which is always the same in the e2e env)
    confirmEmail(cy);

    // After confirming email, we expect to arrive on the success message
    cy.get('#e2e-sign-up-success-modal').should('exist');

    // Confirm user has new email
    cy.getAuthUser().its('data.attributes.email').should('equal', newEmail);
  });
});
