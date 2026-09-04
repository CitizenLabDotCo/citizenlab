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

  // An address that already has an account is not a dead end for an email-less
  // SSO user: it offers to merge the two, confirmed by a code sent to that
  // account's inbox.
  it('merges into the existing account when the email is already taken', () => {
    const existingEmail = randomEmail();
    cy.apiSignup('Existing', 'User', existingEmail, 'democracy2.0');

    fakeSSOGlobalSignup(cy, 'jane_doe');

    cy.get('#e2e-authentication-modal')
      .get('input[type="email"]')
      .type(existingEmail);
    cy.get('#e2e-built-in-fields-submit-button').click();

    // The code goes to the other account's inbox, so the screen explains what
    // entering it will do before asking for it.
    cy.get('#e2e-authentication-modal').should(
      'include.text',
      'An account already uses'
    );
    confirmEmail(cy);

    cy.get('#e2e-sign-up-success-modal').should('exist');

    // Signed in as the account that survived, carrying the SSO verification.
    cy.getAuthUser().then((user) => {
      expect(user.body.data.attributes.email).to.eq(existingEmail);
      expect(user.body.data.attributes.verified).to.eq(true);
    });
  });

  // Whether the merge is allowed is only settled once the code has been entered -
  // deciding earlier would let anyone probe which addresses belong to admins. So
  // an admin target gets as far as the code screen and is refused there.
  it('refuses to merge into an admin account', () => {
    fakeSSOGlobalSignup(cy, 'jane_doe');

    cy.get('#e2e-authentication-modal')
      .get('input[type="email"]')
      .type('admin@govocal.com');
    cy.get('#e2e-built-in-fields-submit-button').click();

    confirmEmail(cy);

    cy.get('#e2e-authentication-modal').should(
      'include.text',
      'This account cannot be linked'
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
      .clear()
      .type(newEmail);
    cy.get('#e2e-change-email-submit-button').click();

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
    cy.get('#e2e-complete-registration-link > button').click();

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
