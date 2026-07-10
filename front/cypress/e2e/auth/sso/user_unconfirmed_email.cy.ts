import { randomEmail } from '../../../support/commands';
import { fakeSSOGlobalSignup } from './utils';
import { confirmEmail, enterEmail } from '../../../support/auth';

describe('SSO: user with unconfirmed email', () => {
  it('signs the user in after a round-trip through the fake OIDC provider', () => {
    fakeSSOGlobalSignup(cy, 'tracy_smith');

    // Expect to be on email confirmation step
    confirmEmail(cy);

    // After confirming email, we expect to arrive on the success message
    cy.get('#e2e-authentication-modal').should('exist');
    cy.get('#e2e-sign-up-success-modal').should('exist');
  });

  it('allows user to re-request a code', () => {
    fakeSSOGlobalSignup(cy, 'tracy_smith');

    // Re-request code
    cy.dataCy('resend-code').click();
    cy.get('#e2e-authentication-modal').should('include.text', 'New code sent');

    // Confirm email with the new code (which is always the same in the e2e env)
    confirmEmail(cy);
  });

  it('allows user to change email', () => {
    fakeSSOGlobalSignup(cy, 'tracy_smith');

    // Go to change email screen
    cy.get('#e2e-go-to-change-email').click();

    // Enter new email and continue
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
});

describe('SSO: user with unconfirmed email - edge cases', () => {
  beforeEach(() => {
    cy.goToLandingPage();
    cy.get('#e2e-navbar-login-menu-item').click();
    cy.get('#e2e-authentication-modal').should('exist');
  });

  it('works if user signs up, does not confirm email, then logs in with SSO with same confirmed email', () => {
    const email = randomEmail();

    // Create account with unconfirmed email
    enterEmail(cy, email);

    // Close modal, log out
    cy.get('.e2e-modal-close-button').first().click();
    cy.clearCookies();

    // Sign up through Fake SSO (return confirmed email)
    fakeSSOGlobalSignup(cy, 'john_doe', { email });

    // We expect to arrive on the success message
    cy.get('#e2e-sign-up-success-modal').should('exist');

    // Confirm that I can post idea
    cy.visit('/projects/an-idea-bring-it-to-your-council');
    cy.acceptCookies();
    cy.get('.e2e-idea-button').first().find('button').should('exist');
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/en/projects/an-idea-bring-it-to-your-council/ideas/new'
    );
  });

  it('works if user signs up, does not confirm email, then logs in with SSO with same unconfirmed email', () => {
    const email = randomEmail();

    // Create account with unconfirmed email
    enterEmail(cy, email);

    // Close modal, log out
    cy.get('.e2e-modal-close-button').first().click();
    cy.clearCookies();

    // Sign up through Fake SSO (return unconfirmed email)
    fakeSSOGlobalSignup(cy, 'tracy_smith', { email });

    // Confirm email
    confirmEmail(cy);

    // After confirming email, we expect to arrive on the success message
    cy.get('#e2e-sign-up-success-modal').should('exist');

    // Confirm that I can post idea
    cy.visit('/projects/an-idea-bring-it-to-your-council');
    cy.acceptCookies();
    cy.get('.e2e-idea-button').first().find('button').should('exist');
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/en/projects/an-idea-bring-it-to-your-council/ideas/new'
    );
  });

  it('allows user to sign up, exit flow, and then return to the flow and confirm email', () => {
    fakeSSOGlobalSignup(cy, 'jane_doe');

    // Exit flow
    cy.get('.e2e-modal-close-button').click();

    // Re-enter flow
    cy.get('#e2e-user-menu-container').click();
    cy.get('#e2e-confirm-email-link > button').click();

    // Confirm email
    confirmEmail(cy);

    // After confirming email, we expect to arrive on the success message
    cy.get('#e2e-authentication-modal').should('exist');
    cy.get('#e2e-sign-up-success-modal').should('exist');
  });
});
