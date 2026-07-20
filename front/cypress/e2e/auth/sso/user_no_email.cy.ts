import { fakeSSOGlobalSignup } from './utils';
import { confirmEmail } from '../../../support/auth';
import { randomEmail } from '../../../support/commands';

describe('SSO: user without email', () => {
  it('signs the user in after a round-trip through the fake OIDC provider', () => {
    fakeSSOGlobalSignup(cy, 'jane_doe');

    // Enter and confirm email
    const email = randomEmail();
    cy.get('#e2e-authentication-modal').get('input[type="email"]').type(email);
    cy.get('#e2e-built-in-fields-submit-button').click();
    confirmEmail(cy);

    // After confirming email, we expect to arrive on the success message
    cy.get('#e2e-authentication-modal').should('exist');
    cy.get('#e2e-sign-up-success-modal').should('exist');
  });

  it('shows error when trying to sign up with an email that already exists', () => {
    fakeSSOGlobalSignup(cy, 'jane_doe');

    const existingEmail = 'admin@govocal.com';
    cy.get('#e2e-authentication-modal')
      .get('input[type="email"]')
      .type(existingEmail);
    cy.get('#e2e-built-in-fields-submit-button').click();

    cy.get('#e2e-authentication-modal').should(
      'include.text',
      'An account with this email already exists'
    );
  });

  it('allows user to re-request a code', () => {
    fakeSSOGlobalSignup(cy, 'jane_doe');

    // Enter email
    const email = randomEmail();
    cy.get('#e2e-authentication-modal').get('input[type="email"]').type(email);
    cy.get('#e2e-built-in-fields-submit-button').click();

    // Re-request code
    cy.dataCy('resend-code').click();
    cy.get('#e2e-authentication-modal').should('include.text', 'New code sent');

    // Confirm email with the new code (which is always the same in the e2e env)
    confirmEmail(cy);

    // After confirming email, we expect to arrive on the success message
    cy.get('#e2e-authentication-modal').should('exist');
    cy.get('#e2e-sign-up-success-modal').should('exist');
  });

  it('allows user to change email', () => {
    fakeSSOGlobalSignup(cy, 'jane_doe');

    // Enter email
    const email = randomEmail();
    cy.get('#e2e-authentication-modal').get('input[type="email"]').type(email);
    cy.get('#e2e-built-in-fields-submit-button').click();

    // Go back to change email
    cy.get('#e2e-go-to-change-email').click();

    const newEmail = randomEmail();
    cy.get('#e2e-authentication-modal')
      .get('input[type="email"]')
      .type(newEmail);
    cy.get('#e2e-built-in-fields-submit-button').click();

    // Confirm email with the new code (which is always the same in the e2e env)
    confirmEmail(cy);

    // After confirming email, we expect to arrive on the success message
    cy.get('#e2e-sign-up-success-modal').should('exist');

    // Confirm user has new email
    cy.getAuthUser().then((user) => {
      expect(user.body.data.attributes.email).to.equal(newEmail);
    });
  });

  it('allows user to sign up, exit flow, and then return to the flow and confirm email', () => {
    fakeSSOGlobalSignup(cy, 'jane_doe');

    // Exit flow
    cy.get('.e2e-modal-close-button').click();

    // Re-enter flow
    cy.get('#e2e-user-menu-container').click();
    cy.get('#e2e-confirm-email-link > button').click();

    // Enter and confirm email
    const email = randomEmail();
    cy.get('#e2e-authentication-modal').get('input[type="email"]').type(email);
    cy.get('#e2e-built-in-fields-submit-button').click();
    confirmEmail(cy);

    // After confirming email, we expect to arrive on the success message
    cy.get('#e2e-authentication-modal').should('exist');
    cy.get('#e2e-sign-up-success-modal').should('exist');
  });
});
